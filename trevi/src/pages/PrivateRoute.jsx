import { Navigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";

const PrivateRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("token");
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  const location = useLocation();

  // 🔹 Agora usamos um estado para garantir que sempre pegamos o valor atualizado do `profileCompleted`
  const [profileCompleted, setProfileCompleted] = useState(() => {
    return localStorage.getItem("profileCompleted") === "true";
  });
  

  useEffect(() => {
    const checkProfile = () => {
      const completed = localStorage.getItem("profileCompleted") === "true";
      console.log("🔄 Atualizando profileCompleted:", completed);
      setProfileCompleted(completed);
    };
  
    checkProfile();
  
    window.addEventListener("storage", checkProfile);
    window.addEventListener("focus", checkProfile);
  
    return () => {
      window.removeEventListener("storage", checkProfile);
      window.removeEventListener("focus", checkProfile);
    };
  }, []); // ✅ Adicionado para rodar apenas uma vez no mount
  

  console.log("📢 Estado Final de profileCompleted:", profileCompleted);

  // 🔹 Espera até que o estado seja definido antes de decidir o redirecionamento
  if (profileCompleted === null) {
    return null; // 🔥 Evita redirecionamento antes de saber o valor correto
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // 🔥 Admins SEMPRE podem acessar o painel administrativo
  if (isAdmin && location.pathname.startsWith("/admin-dashboard")) {
    return children;
  }

  // 🔥 Se não for admin e não tiver o perfil completo, redireciona para `/userProfile`
  if (!profileCompleted && !isAdmin) {
    return <Navigate to="/userProfile" />;
  }

  return children;

};

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default PrivateRoute;
