// @ts-nocheck


import { Button, MenuItem, Select } from '@mui/material';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { useForm } from "react-hook-form"
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { useState, useEffect } from "react";
import supabase from "../../config/supabase";




export function Input() {
    const [open, setOpen] = useState(false);

    const [selectedBrand, setSelectedBrand] = useState(null);
    const [selectedFamily, setSelectedFamily] = useState(null);
    const [selectedModel, setSelectedModel] = useState(null);



    const [brands, setBrands] = useState([]);
    const [families, setFamilies] = useState([]);
    const [models, setModels] = useState([]);

    useEffect(() => {
        const fetchBrand = async () => {
            const { data, error } = await supabase.from("brands").select();
            if (error) return console.log("Brand error:", error);
            setBrands(data);
        };

        const fetchFamilies = async () => {
            const { data, error } = await supabase.from("families").select();
            if (error) return console.log("Families error:", error);
            setFamilies(data);
        };

        const fetchModels = async () => {
            const { data, error } = await supabase.from("models").select();
            if (error) return console.log("Models error:", error);
            setModels(data);
        };

        fetchBrand();
        fetchFamilies();
        fetchModels();
    }, []);





    // العائلات الخاصة بالبراند المختار
    const filteredFamilies = families.filter(f => f.brand === selectedBrand);

    // الموديلات الخاصة بالفاميلي المختار
    const filteredModels = models.filter(m => m.family === selectedFamily);






    const handleClick = () => {
        setOpen(true);
    };

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpen(false);
    };


    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm()

    const onSubmit = (data) => handleClick()

    return (
        <Box
            onSubmit={handleSubmit(onSubmit)}
            component="form"
            sx={{ display: "flex", flexDirection: "column", gap: 3 }}
            noValidate
            autoComplete="off"
        >


        




            {/* Brand Dropdown */}
            <Select
            
{...register("brand", { required: true,  })}
                helperText={errors.parça ? "eksik veri" : null}
                error={errors.parça}

            variant="filled" value={selectedBrand || ""} onChange={e => {
                setSelectedBrand(Number(e.target.value));
                setSelectedFamily(null); // إعادة تعيين العائلة عند تغيير البراند
                setSelectedModel(null);  // إعادة تعيين الموديل
            }}>
                <MenuItem value="">select brand</MenuItem>
                {brands.map(b => (
                    <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
                ))}
            </Select>

            {/* Family Dropdown */}
            <Select 
            
            {...register("family", { required: true,  })}
                helperText={errors.parça ? "eksik veri" : null}
                error={errors.parça}
            variant="filled" value={selectedFamily || ""} onChange={e => {
                setSelectedFamily(Number(e.target.value));
                setSelectedModel(null); // إعادة تعيين الموديل عند تغيير العائلة
            }} disabled={!selectedBrand}>
                <MenuItem value="">select family</MenuItem>
                {filteredFamilies.map(f => (
                    <MenuItem key={f.id} value={f.id}>{f.name}</MenuItem>
                ))}
            </Select>

            {/* Model Dropdown */}
            <Select variant="filled" value={selectedModel || ""}
                
                {...register("model", { required: true,  })}
                helperText={errors.parça ? "eksik veri" : null}
                error={errors.parça}

                onChange={e => setSelectedModel(Number(e.target.value))} disabled={!selectedFamily}>
                <MenuItem value="">select model</MenuItem>
                {filteredModels.map(m => (
                    <MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>
                ))}
            </Select>












           



            <TextField
                {...register("parça", { required: true, minLength: 3 })}
                helperText={errors.parça ? "eksik veri" : null}
                error={errors.parça}
                label="parça" variant="filled" />

            <TextField
                {...register("kalite", { required: true, minLength: 3 })}
                helperText={errors.kalite ? "eksik veri" : null}
                error={errors.kalite}
                label="kalite" variant="filled" />

            <TextField

                {...register("marka", { required: true, minLength: 3 })}
                helperText={errors.marka ? "eksik veri" : null}
                error={errors.marka}
                label="marka" variant="filled" />

            <TextField
                {...register("adet", { required: true, minLength: 3 })}
                helperText={errors.adet ? "eksik veri" : null}
                error={errors.adet}
                label="adet" variant="filled" />

            <TextField
                {...register("fiyat", { required: true, minLength: 3 })}
                helperText={errors.fiyat ? "eksik veri" : null}
                error={errors.fiyat}
                label="fiyat" variant="filled" />

            <Box textAlign={"right"}>
                <Button

                    type='submit' sx={{ textTransform: "capitalize" }}>
                    create new user
                </Button>

                <Snackbar
                    anchorOrigin={{ vertical: "bottom", horizontal: "center" }}

                    open={open}
                    open={open} autoHideDuration={6000} onClose={handleClose}>
                    <Alert
                        onClose={handleClose}
                        severity="info"
                        variant="filled"
                        sx={{ width: '100%' }}
                    >
                        başaryla gönderildi
                    </Alert>
                </Snackbar>


            </Box>


        </Box>
    )
}