import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Mosaic.css";

const Mosaic = ({ items }) => {
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Itens do Mosaic:", items); // 🔍 Log dos dados recebidos
  }, [items]);

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };
  
  const handleCategoryClick = (item) => {
    if (!item) {
      console.error("Erro: item é undefined!");
      return;
    }
  
    console.log("Item clicado:", item);
  
    if (item.link) {
      const category = item.link.replace("/categoria/", ""); // Extrai a categoria da URL
      const formattedCategory = capitalizeFirstLetter(category); // Capitaliza a primeira letra
      navigate(`/category/${formattedCategory}`);
    } else if (item.title) {
      const formattedCategory = capitalizeFirstLetter(item.title);
      navigate(`/category/${formattedCategory}`);
    } else {
      console.error("Erro: Nenhuma categoria encontrada!");
    }
  };
  
  return (
    <section className="mosaic">
      <h2 className="mosaic-title">Explore nossas coleções</h2>
      <div className="mosaic-container">
        {items.map((item, index) => (
          <div key={index} className="mosaic-wrapper">
            <button className="mosaic-item" onClick={() => handleCategoryClick(item)}>
              <img src={item.image} alt={item.title} className="mosaic-image" />
            </button>
            <div className="mosaic-content">
              <h3>{item.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Mosaic;
