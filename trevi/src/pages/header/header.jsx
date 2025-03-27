import React, { useState } from "react";
import logo from '../../assets/images/ART_sem_fundo_sem_bordas_205x@2x.png'; // Importação da logo
import "./teste.css"; // Arquivo para estilos
import AnnouncementBar from "../announcementBar/AnnouncementBar.jsx";
import { FaSearch, FaShoppingCart, FaTruck, FaUser } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom"; 

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchCategory, setSearchCategory] = useState("");
  const navigate = useNavigate(); // 🔹 Hook para navegação


  const toggleMenu = () => setMenuOpen(!menuOpen);

  const handleCategoryClick = (category) => {
    navigate(`/category/${category}`); // 🔹 Redireciona para a categoria
  };

  const handleCategoryChange = (event) => {
    setSearchCategory(event.target.value);
  };

  const handleSearch = () => {
    if (searchCategory && searchCategory !== "Todas as categorias") {
      navigate(`/home/${searchCategory}`);
    } else {
      navigate("/home");
    }
  };

  return (
    <>
      <AnnouncementBar />
      <header className="header">
        <div className="header-top">
          {/* Logo */}
          <a href="/home" className="logo">
            <img src={logo} alt="Logo da Loja" />
          </a>

          {/* Barra de Busca */}
          <div className="search-bar">
            <input type="text" placeholder="O que está buscando?" />
            <select onChange={handleCategoryChange} value={searchCategory}>
              <option>Todas as categorias</option>
              <option>Banheiro</option>
              <option>Cozinha</option>
              <option>Decoração</option>
            </select>
            <button onClick={handleSearch}>
              <FontAwesomeIcon
                icon={faMagnifyingGlass}
                style={{ color: "#be8800" }}
              />
            </button>
          </div>

          {/* Ícones e Links */}
          <div className="header-icons">
          <a href="/userProfile" className="header-link">
              <FaUser/>
              Meu Perfil
            </a>
            <a href="/orders" className="header-link">
              <FaTruck />
              <span>Pedidos</span>
            </a>
            <a href="/cart" className="header-link">
              <FaShoppingCart />
              <span>Carrinho</span>
              <span className="cart-count">0</span>
            </a>
          </div>
        </div>

        {/* Menu */}
        <nav className="navbar">
          <ul className="nav-links">
            <li><button onClick={() => handleCategoryClick("Banheiro")}>Banheiro</button></li>
            <li><button onClick={() => handleCategoryClick("Cozinha")}>Cozinha</button></li>
            <li><button onClick={() => handleCategoryClick("Decoracao")}>Decoração</button></li>
            <li><button onClick={() => handleCategoryClick("Lustres")}>Lustres e arandelas</button></li>
            <li><button onClick={() => handleCategoryClick("Luminarias")}>Luminárias de mesa</button></li>
            <li><button onClick={() => handleCategoryClick("Estofados")}>Estofados</button></li>
            <li><button onClick={() => handleCategoryClick("Piscina")}>Piscina e Jardim</button></li>
            <li><button onClick={() => navigate("/contato")}>Fale conosco</button></li>
          </ul>
        </nav>
      </header>
    </>
  );
};

export default Header;
