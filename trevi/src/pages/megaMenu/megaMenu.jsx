import React, { useState } from "react";
import "./MegaMenu.css"; // Estilo específico do menu

const MegaMenu = () => {
  const [activeMenu, setActiveMenu] = useState(null);

  // Simulação de categorias e submenus
  const menus = [
    {
      title: "Produtos",
      submenus: ["Camisetas", "Calças", "Acessórios", "Sapatos"],
    },
    {
      title: "Coleções",
      submenus: ["Novidades", "Promoções", "Mais Vendidos"],
    },
    {
      title: "Sobre Nós",
      submenus: ["Nossa História", "Sustentabilidade", "Contato"],
    },
  ];

  const toggleMenu = (index) => {
    setActiveMenu(activeMenu === index ? null : index);
  };

  return (
    <nav className="mega-menu">
      <ul className="menu-list">
        {menus.map((menu, index) => (
          <li key={index} className="menu-item">
            <span
              className={`menu-title ${activeMenu === index ? "active" : ""}`}
              onClick={() => toggleMenu(index)}
            >
              {menu.title}
            </span>
            <ul
              className={`submenu ${
                activeMenu === index ? "submenu-open" : ""
              }`}
            >
              {menu.submenus.map((submenu, subIndex) => (
                <li key={subIndex} className="submenu-item">
                  <a href="#">{submenu}</a>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default MegaMenu;
