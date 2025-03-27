import React from "react";
import logo from '../../assets/images/Imagem1_140x@2x.png'; // Importação da logo
import secureBuy from '../../assets/images/Design_sem_nome__6_-removebg-preview.png'; // Importação da logo
import "./Footer.css";


const Footer = () => {
  return (
    <>
      {/* Barra superior fora do footer */}
      <div
        className="color-line"
        style={{
          background: "linear-gradient(to right, #c29e55, #c29e55, #c29e55)",
          height: "6px",
          width: "100%",
        }}
      ></div>

      {/* Footer começa abaixo da barra */}
      <footer className="footer">
        {/* Conteúdo principal do rodapé */}
        <div className="footer-container">
          <div className="footer-section">
            <div className="footer-logo-container">
              <img
                src={logo} // Substituir pelo logo correto
                alt="Logo Trevi"
                className="footer-logo"
              />
            </div>
            <div className="footer-info">
              <p><strong>SAC (Serviço de Atendimento ao Consumidor)</strong></p>
              <p><strong>Email:</strong> suporte@treviart.store</p>
              <p><strong>WhatsApp:</strong> +55 (99) 9 9999-9999</p>
            </div>
          </div>
          <div className="footer-section">
            <h4>MENU DE RODAPÉ</h4>
            <ul>
              <li><a href="/pesquisar">Pesquisar</a></li>
              <li><a href="/fale-conosco">Fale conosco</a></li>
              <li>
                <a href="/termos-de-uso.pdf" target="_blank" rel="noopener noreferrer">
                  Termos de Uso
                </a>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>NOSSA NEWSLETTER</h4>
            <p>Assine nossa newsletter e receba as melhores ofertas!</p>
            <form>
              <input type="email" placeholder="Seu e-mail" className="newsletter-input" />
              <button type="submit" className="newsletter-button">Enviar</button>
            </form>
          </div>
        </div>

        {/* Direitos autorais e avisos */}
        <div className="footer-bottom">
          <p>&copy; Trevi</p>
          <p>
            Alterar CNPJ no idioma do tema pesquisando por "CNPJ".
            <br />
            Preços e condições de pagamento exclusivos para compras neste site oficial.
          </p>
          <p>
            Caso compre os mesmos produtos em outras lojas,{" "}
            <strong>não nos responsabilizamos por quaisquer problemas.</strong>
          </p>
          {/* Selos de segurança */}
          <div className="security-seals">
            <img src={secureBuy} alt="Google Site Seguro" />
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;

