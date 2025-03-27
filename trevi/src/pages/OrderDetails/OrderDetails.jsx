import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./OrderDetails.css";
import Header from "../header/header.jsx";
import Footer from "../footer/footer.jsx";
import { toast } from "react-toastify";

const OrderDetails = () => {
    const { id } = useParams(); // Obtém o ID do pedido da URL
    const navigate = useNavigate();
    const [order, setOrder] = useState({
        id: "",
        orderName: "",
        items: [],
        totalPrice: 0,
        adress: {  // ✅ Inicializa `adress` com valores padrão
            cep: "",
            rua: "",
            numero: "",
            complemento: "",
            bairro: "",
            cidade: "",
            estado: "",
            referencia: "",
        },
        status: "Pendente",
        createdAt: "",
    });

    const [loading, setLoading] = useState(true);
    const [modified, setModified] = useState(false); // Estado para controlar alterações
    const isEditable = order && !(order.status.toLowerCase() === "aprovado" || order.status.toLowerCase() === "cancelado" || order.status.toLowerCase() === "negado");
    const [userLevel, setUserLevel] = useState(1); // Nível padrão do usuário
    const [orderAddress, setOrderAddress] = useState(order.adress || {
        cep: "",
        rua: "",
        numero: "",
        complemento: "",
        bairro: "",
        cidade: "",
        estado: "",
        referencia: "",
    });

    useEffect(() => {
        fetchOrderDetails();
    }, []);

    useEffect(() => {
        if (order && order.userId) {  // ✅ Agora só chama a função se `order` não for null
            fetchUserLevel(order.userId);
        }
    }, [order]);

    // Atualizar os valores dos inputs
    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setOrderAddress((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Função para salvar as alterações no backend
    const handleSaveAddress = async () => {
        try {
            const response = await fetch(`http://localhost:3010/orders/${order.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ adress: orderAddress }),
            });

            if (!response.ok) {
                throw new Error("Erro ao atualizar endereço.");
            }

            alert("Endereço atualizado com sucesso!");
        } catch (error) {
            console.error("Erro ao atualizar endereço:", error);
            alert("Erro ao atualizar endereço.");
        }
    };

    const fetchUserLevel = async (userId) => {
        if (!userId) return; // ✅ Evita erro se `userId` for undefined

        try {
            const response = await fetch(`http://localhost:3010/users/${userId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (!response.ok) {
                throw new Error("Erro ao buscar nível do usuário.");
            }

            const userData = await response.json();
            setUserLevel(userData.level);
        } catch (error) {
            console.error("Erro ao buscar nível do usuário:", error);
        }
    };

    useEffect(() => {
        if (order && order.items) {
            const commissionMultiplier = 1 + ((order?.commission || 0) / 100);

            const updatedItems = order.items.map(item => ({
                ...item,
                priceWithCommission: parseFloat(item.price) * commissionMultiplier || parseFloat(item.price) || 0, // Garante que o preço base esteja correto
            }));

            setOrder(prev => ({
                ...prev,
                items: updatedItems,
                totalPrice: updatedItems.reduce((total, item) => total + (item.priceWithCommission * item.quantity), 0),
            }));
        }
    }, [order?.commission]);

    useEffect(() => {
        if (order && order.adress) {
            setOrderAddress(order.adress); // 🔹 Atualiza os inputs com os dados do pedido
        }
    }, [order]); // ✅ Executa sempre que `order` for atualizado



    const calculateCommission = () => {
        const MAX_COMMISSION_BY_LEVEL = { 1: 10, 2: 20, 3: 30, 4: 40, 5: 100 };
        return MAX_COMMISSION_BY_LEVEL[userLevel] || 0;
    };

    const calculateTotal = () => {
        if (!order || !order.items) return 0; // ✅ Evita erro se `order` não estiver carregado
        const commissionPercentage = calculateCommission();
        const commissionMultiplier = 1 + commissionPercentage / 100;
        return order.items.reduce(
            (total, item) => total + item.price * item.quantity * commissionMultiplier,
            0
        );
    };




    const fetchOrderDetails = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:3010/orders/details/${id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (!response.ok) {
                throw new Error("Erro ao buscar detalhes do pedido.");
            }

            const data = await response.json();

            if (!data) {
                throw new Error("Dados do pedido inválidos.");
            }

            // 🛠️ Garante que `items` seja um array e que cada item tenha um preço válido
            const formattedOrder = {
                ...data,
                items: Array.isArray(data.items) ? data.items.map(item => ({
                    ...item,
                    price: parseFloat(item.price) || 0, // Se o preço for null ou undefined, define como 0
                })) : [],
            };

            setOrder(formattedOrder);
        } catch (error) {
            console.error("Erro ao buscar detalhes do pedido:", error);
            toast.error("Erro ao carregar detalhes do pedido.");
        } finally {
            setLoading(false);
        }
    };

    const handleQuantityChange = (index, value) => {
        if (value < 1) return;
        const updatedOrder = { ...order };
        updatedOrder.items[index].quantity = value;
        setOrder(updatedOrder);
        setModified(true); // Habilita o botão de salvar alterações
    };

    const handleRemoveItem = (index) => {
        if (!isEditable) return;

        const confirmDelete = window.confirm("Tem certeza que deseja remover este produto do pedido?");

        if (!confirmDelete) {
            return; // 🔹 Se o usuário clicar em "Não", interrompe a remoção
        }

        const updatedOrder = { ...order };
        updatedOrder.items.splice(index, 1);
        setOrder(updatedOrder);
        setModified(true);
    };



    const saveOrderChanges = async () => {
        try {
            const response = await fetch(`http://localhost:3010/orders/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    status: order.status,
                    items: order.items.map(item => ({
                        ...item,
                        priceWithCommission: isNaN(item.priceWithCommission) ? 0 : item.priceWithCommission
                    })),
                    totalPrice: order.items.reduce((total, item) => total + ((isNaN(item.priceWithCommission) ? 0 : item.priceWithCommission) * item.quantity), 0),
                    commission: order.commission || 0,
                }),
            });

            if (!response.ok) {
                throw new Error("Erro ao salvar alterações.");
            }

            toast.success("Alterações salvas com sucesso!");

            fetchOrderDetails(); // 🆕 Recarrega os dados após salvar
        } catch (error) {
            console.error("Erro ao salvar alterações:", error);
            toast.error("Erro ao salvar alterações. Tente novamente.");
        }
    };

    const deleteOrder = async () => {
        if (!isEditable) return;
        if (!window.confirm("Tem certeza que deseja excluir este pedido?")) return;

        try {
            const response = await fetch(`http://localhost:3010/orders/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (!response.ok) {
                throw new Error("Erro ao excluir pedido.");
            }

            toast.success("Pedido excluído com sucesso!");
            navigate("/orders"); // Redireciona para a lista de pedidos
        } catch (error) {
            console.error("Erro ao excluir pedido:", error);
            toast.error("Erro ao excluir pedido. Tente novamente.");
        }
    };

    const handleCommissionChange = async (e) => {
        if (!isEditable) return;
    
        let newCommission = parseFloat(e.target.value);
    
        if (isNaN(newCommission) || newCommission < 0) {
            toast.warning("A comissão não pode ser negativa!");
            return;
        }
    
        if (!order.userId) {
            console.error("Erro: userId do pedido está indefinido.");
            toast.error("Erro ao buscar limite de comissão. ID do usuário não encontrado.");
            return;
        }
    
        // Buscar o limite de comissão do usuário no backend
        try {
            const response = await fetch(`http://localhost:3010/commission/${order.userId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
    
            if (!response.ok) {
                throw new Error("Erro ao buscar limite de comissão.");
            }
    
            const { maxCommission } = await response.json();
    
            // Se a comissão for maior que o permitido, bloquear a alteração
            if (newCommission > maxCommission) {
                toast.error(`A comissão máxima permitida para o seu nível é de ${maxCommission}%.`);
                return;
            }
    
            // Buscar preços corretos dos produtos no banco de dados
            const updatedItems = await Promise.all(
                order.items.map(async (item) => {
                    try {
                        const productResponse = await fetch(`http://localhost:3010/products/${item.productId}`, {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${localStorage.getItem("token")}`,
                            },
                        });
    
                        if (!productResponse.ok) throw new Error("Erro ao buscar produto");
    
                        const productData = await productResponse.json();
                        const basePrice = parseFloat(productData.price) || 0; // Pegamos o preço original do banco
    
                        return {
                            ...item,
                            price: basePrice,
                            priceWithCommission: basePrice * (1 + newCommission / 100),
                        };
                    } catch (error) {
                        console.error(`Erro ao buscar preço do produto ${item.productId}:`, error);
                        return { ...item };
                    }
                })
            );
    
            const updatedOrder = {
                ...order,
                commission: newCommission,
                items: updatedItems,
                totalPrice: updatedItems.reduce((total, item) => total + (item.priceWithCommission * item.quantity), 0),
            };
    
            setOrder(updatedOrder);
            setModified(true);
        } catch (error) {
            console.error("Erro ao buscar limite de comissão:", error);
            toast.error("Erro ao buscar limite de comissão.");
        }
    };
    
    const isAdmin = localStorage.getItem("isAdmin") === "true";
    if (!order || !order.adress) {
        return <p>Carregando detalhes do pedido...</p>;
    }

    return (
        <section className="order-details-page">
            <header className="empty-header">
                <Header />
                <div className="order-actions">
                    <button className="delete-order-button" onClick={deleteOrder} disabled={!isEditable}>
                        Excluir Pedido
                    </button>
                    <button
                        className={`save-changes-button ${modified ? "enabled" : "disabled"}`}
                        onClick={saveOrderChanges}
                        disabled={!modified}
                    >
                        Salvar Alterações
                    </button>
                </div>
            </header>

            <div className="container">
                <h2 className="order-details-title">
                    {isAdmin ? `Detalhes do Pedido - ${order.orderName} (Admin)` : `Detalhes do Pedido - ${order.orderName}`}
                </h2>

                {loading ? (
                    <p className="loading-text">Carregando...</p>
                ) : order ? (
                    <div className="table-wrapper">
                        <table className="line-item-table">
                            <thead>
                                <tr>
                                    <th>SKU</th>
                                    <th>Produto</th>
                                    <th>Cor</th>
                                    <th>Tamanho</th>
                                    <th className="table__cell--center">Quantidade</th>
                                    <th className="table__cell--right">Preço</th>
                                    <th className="table__cell--right">Ação</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items.map((item, index) => {
                                    return (
                                        <tr key={index} className="line-item">
                                            <td>
                                                <div>{item.sku || "N/A"}</div>
                                            </td>
                                            <td className="line-item__product-info">
                                                <div className="line-item__product-info-wrapper">
                                                    <div className="line-item__image-wrapper">
                                                        <img
                                                            src={item.imageUrl && item.imageUrl.trim() !== "" ? item.imageUrl : "https://dummyimage.com/80x80/cccccc/ffffff&text=Sem+Imagem"}
                                                            alt={item.name}
                                                            className="line-item__image"
                                                        />
                                                    </div>
                                                    <div className="line-item__meta">
                                                        <span className="line-item__title">{item.name}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* 🔹 Exibir apenas a cor e o tamanho escolhidos */}
                                            <td className="table__cell--center">{item.selectedColor || "N/A"}</td>
                                            <td className="table__cell--center">{item.selectedSize || "N/A"}</td>

                                            <td className="table__cell--center">
                                                <div className="quantity-selector">
                                                    <button
                                                        onClick={() => handleQuantityChange(index, item.quantity - 1)}
                                                        disabled={!isEditable}
                                                    >-</button>
                                                    <input
                                                        type="number"
                                                        value={item.quantity}
                                                        min="1"
                                                        onChange={(e) => handleQuantityChange(index, Number(e.target.value))}
                                                        className="quantity-selector__value"
                                                        disabled={!isEditable}
                                                    />
                                                    <button
                                                        onClick={() => handleQuantityChange(index, item.quantity + 1)}
                                                        disabled={!isEditable}
                                                    >+</button>
                                                </div>
                                            </td>
                                            <td className="table__cell--right">
                                                R$ {(parseFloat(item.priceWithCommission || item.price) * item.quantity).toFixed(2)}
                                            </td>
                                            <td className="table__cell--right">
                                                <button className="remove-item-button" onClick={() => handleRemoveItem(index)} disabled={!isEditable} >❌</button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        <div className="commission-details-container">
                            <label>Comissão do Pedido (%):</label>
                            <input
                                type="number"
                                className="profile-input commission-input"
                                placeholder="Defina a comissão"
                                value={order.commission || ""}
                                onChange={handleCommissionChange}
                                min="0"  // 🚫 Impede valores negativos
                                disabled={!isEditable}
                            />
                        </div>

                        <div className="order-address">
                            <h3>Endereço de Entrega</h3>
                            <div className="address-container">
                                <div className="input-group">
                                    <label>CEP</label>
                                    <input
                                        type="text"
                                        name="cep"
                                        value={orderAddress?.cep || ""}
                                        onChange={handleAddressChange}
                                        className="profile-input"
                                    />
                                </div>

                                <div className="input-group">
                                    <label>Rua</label>
                                    <input
                                        type="text"
                                        name="rua"
                                        value={orderAddress?.rua}
                                        onChange={handleAddressChange}
                                        className="profile-input"
                                    />
                                </div>

                                <div className="input-group">
                                    <label>Número</label>
                                    <input
                                        type="text"
                                        name="numero"
                                        value={orderAddress?.numero}
                                        onChange={handleAddressChange}
                                        className="profile-input"
                                    />
                                </div>

                                <div className="input-group">
                                    <label>Complemento</label>
                                    <input
                                        type="text"
                                        name="complemento"
                                        value={orderAddress?.complemento}
                                        onChange={handleAddressChange}
                                        className="profile-input"
                                    />
                                </div>

                                <div className="input-group">
                                    <label>Bairro</label>
                                    <input
                                        type="text"
                                        name="bairro"
                                        value={orderAddress?.bairro}
                                        onChange={handleAddressChange}
                                        className="profile-input"
                                    />
                                </div>

                                <div className="input-group">
                                    <label>Cidade</label>
                                    <input
                                        type="text"
                                        name="cidade"
                                        value={orderAddress?.cidade}
                                        onChange={handleAddressChange}
                                        className="profile-input"
                                    />
                                </div>

                                <div className="input-group">
                                    <label>Estado</label>
                                    <input
                                        type="text"
                                        name="estado"
                                        value={orderAddress?.estado}
                                        onChange={handleAddressChange}
                                        className="profile-input"
                                    />
                                </div>

                                <div className="input-group">
                                    <label>Ponto de Referência</label>
                                    <input
                                        type="text"
                                        name="referencia"
                                        value={orderAddress?.referencia}
                                        onChange={handleAddressChange}
                                        className="profile-input"
                                    />
                                </div>
                            </div>
                        </div>


                    </div>
                ) : (
                    <p className="error-text">Pedido não encontrado.</p>
                )}
            </div>

            <footer>
                <Footer />
            </footer>
        </section>
    );
};

export default OrderDetails;
