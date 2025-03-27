import React from "react";
import "./AnnouncementBar.css";
import { FaBox, FaExchangeAlt, FaShieldAlt } from "react-icons/fa";

const AnnouncementBar = () => {
  return (
    <div className="announcement-bar">
      <div className="announcement-item">
        <FaBox className="icon" />
        <span>Frete Grátis para todo o Brasil</span>
      </div>
      <div className="announcement-item">
        <FaExchangeAlt className="icon" />
        <span>Trocas e Devoluções em até 7 dias</span>
      </div>
      <div className="announcement-item">
        <FaShieldAlt className="icon" />
        <span>Satisfação Garantida ou Dinheiro de Volta</span>
      </div>
    </div>
  );
};

export default AnnouncementBar;
