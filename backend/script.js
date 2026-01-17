import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import csvParser from 'csv-parser';

// إعداد Supabase
const supabaseUrl = 'https://YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_SERVICE_ROLE_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

// ملفات CSV
const results = [];

fs.createReadStream('data.csv')
    .pipe(csvParser())
    .on('data', (row) => results.push(row))
    .on('end', async () => {
        console.log('CSV Loaded. Processing...');
        for (const row of results) {
            const brandName = row.Brand.trim();
            const modelName = row.Model.trim();
            const subModelName = row.SubModel ? row.SubModel.trim() : null;
            const isActive = row.isActive === 'true';

            // 1️⃣ تحقق من Brand
            let { data: brandData, error: brandError } = await supabase
                .from('Brands')
                .select('*')
                .eq('name', brandName)
                .limit(1)
                .single();

            let brand_id;
            if (!brandData) {
                const { data: newBrand } = await supabase
                    .from('Brands')
                    .insert([{ name: brandName }])
                    .select()
                    .single();
                brand_id = newBrand.id;
            } else {
                brand_id = brandData.id;
            }

            // 2️⃣ تحقق من Model
            let { data: modelData } = await supabase
                .from('Models')
                .select('*')
                .eq('name', modelName)
                .eq('brand_id', brand_id)
                .limit(1)
                .single()
                .catch(() => ({ data: null }));

            let model_id;
            if (!modelData) {
                const { data: newModel } = await supabase
                    .from('Models')
                    .insert([{ name: modelName, brand_id, isActive }])
                    .select()
                    .single();
                model_id = newModel.id;
            } else {
                model_id = modelData.id;
            }

            // 3️⃣ أضف SubModel إذا موجود
            if (subModelName) {
                await supabase
                    .from('SubModels')
                    .insert([{ name: subModelName, model_id, isActive }]);
            }

            console.log(`Processed: ${brandName} → ${modelName} → ${subModelName || 'No SubModel'}`);
        }

        console.log('All data imported successfully!');
    });
