import React from "react";

const PlaceholderItem = ({ layout }) => {
  const gridClass = layout === "vertical" ? "grid-vertical" : "grid-horizontal";

  return (
    <div className={`placeholder-item ${gridClass}`}>
      <div className="placeholder-image"></div>
      <h3 className="placeholder-title">Produto</h3>
      <p className="placeholder-price">R$ 0,00</p>
      <button className="add-to-cart disabled">Indisponível</button>
    </div>
  );
};

export default PlaceholderItem;
