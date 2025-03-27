import React, { useState, useEffect } from "react";
import { faCartShopping } from "@fortawesome/free-solid-svg-icons"; // solid é gratuito
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import './CartPage.css';
import Header from '../header/header.jsx'
import Benefits from '../benefits/Benefits.jsx'
import Footer from '../footer/footer.jsx'
import { toast } from 'react-toastify';
import { jsPDF } from "jspdf";
import logo from '../../assets/images/ART_sem_fundo_sem_bordas_205x@2x.png'; // Importação da logo


const getBase64FromUrl = async (url) => {
  try {
    if (!url || url.trim() === "") {
      console.error("URL de imagem inválida.");
      return null;
    }

    const response = await fetch(url);
    if (!response.ok) {
      console.error("Erro ao carregar imagem:", response.statusText);
      return null;
    }

    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => resolve(reader.result);
    });
  } catch (error) {
    console.error("Erro ao converter imagem para base64:", error);
    return null;
  }
};

const CartPage = () => {
  const [cartItems, setCartItems] = useState(() => {
    const storedCart = localStorage.getItem("cart");
    return storedCart ? JSON.parse(storedCart) : [];
  });
  const [shipping, setShipping] = useState(0);
  const userCommission = parseFloat(localStorage.getItem("userCommission")) || 0;
  const [isSaving, setIsSaving] = useState(false); // Estado para controle do carregamento
  const [orderSaved, setOrderSaved] = useState(false); // Estado para exibir feedback após salvar
  const [showOrderNameModal, setShowOrderNameModal] = useState(false); // Novo estado para o modal
  const [orderName, setOrderName] = useState(""); // Nome do pedido
  const [userAddress, setUserAddress] = useState({
    cep: "",
    rua: "",
    numero: "",
    complemento: "",
    cidade: "",
    estado: "",
    bairro: "",
    referencia: "",
  });


  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setUserAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  const buscarCep = async () => {
    if (!userAddress.cep || userAddress.cep.length < 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${userAddress.cep}/json/`);
      const data = await response.json();

      if (!data.erro) {
        setUserAddress((prev) => ({
          ...prev,
          rua: data.logradouro || "",
          bairro: data.bairro || "",
          cidade: data.localidade || "",
          estado: data.uf || "",
        }));
      }
    } catch (error) {
      console.error("Erro ao buscar o CEP:", error);
    }
  };



  const calcularPrecoComComissao = (precoBase) => {
    return precoBase * (1 + userCommission / 100);
  };

  const calculateTotal = () => {
    const subtotal = cartItems.reduce(
      (total, item) => total + calcularPrecoComComissao(item.price) * item.quantity,
      0
    );
    return subtotal + shipping;
  };

  const handleQuantityChange = (index, value) => {
    if (value < 1) return;

    const updatedItems = [...cartItems];
    updatedItems[index].quantity = value;
    setCartItems(updatedItems);
  };

  const handleRemoveItem = (index) => {
    const updatedItems = cartItems.filter((_, i) => i !== index);
    setCartItems(updatedItems);
    toast.success("Produto removido do carrinho.");
  };

  const fetchUserName = async (userId) => {
    if (!userId) return "Usuário Desconhecido"; // Evita erro se não houver userId

    try {
      const response = await fetch(`http://localhost:3010/users/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Envia o token de autenticação
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao buscar usuário");
      }

      const userData = await response.json();
      return userData.name; // Retorna o nome do usuário corretamente
    } catch (error) {
      console.error("Erro ao buscar o nome do usuário:", error);
      return "Usuário Desconhecido";
    }
  };

  const generatePDF = async () => {
    const userId = localStorage.getItem("userId");
    const userName = await fetchUserName(userId);
    const today = new Date().toLocaleDateString("pt-BR");

    const doc = new jsPDF();
    let yPosition = 60; // Posição inicial da tabela

    // 🔹 Adicionar um logotipo (se houver)
    const logoUrl = logo;
    const base64Logo = await getBase64FromUrl(logoUrl);
    if (base64Logo) {
      doc.addImage(base64Logo, "JPEG", 10, 10, 50, 20);
    }

    // 🔹 Título principal
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Resumo do Pedido", 105, 30, { align: "center" });

    // 🔹 Informações do Cliente e Data
    doc.setFontSize(12);
    doc.text(`Cliente: ${userName}`, 10, 50);
    doc.text(`Data: ${today}`, 160, 50);

    // 🔹 Criar uma linha separadora
    doc.line(10, 55, 200, 55);

    // 🔹 Cabeçalho da Tabela
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");

    doc.text("ITEM", 12, yPosition);
    doc.text("IMAGEM", 30, yPosition);
    doc.text("DESCRIÇÃO", 65, yPosition);
    doc.text("VARIANTE", 100, yPosition);
    doc.text("QTD", 125, yPosition, { align: "center" });
    doc.text("R$ UNITÁRIO", 160, yPosition, { align: "right" });
    doc.text("R$ TOTAL", 190, yPosition, { align: "right" });

    doc.line(10, yPosition + 5, 200, yPosition + 5);
    yPosition += 10;

    let totalPedido = 0;

    // 🔹 Adicionar os Itens do Carrinho
    for (const item of cartItems) {
      const imageUrl = item.imageUrl?.[0] || "https://via.placeholder.com/80";
      const base64Image = await getBase64FromUrl(imageUrl);

      const precoUnitario = calcularPrecoComComissao(item.price);
      const precoTotal = precoUnitario * item.quantity;
      totalPedido += precoTotal;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text((cartItems.indexOf(item) + 1).toString(), 12, yPosition);
      doc.text(item.name, 65, yPosition, { maxWidth: 30 });
      doc.text(item.variants || "-", 100, yPosition);
      doc.text(item.quantity.toString(), 125, yPosition, { align: "center" });
      doc.text(`R$ ${precoUnitario.toFixed(2).replace(".", ",")}`, 160, yPosition, { align: "right" });
      doc.text(`R$ ${precoTotal.toFixed(2).replace(".", ",")}`, 190, yPosition, { align: "right" });

      if (base64Image) {
        doc.addImage(base64Image, "JPEG", 30, yPosition - 5, 15, 15);
      }

      yPosition += 20;
    }

    // 🔹 Criar uma linha separadora antes do rodapé
    doc.line(10, yPosition + 5, 200, yPosition + 5);

    // 🔹 Exibir Total do Pedido
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Total: R$ ${totalPedido.toFixed(2).replace(".", ",")}`, 190, yPosition + 15, { align: "right" });

    yPosition += 25; // Ajusta espaço para exibir o endereço de entrega

    // 🔹 Informações de Entrega (Antes das Instruções de Pagamento)
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Endereço de Entrega:", 10, yPosition);
    yPosition += 10;
    doc.setFont("helvetica", "normal");

    doc.text(`${userAddress.rua}, ${userAddress.numero} ${userAddress.complemento ? `- ${userAddress.complemento}` : ""}`, 10, yPosition);
    yPosition += 10;
    doc.text(`${userAddress.bairro} - ${userAddress.cidade} / ${userAddress.estado}`, 10, yPosition);
    yPosition += 10;
    doc.text(`CEP: ${userAddress.cep}`, 10, yPosition);
    yPosition += 10;
    doc.text(`Referência: ${userAddress.referencia || "N/A"}`, 10, yPosition);
    yPosition += 15;

    // 🔹 Rodapé - Instruções de Pagamento
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Pagamento via Cartão de Crédito: Entre em contato para mais detalhes.", 10, yPosition);
    yPosition += 10;
    doc.text("Pagamento à Vista com PIX (10% de desconto):", 10, yPosition + 10);

    return new Promise((resolve) => {
      const pdfBlob = doc.output("blob");
      const pdfUrl = URL.createObjectURL(pdfBlob);
      resolve(pdfUrl);
    });
  };

  const generatePDFComissao = async () => {
    const userId = localStorage.getItem("userId");
    const userName = await fetchUserName(userId);
    const userCommissionPercentage = parseFloat(userCommission).toFixed(0);

    const doc = new jsPDF();
    let yPosition = 60; // Posição inicial da tabela

    // 🔹 Adicionar um logotipo (se houver)
    const logoUrl = logo; // Substitua pelo logo correto
    const base64Logo = await getBase64FromUrl(logoUrl);
    if (base64Logo) {
      doc.addImage(base64Logo, "JPEG", 10, 10, 50, 20);
    }

    // 🔹 Título principal
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Resumo do Pedido - Controle Interno", 105, 30, { align: "center" });

    // 🔹 Informações do Cliente e Comissão
    doc.setFontSize(12);
    doc.text(`Cliente: ${userName}`, 10, 50);
    doc.text(`Comissão Escolhida: ${userCommissionPercentage}%`, 150, 50);

    // 🔹 Criar uma linha separadora
    doc.line(10, 55, 200, 55);

    // 🔹 Cabeçalho da Tabela
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");

    doc.text("ITEM", 12, yPosition);
    doc.text("IMAGEM", 30, yPosition);
    doc.text("DESCRIÇÃO", 65, yPosition);
    doc.text("VARIANTE", 100, yPosition);
    doc.text("QTD", 125, yPosition, { align: "center" });
    doc.text("PREÇO UNITÁRIO", 160, yPosition, { align: "right" });
    doc.text("TOTAL", 190, yPosition, { align: "right" });

    doc.line(10, yPosition + 5, 200, yPosition + 5);
    yPosition += 10;

    let totalComissao = 0;
    let totalPedido = 0;

    // 🔹 Adicionar os Itens do Carrinho
    for (const item of cartItems) {
      const imageUrl = item.imageUrl?.[0] || "https://via.placeholder.com/80";
      const base64Image = await getBase64FromUrl(imageUrl);

      const precoOriginal = item.price;
      const precoComComissao = calcularPrecoComComissao(precoOriginal);
      const precoTotal = precoComComissao * item.quantity;

      // 🔹 Calcular a Comissão do Afiliado
      const valorComissaoItem = (precoTotal * userCommissionPercentage) / 100;
      totalComissao += valorComissaoItem;
      totalPedido += precoTotal;

      // 🔹 Adicionar os Detalhes do Produto na Tabela
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text((cartItems.indexOf(item) + 1).toString(), 12, yPosition);
      doc.text(item.name, 65, yPosition, { maxWidth: 30 });
      doc.text(item.variants || "-", 100, yPosition);
      doc.text(item.quantity.toString(), 125, yPosition, { align: "center" });
      doc.text(`R$ ${precoOriginal.toFixed(2).replace(".", ",")}`, 160, yPosition, { align: "right" });
      doc.text(`R$ ${precoTotal.toFixed(2).replace(".", ",")}`, 190, yPosition, { align: "right" });

      if (base64Image) {
        doc.addImage(base64Image, "JPEG", 30, yPosition - 5, 15, 15);
      }

      yPosition += 20;
    }

    // 🔹 Criar uma linha separadora antes do rodapé
    doc.line(10, yPosition + 5, 200, yPosition + 5);

    // 🔹 Exibir Total do Pedido e Comissão do Afiliado
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Total do Pedido: R$ ${totalPedido.toFixed(2).replace(".", ",")}`, 10, yPosition + 15);
    doc.text(`Comissão do Afiliado (${userCommissionPercentage}%): R$ ${totalComissao.toFixed(2).replace(".", ",")}`, 10, yPosition + 25);

    yPosition += 35; // Ajusta espaço para exibir o endereço de entrega

    // 🔹 Informações de Entrega (Antes das Instruções de Pagamento)
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Endereço de Entrega:", 10, yPosition);
    yPosition += 10;
    doc.setFont("helvetica", "normal");

    doc.text(`${userAddress.rua}, ${userAddress.numero} ${userAddress.complemento ? `- ${userAddress.complemento}` : ""}`, 10, yPosition);
    yPosition += 10;
    doc.text(`${userAddress.bairro} - ${userAddress.cidade} / ${userAddress.estado}`, 10, yPosition);
    yPosition += 10;
    doc.text(`CEP: ${userAddress.cep}`, 10, yPosition);
    yPosition += 10;
    doc.text(`Referência: ${userAddress.referencia || "N/A"}`, 10, yPosition);
    yPosition += 15;

    // 🔹 Rodapé - Instruções de Pagamento
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Este documento é um controle interno da empresa.", 10, yPosition);

    return new Promise((resolve) => {
      const pdfBlob = doc.output("blob");
      const pdfUrl = URL.createObjectURL(pdfBlob);
      resolve(pdfUrl);
    });
  };


  const saveOrderToDatabase = async () => {
    if (isSaving) return;

    if (!orderName.trim()) {
      toast.error("❌ Defina um nome para o pedido!");
      return;
    }

    setIsSaving(true);
    setOrderSaved(false);

    const userId = localStorage.getItem("userId");
    if (!userId) {
      toast.error("Usuário não autenticado. Faça login para salvar o pedido.");
      setIsSaving(false);
      return;
    }

    const orderData = {
      userId,
      orderName,
      items: cartItems.map(item => ({
        productId: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        imageUrl: item.imageUrl ? item.imageUrl[0] : "",
        selectedColor: item.selectedColor || "N/A",  // 🔹 Salvar apenas a cor escolhida
        selectedSize: item.selectedSize || "N/A",  // 🔹 Salvar apenas o tamanho escolhido
        sku: item.sku,
      })),
      totalPrice: calculateTotal(),
      adress: userAddress, // 🔹 Endereço de entrega
    };

    console.log("📤 Enviando pedido para backend:", orderData);

    try {
      const response = await fetch("http://localhost:3010/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Erro ao salvar pedido.");
      }

      toast.success("✅ Pedido salvo com sucesso!");
      setOrderSaved(true);
      setShowOrderNameModal(false);
    } catch (error) {
      console.error("❌ Erro ao salvar pedido:", error);
      toast.error(`❌ Erro ao salvar pedido: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };


  const generateWhatsAppLink = async () => {
    const userId = localStorage.getItem("userId");
    const userName = await fetchUserName(userId);
    const userCommissionPercentage = parseFloat(userCommission).toFixed(0);

    let message = `Olá, gostaria de enviar meu pedido para que vocês possam faturar e me enviar o link para pagamento!! 😊\n\n`;
    message += `👤 *Cliente:* ${userName}\n`;
    message += `💰 *Comissão Escolhida:* ${userCommissionPercentage}%\n\n`;
    message += `🛒 *Resumo do Pedido:*\n`;

    let totalPedido = 0;

    cartItems.forEach((item, index) => {
      const precoOriginal = item.price;
      const precoComComissao = calcularPrecoComComissao(precoOriginal);
      const precoComissaoFormatado = precoComComissao.toFixed(2).replace(".", ",");
      const precoOriginalFormatado = precoOriginal.toFixed(2).replace(".", ",");

      const precoTotal = precoComComissao * item.quantity;
      totalPedido += precoTotal;

      message += `${index + 1}. ${item.name} - ${item.quantity}x - R$${precoOriginalFormatado} + ${userCommissionPercentage}% = R$${precoComissaoFormatado}\n`;
    });

    // 🔹 Calcular a Comissão do Afiliado (Baseada no Total do Pedido)
    const totalComissao = (totalPedido * userCommissionPercentage) / 100;
    const totalPedidoFormatado = totalPedido.toFixed(2).replace(".", ",");
    const totalComissaoFormatado = totalComissao.toFixed(2).replace(".", ",");

    message += `\n💰 *Total do Pedido:* R$ ${totalPedidoFormatado}\n`;
    message += `💰 *Comissão do Afiliado (${userCommissionPercentage}%):* R$ ${totalComissaoFormatado}\n`;
    message += `📎 *O PDF com os detalhes do pedido e da sua comissão foi gerado! Baixe e anexe aqui no chat.* *Lembre-se, não é o mesmo que você manda para seu cliente.*\n`;

    // Criar o link do WhatsApp
    const phoneNumber = "5511959991399"; // Número de WhatsApp
    const encodedMessage = encodeURIComponent(message);
    return `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodedMessage}`;
  };


  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("cart");
    alert("Carrinho limpo!");
  };

  const handleShippingEstimate = () => {
    setShipping(20);
    alert("Frete estimado: R$ 20,00");
  };

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  console.log(cartItems);


  return (
    <section className="cart-page">
      <header className="empty-header">
        <Header />
      </header>
      {cartItems.length === 0 ? (
        <div className="empty-cart-container">
          <div className="empty-cart">
            <FontAwesomeIcon
              icon={faCartShopping}
              style={{ color: "#000000", width: "81px", height: "78px" }}
              className="empty-cart-icon"
            />
            <h2 className="empty-cart-text">Seu Carrinho Está Vazio!</h2>
            <button className="empty-cart-button" onClick={() => window.location.href = '/home'}>
              Compre Nossos Produtos
            </button>
          </div>
        </div>
      ) : (
        <div className="container">
          <h2 className="cart-title">Seu Carrinho</h2>
          <div className="cart-content">
            <div className="table-wrapper">
              <table className="line-item-table">
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th className="table__cell--center">Quantidade</th>
                    <th className="table__cell--right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item, index) => (
                    <tr key={index} className="line-item">
                      <td className="line-item__product-info">
                        <div className="line-item__product-info-wrapper">
                          <div className="line-item__image-wrapper">
                            <img
                              src={item.imageUrl && item.imageUrl.length > 0 ? item.imageUrl[0] : "https://via.placeholder.com/80"}
                              alt={item.name}
                              className="line-item__image"
                            />
                          </div>
                          <div className="line-item__meta">
                            <a href="#" className="line-item__title">{item.name}</a>
                            <div className="line-item__price-list">
                              <span className="line-item__price">
                                R$ {calcularPrecoComComissao(item.price).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 🔹 Seletor de Quantidade */}
                      <td className="table__cell--center">
                        <div className="quantity-selector">
                          <button onClick={() => handleQuantityChange(index, item.quantity - 1)}>-</button>
                          <input
                            type="number"
                            value={item.quantity}
                            min="1"
                            onChange={(e) => handleQuantityChange(index, Number(e.target.value))}
                            className="quantity-selector__value"
                          />
                          <button onClick={() => handleQuantityChange(index, item.quantity + 1)}>+</button>
                        </div>
                      </td>

                      {/* 🔹 Exibir o total do item */}
                      <td className="table__cell--right">
                        <span className="price-right">
                          R$ {(calcularPrecoComComissao(item.price) * item.quantity).toFixed(2)}
                        </span>
                      </td>

                      {/* 🔹 Ícone de Remover */}
                      <td className="table__cell--right">
                        <button
                          className="remove-item-button"
                          onClick={() => handleRemoveItem(index)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "18px",
                            color: "red"
                          }}
                        >
                          ❌
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Formulário de Endereço */}
              <div className="address-form">
                <h3>Endereço para Entrega</h3>
                <div className="address-container">
                  <div className="input-group">
                    <label>CEP</label>
                    <input
                      type="text"
                      name="cep"
                      value={userAddress.cep || ""}
                      onChange={handleAddressChange}
                      onBlur={buscarCep}
                      className="profile-input"
                    />
                  </div>

                  <div className="input-group">
                    <label>Rua</label>
                    <input
                      type="text"
                      name="rua"
                      value={userAddress.rua || ""}
                      onChange={handleAddressChange}
                      className="profile-input"
                    />
                  </div>

                  <div className="input-group">
                    <label>Número</label>
                    <input
                      type="text"
                      name="numero"
                      value={userAddress.numero || ""}
                      onChange={handleAddressChange}
                      className="profile-input"
                    />
                  </div>

                  <div className="input-group">
                    <label>Complemento</label>
                    <input
                      type="text"
                      name="complemento"
                      value={userAddress.complemento || ""}
                      onChange={handleAddressChange}
                      className="profile-input"
                    />
                  </div>

                  <div className="input-group">
                    <label>Bairro</label>
                    <input
                      type="text"
                      name="bairro"
                      value={userAddress.bairro || ""}
                      onChange={handleAddressChange}
                      className="profile-input"
                    />
                  </div>

                  <div className="input-group">
                    <label>Cidade</label>
                    <input
                      type="text"
                      name="cidade"
                      value={userAddress.cidade || ""}
                      onChange={handleAddressChange}
                      className="profile-input"
                    />
                  </div>

                  <div className="input-group">
                    <label>Estado</label>
                    <input
                      type="text"
                      name="estado"
                      value={userAddress.estado || ""}
                      onChange={handleAddressChange}
                      className="profile-input"
                    />
                  </div>

                  <div className="input-group">
                    <label>Ponto de Referência</label>
                    <input
                      type="text"
                      name="referencia"
                      value={userAddress.referencia || ""}
                      onChange={handleAddressChange}
                      className="profile-input"
                    />
                  </div>
                </div>
              </div>


            </div>


            <div className="cart-summary">
              <h3 className="total-price">
                Total: <span>R$ {calculateTotal().toFixed(2).replace(".", ",")}</span>
              </h3>

              <h4 className="payments-trigger">PIX/CARTÃO RECEBA 3 DIAS ANTES</h4>
              <button
                className="checkout-button"
                onClick={async () => {
                  // Gera e baixa automaticamente o PDF com a comissão antes de abrir o WhatsApp
                  const pdfUrl = await generatePDFComissao();

                  const link = document.createElement("a");
                  link.href = pdfUrl;
                  link.download = "resumo_pedido_comissao.pdf";
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);

                  // Depois de baixar o PDF, abre o WhatsApp
                  const whatsappLink = await generateWhatsAppLink();
                  window.open(whatsappLink, "_blank");
                }}
              >
                Finalizar Pedido
              </button>



              <button
                className="continue-shopping"
                onClick={() => (window.location.href = "/home")}
              >
                CONTINUAR COMPRANDO
              </button>
              <p className="payment-info">Pagamento 100% seguro</p>
            </div>
            <button
              className="download-pdf-button"
              onClick={async () => {
                const pdfUrl = await generatePDF();

                // Criar um link temporário e iniciar download automático
                const link = document.createElement("a");
                link.href = pdfUrl;
                link.download = "resumo_pedido.pdf";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
            >
              Baixar Pedido (PDF)
            </button>

            <button
              className={`save-order-button ${orderSaved ? "saved" : ""}`}
              onClick={() => setShowOrderNameModal(true)} // Agora abre o modal corretamente
              disabled={isSaving || orderSaved}
            >
              {isSaving ? "Salvando..." : orderSaved ? " Pedido Salvo!" : " Salvar Pedido"}
            </button>

          </div>
        </div>

      )}

      <div className="benefits-cart">
        <Benefits />
      </div>

      <footer>
        <Footer />
      </footer>

      {/* 🛑 MODAL PARA INSERIR NOME DO PEDIDO */}
      {showOrderNameModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Defina um Nome para o Pedido</h3>
            <input
              type="text"
              placeholder="Ex: Casa Gulliver"
              value={orderName}
              onChange={(e) => setOrderName(e.target.value)}
            />
            <div className="modal-actions">
              <button onClick={saveOrderToDatabase} className="confirm-button">Salvar</button>
              <button onClick={() => setShowOrderNameModal(false)} className="cancel-button">Cancelar</button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};

export default CartPage;
