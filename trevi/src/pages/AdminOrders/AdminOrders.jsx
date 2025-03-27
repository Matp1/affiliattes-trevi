import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../cartPage/CartPage.css"; // Reaproveitando estilos do carrinho

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get("http://localhost:3010/admin/orders", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        const ordersData = response.data;

        // 🔹 Buscar o responsável pelo cadastro de cada usuário que fez um pedido
        const ordersWithAdminNames = await Promise.all(
          ordersData.map(async (order) => {
            if (order.user && order.user.createdBy) {
              try {
                const adminResponse = await axios.get(
                  `http://localhost:3010/users/${order.user.createdBy}`,
                  {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                  }
                );

                if (adminResponse.status === 200) {
                  const adminData = adminResponse.data;
                  return { ...order, adminName: adminData.name }; // Adiciona o nome do admin
                }
              } catch (error) {
                console.error("Erro ao buscar responsável pelo cadastro:", error);
              }
            }
            return { ...order, adminName: "Desconhecido" }; // Se não houver admin, exibe "Desconhecido"
          })
        );

        setOrders(ordersWithAdminNames);
      } catch (error) {
        console.error("Erro ao buscar pedidos:", error);
      }
    };

    fetchOrders();
  }, []);


  // Função para formatar a data de criação
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR") + " " + date.toLocaleTimeString("pt-BR");
  };

  // Função para atualizar o status do pedido
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.put(
        `http://localhost:3010/orders/${orderId}`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      setOrders(orders.map(order => order.id === orderId ? { ...order, status: newStatus } : order));
      alert("Status atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      alert("Erro ao atualizar status do pedido.");
    }
  };

  return (
    <div className="container">
      <h2 className="cart-title">Gerenciar Pedidos</h2>
      <div className="cart-content">
        <div className="table-wrapper">
          <table className="line-item-table">
           
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Nome do Pedido</th>
                <th>ADM Responsável</th> {/* Nova coluna */}
                <th>Data</th>
                <th>Total</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="line-item">
                  <td>{order.user?.name || "Usuário Desconhecido"}</td>
                  <td>{order.orderName || "Sem Nome"}</td>
                  <td>{order.adminName}</td> {/* Nome do admin que criou o usuário */}
                  <td>{formatDate(order.createdAt)}</td>
                  <td className="line-item__price">R$ {order.totalPrice.toFixed(2)}</td>
                  <td className={`status ${order.status.toLowerCase()}`}>{order.status}</td>
                  <td>
                    <button
                      className="action-button view"
                      onClick={() => {
                        console.log("Redirecionando para:", `/order-details/${order.id}`);
                        navigate(`/order-details/${order.id}`);
                      }}
                    >
                      Ver Detalhes
                    </button>

                    <select
                      className="status-select"
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    >
                      <option value="Pendente">Pendente</option>
                      <option value="Aprovado">Aprovado</option>
                      <option value="Negado">Negado</option>
                      <option value="Cancelado">Cancelado</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
