import React, { useState, useEffect } from "react";
import "./Slideshow.css";

const Slideshow = ({ slides }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Configurações do carrossel
  const autoPlay = true; // Reprodução automática
  const transitionTime = 5000; // Intervalo aumentado para 5 segundos

  useEffect(() => {
    let slideInterval;

    if (autoPlay) {
      slideInterval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, transitionTime);
    }

    return () => clearInterval(slideInterval);
  }, [autoPlay, slides.length]);

  return (
    <div className="slideshow">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`slide ${index === currentSlide ? "active" : ""}`}
          style={{ backgroundImage: `url(${slide.image})` }}
        >
          <div
            className={`slide-content ${
              slide.align === "left" ? "align-left" : "align-right"
            }`}
          >
            <h2 className="slide-title">{slide.title}</h2>
            <h3 className="slide-subtitle">{slide.subtitle}</h3>
          </div>
        </div>
      ))}
      {/* Indicadores de navegação */}
      <div className="dots">
        {slides.map((_, index) => (
          <span
            key={index}
            className={`dot ${index === currentSlide ? "active" : ""}`}
            onClick={() => setCurrentSlide(index)}
          ></span>
        ))}
      </div>
    </div>
  );
};

export default Slideshow;
