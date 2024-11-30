import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
//import Cadastro from './pages/cadastro/index.jsx'
import AppRoutes from './pages/Routes.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppRoutes  />
  </StrictMode>,
)
