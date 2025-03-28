import React, { useEffect, useState } from 'react';
import Header from '../header/header.jsx';
import Footer from '../footer/footer.jsx';
import FeaturedCollection from '../featuredCollection/FeaturedCollection.jsx';
import Slideshow from '../slideShow/slideShow.jsx';
import Mosaic from '../mosaic/Mosaic.jsx';
import Benefits from '../benefits/Benefits.jsx';
import "./home.css"

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');
  const [profileCompleted, setProfileCompleted] = useState(localStorage.getItem("profileCompleted") === "true");

  useEffect(() => {
    const profileCompleted = localStorage.getItem("profileCompleted") === "true";
    const isAdmin = localStorage.getItem("isAdmin") === "true";
  
    if (!profileCompleted && !isAdmin) {
      window.location.href = "/userProfile";
    }
  }, []);
  

  const slides = [
    {
      image: '/images/modern-bronze-chandelier-from-below_800x.webp',
      title: 'YOUR ART...',
      subtitle: 'A Trevi quer que você se sinta bem, com os ambiente ao seu redor...',
      align: 'left', // Alinhado à esquerda
    },
    {
      image: '/images/yellow-pillow-bedside-table_800x.webp',
      title: 'YOUR ART...',
      subtitle: 'Seja com objetos específicos para sua necessidade, ou para facilitar o seu dia-a-dia...',
      align: 'right', // Alinhado à direita
    },
  ];

  const mosaicItems = [
    {
      image: '/images/todos os produtos.avif',
      title: 'Todos os produtos',
      subtitle: '',
      link: '/categoria/todos-produtos',
    },
    {
      image: '/images/banheiro.avif',
      title: 'Banheiro',
      subtitle: '',
      link: '/categoria/banheiro',
    },
    {
      image: '/images/cozinha.avif',
      title: 'Cozinha',
      subtitle: '',
      link: '/categoria/cozinha',
    },
    {
      image: '/images/decoracao.webp',
      title: 'Decoração',
      subtitle: '',
      link: '/categoria/decoracao',
    },
    {
      image: '/images/luminarias.avif',
      title: 'Luminárias de mesa',
      subtitle: '',
      link: '/categoria/luminarias',
    },
    {
      image: '/images/lustres.avif',
      title: 'Lustres e arandelas',
      subtitle: '',
      link: '/categoria/lustres',
    },
    {
      image: '/images/COLECAO_JARDIM_E_PISCINA_300x.avif',
      title: 'Piscina e Jardim',
      subtitle: '',
      link: '/categoria/jardim',
    },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/products`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      

        if (!response.ok) {
          throw new Error('Erro ao buscar produtos');
        }

        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Erro:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <p>Carregando produtos...</p>;
  }

  return (
    <div className="page-container">

      <div className="content-wrapper">
        <header>
          <Header />
        </header>

        <section className="slideshow-section">
          <Slideshow slides={slides} />
        </section>

        <section className="mosaic-section">
          <Mosaic items={mosaicItems} />
        </section>

        <section className="featured-section-container">
          <FeaturedCollection
            title="Produtos em Destaque"
            products={products}
            layout="vertical"
            linkTitle="Ver todos os produtos"
            linkUrl="/collections"
            productsCount={8}
          />
        </section>

        <section>
          <Benefits />
        </section>

        <footer>
          <Footer />
        </footer>
      </div>
    </div>
  );
};

export default Home;
