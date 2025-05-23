import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wozdxvknegdophxocbhw.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvemR4dmtuZWdkb3BoeG9jYmh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2NTE4NDEsImV4cCI6MjA2MzIyNzg0MX0.EQrBRda7WMT3Uwi7eFjYWHEYxQ3h_SWASrUCVclxuXU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
