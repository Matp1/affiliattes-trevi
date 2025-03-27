import React, { useEffect, useState } from "react";
import axios from "axios";
import "../cartPage/CartPage.css"; // Reaproveitando estilos do carrinho
import { useNavigate } from "react-router-dom";


const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://localhost:3010/admin/products", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setProducts(response.data);
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
      }
    };

    fetchProducts();
  }, []);

  // Função para excluir produto
  const handleDeleteProduct = async (productId) => {
    const confirmDelete = window.confirm("Tem certeza que deseja excluir este produto?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:3010/products/${productId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      // Remove o produto da lista no frontend
      setProducts(products.filter((product) => product.id !== productId));
      alert("Produto excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
      alert("Erro ao excluir produto. Tente novamente.");
    }
  };

  // Função para formatar a data de criação
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  return (
    <div className="container">
      <h2 className="cart-title">Gerenciar Produtos</h2>
      <div className="cart-content">
        <div className="table-wrapper">
          <table className="line-item-table">
            <thead>
              <tr>
                <th>Cadastrado Por</th> {/* 🔹 Substituímos o ID pelo "Cadastrado Por" */}
                <th>SKU</th>
                <th>Imagem</th>
                <th>Nome</th>
                <th>Categoria</th>
                <th>Preço</th>
                <th>Data de Criação</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="line-item">
                      <td>{product.createdBy || "Desconhecido"}</td> {/* 🔹 Exibe o nome do usuário */}
                      <td>{product.sku || "N/A"}</td>
                  <td className="line-item__product-info">
                    <div className="line-item__image-wrapper">
                      <img
                        src={product.imageUrl?.[0] || "https://via.placeholder.com/80"}
                        alt={product.name}
                        className="line-item__image"
                      />
                    </div>
                  </td>
                  <td>
                    <span className="line-item__title">{product.name}</span>
                  </td>
                  <td>{product.category || "Sem categoria"}</td>
                  <td className="line-item__price">
                    R$ {product.price.toFixed(2).replace(".", ",")}
                  </td>
                  <td>{formatDate(product.createdAt)}</td>
                  <td>
                    <button className="action-button edit" onClick={() => navigate(`/edit-product/${product.id}`)}>
                      Editar
                    </button>
                    <button
                      className="action-button delete"
                      onClick={() => handleDeleteProduct(product.id)}
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
    </div>
  );
};

export default AdminProducts;
