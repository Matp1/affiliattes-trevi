import React from "react";
import { Link } from "react-router-dom";

const ProductItem = ({ product }) => {
  // Formata o preço para duas casas decimais e troca "." por ","
  const formattedPrice = product.price
    .toFixed(2) // Limita para 2 casas decimais
    .replace(".", ","); // Troca o ponto pela vírgula

  return (
    <Link to={`/product/${product.id}`} style={{ textDecoration: "none", color: "inherit" }}>
    <div className="product-card">
      <img src={product.imageUrl[0] || "/images/placeholder.png"} alt={product.name} />
      <h3>{product.name}</h3>
      <p className="product-price">R$ {formattedPrice}</p>
    </div>
  </Link>
  
  
  );
};

export default ProductItem;
