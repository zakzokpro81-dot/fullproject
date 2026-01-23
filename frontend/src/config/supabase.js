
import { createClient } from '@supabase/supabase-js'
const supabaseUrl =import.meta.env.VITE_APP_SUPABASE_URL
//const supabaseUrl = "https://exxqdyejsaegkqxdvfhn.supabase.co"
//const supabaseUrl = "https://igrimqmpcjtkavabtjcr.supabase.co"
const supabaseKey =import.meta.env.VITE_APP_SUPABASE_KEY
//const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4eHFkeWVqc2FlZ2txeGR2ZmhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2MzM0NTIsImV4cCI6MjA4NDIwOTQ1Mn0.lR9pZZ64dbgr2RVoomFYoZSzTefUg9GxfPVCLRTPe-c"
//const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlncmltcW1wY2p0a2F2YWJ0amNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2NzIzMTAsImV4cCI6MjA3NjI0ODMxMH0.Hl5iGqNNr_lj9gXfi5kvf7g036B6XTjWpphH9gVoido"
const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase