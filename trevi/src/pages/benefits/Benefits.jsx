import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLock,
  faShippingFast,
  faHeadset,
  faThumbsUp,
} from "@fortawesome/free-solid-svg-icons"; // Ícones importados
import "./Benefits.css";

const Benefits = () => {
  const benefits = [
    {
      icon: faLock,
      title: "Compra Segura",
      description: "Ambiente seguro para pagamentos online",
    },
    {
      icon: faShippingFast,
      title: "Frete Grátis",
      description: "Envio rápido e acompanhado com código de rastreio",
    },
    {
      icon: faHeadset,
      title: "Suporte Profissional",
      description: "Equipe de suporte de extrema qualidade a semana toda",
    },
    {
      icon: faThumbsUp,
      title: "Satisfação ou Reembolso",
      description: "Caso haja algo, devolvemos seu dinheiro com velocidade",
    },
  ];

  return (
    <section className="benefits">
      <div className="benefits-container">
        {benefits.map((benefit, index) => (
          <div key={index} className="benefit-item">
            {/* Ícone do Font Awesome */}
            <FontAwesomeIcon icon={benefit.icon} className="benefit-icon" />
            <div className="benefit-content">
              <h3 className="benefit-title">{benefit.title}</h3>
              <p className="benefit-description">{benefit.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Benefits;
