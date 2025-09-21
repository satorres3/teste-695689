import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cqzfwnyhxmmasjannfvx.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxemZ3bnloeG1tYXNqYW5uZnZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyNjUzODIsImV4cCI6MjA3Mzg0MTM4Mn0.pAxuYEK7LplmfQRTDNLPQ_0E0FTIPDygXZVAx6yv4b0'

if (!supabaseUrl) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL')
}

if (!supabaseAnonKey) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)