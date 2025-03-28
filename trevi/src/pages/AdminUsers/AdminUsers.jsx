import React, { useEffect, useState } from "react";
import "./AdminUsers.css";
import { useNavigate } from "react-router-dom";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/users`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });        

        if (!response.ok) {
          throw new Error("Erro ao buscar usuários");
        }

        const usersData = await response.json();

        // Buscar informações do admin que cadastrou cada usuário
        const usersWithAdminNames = await Promise.all(
          usersData.map(async (user) => {
            if (user.createdBy) {
              const adminResponse = await fetch(
                `${import.meta.env.VITE_API_URL}/users/${user.createdBy}`,
                {
                  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                }
              );              

              if (adminResponse.ok) {
                const adminData = await adminResponse.json();
                return { ...user, adminName: adminData.name }; // Adiciona o nome do admin
              }
            }
            return { ...user, adminName: "Desconhecido" }; // Caso não tenha um admin registrado
          })
        );

        setUsers(usersWithAdminNames);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Tem certeza que deseja excluir este usuário?")) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });      

      if (!response.ok) {
        throw new Error("Erro ao excluir usuário");
      }

      setUsers(users.filter((user) => user.id !== userId));
      alert("Usuário excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
      alert("Erro ao excluir usuário. Tente novamente.");
    }
  };

  const handleLevelChange = async (userId, newLevel) => {
    const parsedLevel = parseInt(newLevel, 10);
  
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ level: parsedLevel }),
      });      
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao atualizar nível do usuário");
      }
  
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, level: parsedLevel } : user
        )
      );
  
      alert("Nível do usuário atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar nível do usuário:", error);
      alert("Erro ao atualizar nível. Tente novamente.");
    }
  };
  
  return (
    <div className="container">
      <h2 className="cart-title">Lista de Usuários</h2>
      <div className="table-wrapper">
        <table className="line-item-table">
          <thead>
            <tr>
              <th>Responsável pelo Cadastro</th> {/* Nova coluna */}
              <th>Nome</th>
              <th>Email</th>
              <th>Telefone</th>
              <th>Tipo</th>
              <th>Nível</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="line-item">
                 <td>{user.adminName}</td> {/* Nome do admin que criou */}
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.phone || "Não informado"}</td>
                <td>{user.isAdmin ? "Admin" : "Usuário"}</td>
                <td>
                  <select
                    className="level-select"
                    value={user.level}
                    onChange={(e) => handleLevelChange(user.id, e.target.value)}
                  >
                    <option value="1">Nível 1</option>
                    <option value="2">Nível 2</option>
                    <option value="3">Nível 3</option>
                    <option value="4">Nível 4</option>
                    <option value="5">Nível 5</option>
                  </select>
                </td>
                <td>
                  <button
                    className="action-button edit"
                    onClick={() => navigate(`/userProfile/${user.id}`)}
                  >
                    Editar
                  </button>
                  <button
                    className="action-button delete"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
