import supabase from '../config/supabase.js';

(async function inspectDatabase() {
  try {
    // Fetch all tables
    const { data: tables, error: tablesError } = await supabase
      .from('pg_tables')
      .select('*')
      .eq('schemaname', 'public');

    if (tablesError) {
      console.error('Error fetching tables:', tablesError);
      return;
    }

    console.log('Tables:', tables);

    // Fetch relationships
    const { data: relationships, error: relationshipsError } = await supabase
      .from('pg_constraint')
      .select('*');

    if (relationshipsError) {
      console.error('Error fetching relationships:', relationshipsError);
      return;
    }

    console.log('Relationships:', relationships);
  } catch (error) {
    console.error('Unexpected error:', error);
  }
})();