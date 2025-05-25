
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Runtime env check
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.error("Missing Supabase env vars - VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not found");
  console.log("Current env vars:", {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL ? 'SET' : 'MISSING',
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'MISSING'
  });
} else {
  console.log("Supabase env vars are properly configured");
}

createRoot(document.getElementById("root")!).render(<App />);
