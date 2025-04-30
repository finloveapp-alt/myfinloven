import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// URL e chave anônima do Supabase
const supabaseUrl = 'https://lifdbkzedjbmfatbhzuy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpZmRia3plZGpibWZhdGJoenV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM3Njc4MjksImV4cCI6MjA1OTM0MzgyOX0.IVNt5L9vaq5-VFMYfQ5vbZXhvJQEYxMV19dUuKnpqfk';

// Cria o cliente do Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Componente para uso com import padrão
const SupabaseClient = {
  client: supabase
};

export default SupabaseClient; 