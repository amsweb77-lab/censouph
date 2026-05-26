import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const isValidUrl = supabaseUrl && supabaseUrl.startsWith('http')

export const supabase = createClient(
  isValidUrl ? supabaseUrl : 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
)
