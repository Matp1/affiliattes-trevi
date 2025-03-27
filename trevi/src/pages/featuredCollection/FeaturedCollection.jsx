import React, { useState } from "react";
import ProductItem from "./ProductItem";
import "./FeaturedCollection.css";

const FeaturedCollection = ({ title, products = [] }) => {
  const [startIndex, setStartIndex] = useState(0); // Índice inicial
  const itemsPerPage = 5; // Quantidade de produtos exibidos por vez

  const totalSlides = Math.ceil(products.length / itemsPerPage); // Total de grupos
  const [currentSlide, setCurrentSlide] = useState(0); // Slide atual
  const userCommission = parseFloat(localStorage.getItem("userCommission")) || 0;

  // Função para avançar os produtos
  const nextProducts = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  // Função para voltar os produtos
  const prevProducts = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };



  // Dividindo os produtos em grupos de 5
  const groupedProducts = [];
  for (let i = 0; i < products.length; i += itemsPerPage) {
    groupedProducts.push(products.slice(i, i + itemsPerPage));
  }

  return (
    <section className="featured-collection">
      <header className="section-header">
        <h2 className="section-title">{title}</h2>
      </header>

      {/* Botão Esquerda */}
      {currentSlide > 0 && (
        <button className="scroll-btn left" onClick={prevProducts}>
          &#8249;
        </button>
      )}

      {/* Lista de produtos com animação */}
      <div className="product-carousel-wrapper">
        <div
          className="product-carousel"
          style={{
            transform: `translateX(-${currentSlide * 100}%)`,
            display: "flex",
            flexWrap: "nowrap",
          }}
        >
          {groupedProducts.map((group, index) => (
            <div key={index} className="product-group" style={{ display: "flex", justifyContent: "flex-start" }}>
              {group.map((product) => (
                <ProductItem
                  key={product.id}
                  product={{
                    ...product,
                    price: product.price + product.price * (userCommission / 100),
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Botão Direita */}
      {currentSlide < totalSlides - 1 && (
        <button className="scroll-btn right" onClick={nextProducts}>
          &#8250;
        </button>
      )}
    </section>
  );
};

export default FeaturedCollection;
