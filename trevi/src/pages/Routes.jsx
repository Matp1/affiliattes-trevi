import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CadastroUsuario from './cadastro/index';
import LoginUsuario from './login/index';
import PaginaPrincipal from './home/index';
import PrivateRoute from './PrivateRoute';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginUsuario />} />
        <Route path="/cadastro" element={<CadastroUsuario />} />
        <Route 
          path="/home" 
          element={
            <PrivateRoute>
              <PaginaPrincipal />
            </PrivateRoute>
          } 
        />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
