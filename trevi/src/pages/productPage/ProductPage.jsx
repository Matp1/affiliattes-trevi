import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './ProductPage.css';
import InnerImageZoom from 'react-inner-image-zoom';
import 'react-inner-image-zoom/lib/InnerImageZoom/styles.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown } from '@fortawesome/free-solid-svg-icons';
import { faRotateLeft, faMedal } from '@fortawesome/free-solid-svg-icons';
import Header from '../header/header.jsx';
import Footer from '../footer/footer.jsx';
import Benefits from '../benefits/Benefits.jsx';
import "swiper/swiper-bundle.css";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { useNavigate } from 'react-router-dom';

const ProductPage = () => {
  const [product, setProduct] = useState(null); // Estado para armazenar o produto
  const [loading, setLoading] = useState(true); // Estado de carregamento
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [soldUnits, setSoldUnits] = useState(0);
  const [cart, setCart] = useState(() => {
    // Recupera o carrinho do localStorage ao carregar
    const storedCart = localStorage.getItem("cart");
    return storedCart ? JSON.parse(storedCart) : [];
  });

  const navigate = useNavigate();

  const { id } = useParams();

  const cloudinaryBase = 'https://res.cloudinary.com/{dse8ujkdq}/image/upload/';

  const addToCart = () => {
    if (!selectedVariant) {
      alert("Por favor, selecione um tamanho antes de adicionar ao carrinho!");
      return;
    }
  
    // 🔹 Obtém apenas a variante do tipo "Cor"
    const selectedColor = product.variants.find((variant) => variant.type === "Cor")?.value || "N/A";
  
    // 🔹 Filtra apenas as variantes do tipo "Tamanho"
    const sizeVariants = product.variants.filter((variant) => variant.type === "Tamanho");
  
    // 🔹 Garante que estamos pegando o tamanho correto com base no índice selecionado
    const selectedSize = sizeVariants[selectedVariant]?.value || "N/A";
  
    const existingProduct = cart.find(
      (item) => item.id === product.id && item.selectedSize === selectedSize
    );
  
    let updatedCart;
    if (existingProduct) {
      // Se já existe o mesmo produto com a mesma variante, apenas incrementa a quantidade
      updatedCart = cart.map((item) =>
        item.id === product.id && item.selectedSize === selectedSize
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      // Adiciona o novo produto ao carrinho com as variantes selecionadas corretamente
      updatedCart = [
        ...cart,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          quantity: 1,
          selectedColor, // 🔹 Apenas a cor selecionada
          selectedSize,  // 🔹 Apenas o tamanho selecionado
          sku: product.sku
        },
      ];
    }
  
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    alert("Produto adicionado ao carrinho!");
  };
    
  const handleQuantityChange = (value) => {
    const newQuantity = Math.max(1, value); // Mínimo 1
    setQuantity(newQuantity);
  };

  const handleBuyNow = async () => {
    try {
      const response = await fetch('http://localhost:3010/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ productId: product.id, quantity })
      });

      if (!response.ok) throw new Error('Falha ao processar pedido!');
      alert('Pedido realizado com sucesso!');
    } catch (error) {
      console.error(error.message);
      alert('Erro ao comprar produto.');
    }
  };

  useEffect(() => {
    const details = document.querySelector(".details");
    const description = document.querySelector(".description-container");

    const handleScroll = () => {
      const descriptionBottom = description.getBoundingClientRect().bottom;
      const detailsHeight = details.offsetHeight;
      const detailsTop = details.getBoundingClientRect().top;

      if (descriptionBottom <= detailsHeight + 20) {
        details.classList.add("details-fixed");
        details.classList.remove("details-sticky");
      } else if (detailsTop < 10) {
        details.classList.add("details-sticky");
        details.classList.remove("details-fixed");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:3010/products/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`, // Token JWT
          },
        });
        const data = await response.json();

        if (response.ok) {
          setProduct(data);
          setSelectedImage(`${data.imageUrl[0]}`);
        } else {
          console.error('Erro ao carregar o produto:', data.error);
        }

        setLoading(false);
      } catch (error) {
        console.error('Erro ao buscar produto:', error);
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    const localKey = `soldUnits_${id}`;
    const storedValue = localStorage.getItem(localKey);

    let initialSoldUnits = Math.floor(Math.random() * (10000 - 500 + 1)) + 500; // Gera número aleatório entre 500 e 10000
    if (storedValue) {
      initialSoldUnits = Math.max(initialSoldUnits, parseInt(storedValue, 10));
    }

    setSoldUnits(initialSoldUnits);
    localStorage.setItem(localKey, initialSoldUnits);
  }, [id]);

  useEffect(() => {
    const localKey = `soldUnits_${id}`;
    const storedValue = parseInt(localStorage.getItem(localKey), 10);

    if (storedValue) {
      const newSoldUnits = storedValue + Math.floor(Math.random() * 10) + 1; // Incrementa de 1 a 10
      setSoldUnits(newSoldUnits);
      localStorage.setItem(localKey, newSoldUnits);
    }
  }, [id]);

  if (loading) {
    return <div className="loading">Carregando produto...</div>;
  }

  if (!product) {
    return <div>Erro ao carregar produto.</div>;
  }

  const userCommission = parseFloat(localStorage.getItem("userCommission")) || 0;
  const precoFinal = product.price * (1 + userCommission / 100);


  return (
    <div className="product-page">
      <header>
        <Header />
      </header>

      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <a href="/">Página inicial</a> &gt;
        <a href="/products"> Todos os produtos</a> &gt;
        <span> {product.name}</span>
      </nav>

      <div className="content">
        {/* Grupo: Galeria + Imagem Principal */}
        <div className="image-container">
          {/* Galeria Lateral */}
          <div className="gallery">
            <div className="thumbnail-list">
              {product.imageUrl.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Imagem ${index + 1}`}
                  className={`thumbnail ${selectedImage === image ? 'selected' : ''}`}
                  onClick={() => setSelectedImage(image)}
                />
              ))}
            </div>
          </div>

          {/* Imagem Principal */}
          <div className="main-image">
            <img src={selectedImage} alt={product.name} />
          </div>
        </div>

        {/* Informações do Produto */}
        <div className="details">
          <div className="sold-info">
            <span style={{ color: '#B7B7B7', fontSize: '14px' }}>
              Novo | {soldUnits} Vendidos
            </span>
          </div>
          <h1>{product.name}</h1> {/* Título do Produto */}


          <div className="product-info">
            <span className="product-code">(Cód. Item {product.sku})</span> |{' '}
            <span className="product-stock">Disponível em estoque.</span>
          </div>

          <div className="product-line"></div> {/* Adiciona a linha aqui */}

          <div className="variants">
            <h3>Cor:</h3>
            <div className="variant-button selected">{product.variants[0].value}</div>

            <h3>Tamanho:</h3>
            <div className="variant-options">
              {product.variants.slice(1).map((variant, index) => (
                <button
                  key={index}
                  className={`variant-button ${selectedVariant === index ? 'selected' : ''}`}
                  onClick={() => setSelectedVariant(index)}
                >
                  {variant.value}
                </button>
              ))}
            </div>
          </div>

          <div className="price-section">
            <div>
              <span className="price-label">Preço:</span>
              <span className="price-value">R$ {precoFinal.toFixed(2).replace(".", ",")}</span>
            </div>
            <p className="installments">
              Em até 12x de R$ {(precoFinal / 12).toFixed(2).replace(".", ",")}
            </p>
          </div>



          <div className="quantity">
            <label htmlFor="quantity">Quantidade:</label>
            <div className="quantity-container">
              <select
                id="quantity"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="quantity-selector"
              >
                {[...Array(10).keys()].map((num) => (
                  <option key={num + 1} value={num + 1}>
                    {num + 1}
                  </option>
                ))}
                <option value="10+">10+</option>
              </select>
              {/* <FontAwesomeIcon icon={faAngleDown} className="quantity-icon" />  */}
            </div>
          </div>

          <div className="delivery-section">
            <img
              src="/images/correios-logo_1.svg"
              alt="Logo Correios"
              className="delivery-logo"
            />
            <div className="delivery-info">
              <p>Entrega via Correios &copy;</p>
              <p className="delivery-status">Após o pagamento confirmado</p>
            </div>
            <p className="delivery-free">Frete Grátis</p>
          </div>

          <div className="additional-info">
            <div className="info-item">
              <FontAwesomeIcon icon={faRotateLeft} style={{ color: "#737b97", marginRight: "1px" }} />
              <p>
                <strong>Devolução grátis.</strong> Você tem 7 dias a partir da data de recebimento.
              </p>
            </div>
            <div className="info-item">
              <FontAwesomeIcon icon={faMedal} style={{ color: "#737b97", marginRight: "1px" }} />
              <p>
                <strong>Mais vendido</strong> entre os produtos da coleção.
              </p>
            </div>
          </div>


          <button className="buy-button" onClick={addToCart}>
            Adicionar Ao Carrinho
          </button>

          <div className="payment-section">
            <h3 className="payment-title">Nós Aceitamos</h3>
            <div className="payment-icons">
              <img src="/images/amex.svg" alt="American Express" />
              <img src="/images/boleto.svg" alt="Boleto" />
              <img src="/images/mastercard.svg" alt="Mastercard" />
              <img src="/images/visa.svg" alt="Visa" />
              <img src="/images/elo.svg" alt="Elo" />
              <img src="/images/icon-pix.avif" alt="Pix" />
            </div>
          </div>

        </div>


      </div>

      {/* Descrição do Produto */}
      <div className="description-container">
        <div className="description">
          <h2>Descrição</h2>
          <div dangerouslySetInnerHTML={{ __html: product.description }} />
        </div>
      </div>

      <section className='benefits'>
        <Benefits />
      </section>
      <footer>
        <Footer />
      </footer>
    </div>

  );
};

export default ProductPage;
