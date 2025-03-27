import React, { useEffect, useState } from "react";
import "./Orders.css";
import Header from "../header/header.jsx";
import Footer from "../footer/footer.jsx";
import { toast } from "react-toastify";

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        const userId = localStorage.getItem("userId");

        if (!userId) {
            toast.error("Usuário não autenticado. Faça login para ver seus pedidos.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`http://localhost:3010/orders/${userId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (!response.ok) {
                throw new Error("Erro ao buscar pedidos.");
            }

            const data = await response.json();
            setOrders(data);
        } catch (error) {
            console.error("Erro ao buscar pedidos:", error);
            toast.error("Erro ao carregar seus pedidos.");
        } finally {
            setLoading(false);
        }
    };

    const isDeletable = (status) => {
        return !(status.toLowerCase() === "aprovado" || status.toLowerCase() === "cancelado" || status.toLowerCase() === "negado");
    };

    return (
        <section className="orders-page">
            <header className="empty-header">
                <Header />
            </header>

            <div className="container">
                <h2 className="orders-title">Meus Pedidos</h2>

                {loading ? (
                    <p className="loading-text">Carregando pedidos...</p>
                ) : orders.length === 0 ? (
                    <div className="empty-orders-container">
                        <div className="empty-orders">
                            <h2 className="empty-orders-text">Você ainda não tem pedidos.</h2>
                            <button className="empty-orders-button" onClick={() => window.location.href = '/home'}>
                                Compre Agora
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table className="line-item-table">
                            <thead>
                                <tr>
                                    <th>Pedido</th>
                                    <th className="table__cell--center">Total</th>
                                    <th className="table__cell--right">Status</th>
                                    <th className="table__cell--right">Data</th>
                                    <th className="table__cell--right">Ação</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order, index) => (
                                    <tr key={index} className="line-item">
                                        <td className="line-item__order-info">
                                            <div className="line-item__meta">
                                                <span className="line-item__title">{order.orderName || "Pedido sem Nome"}</span>
                                            </div>
                                        </td>
                                        <td className="table__cell--center">
                                            <span className="line-item__price">
                                                R$ {order.totalPrice.toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="table__cell--right">
                                            <span className={`order-status ${order.status.toLowerCase()}`}>
                                                {order.status || "Pendente"}
                                            </span>
                                        </td>
                                        <td className="table__cell--right">
                                            {new Date(order.createdAt).toLocaleString()}
                                        </td>
                                        <td className="table__cell--right">
                                            <button
                                                className="order-details-button"
                                                onClick={() => window.location.href = `/order/${order.id}`}
                                            >
                                                Ver Detalhes
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <footer>
                <Footer />
            </footer>
        </section>
    );
};

export default Orders;
