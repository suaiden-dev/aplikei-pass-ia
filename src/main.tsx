import './index.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from './contexts/AuthContext'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          closeButton
          toastOptions={{
            style: {
              background: "#0F172A",
              color: "#F8FAFC",
              border: "1px solid rgba(255,255,255,0.08)",
              fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
              fontSize: "14px",
              fontWeight: "500",
              borderRadius: "12px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            },
            classNames: {
              success: "!border-l-4 !border-l-[#1a56db]",
              error: "!border-l-4 !border-l-red-500",
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
