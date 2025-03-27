import React from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="admin-dashboard">
      <h1>Painel Administrativo</h1>
      <div className="admin-menu">
        <button onClick={() => navigate("/admin-users")}>Gerenciar Usuários</button>
        <button onClick={() => navigate("/admin-products")}>Gerenciar Produtos</button>
        <button onClick={() => navigate("/admin-orders")}>Gerenciar Pedidos</button>
        <button onClick={() => navigate("/produtos/cadastro")}>Cadastrar Produtos</button>
        <button onClick={() => navigate("/cadastro")}>Cadastrar Usuário</button>
      </div>
    </div>
  );
};

export default AdminDashboard;
