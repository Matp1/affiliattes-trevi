import React, { useEffect, useState } from "react";
import Header from "../header/header";
import Benefits from "../benefits/Benefits.jsx";
import Footer from "../footer/footer";
import { useParams, useNavigate } from "react-router-dom"; 
import "./Category.css";

const Category = () => {
    const { category } = useParams(); // Captura a categoria da URL
    const [products, setProducts] = useState([]);
    const [sortOption, setSortOption] = useState("mais_vendidos");
    const [viewMode, setViewMode] = useState("grid");
    const [itemsPerPage, setItemsPerPage] = useState(12);
    const navigate = useNavigate(); // 🔹 Hook de navegação


    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const token = localStorage.getItem("token"); // 🔹 Pegando o token do usuário armazenado
                const response = await fetch(`${import.meta.env.VITE_API_URL}/products?category=${category}`, {
                    headers: {
                      Authorization: `Bearer ${token}`, // 🔹 Adicionando o token no cabeçalho da requisição
                      "Content-Type": "application/json",
                    },
                  });
                  

                if (response.status === 401) {
                    console.error("Erro 401: Não autorizado! Verifique o token.");
                    return;
                }

                const data = await response.json();
                setProducts(data);
            } catch (error) {
                console.error("Erro ao buscar produtos:", error);
            }
        };

        fetchProducts();
    }, [category]);


    return (
        <>
            <Header />
            <div className="category-container">
                <h1 className="category-title">{category}</h1>
                <p className="category-description">
                    Seleção especial de produtos para {category}, com as melhores opções de mercado!
                </p>

                {/* Lista de produtos */}
                <div className={`product-list ${viewMode}`}>
                    {products.slice(0, itemsPerPage).map((product) => (
                        <div key={product.id} className="product-card" onClick={() => navigate(`/product/${product.id}`)}>
                            <img
                                src={
                                    product.imageUrl && Array.isArray(product.imageUrl)
                                        ? product.imageUrl[0] // 🔹 Usa a primeira imagem do array
                                        : "/images/placeholder.png"
                                }
                                alt={product.name}
                                onError={(e) => (e.target.src = "/images/placeholder.png")} // 🔹 Evita erro se a imagem não carregar
                            />
                            <h3>{product.name}</h3>
                            <p className="price">R$ {product.price.toFixed(2)}</p>
                            <p className="installments">em até 12x de R$ {(product.price / 12).toFixed(2)}</p>
                        </div>
                    ))}
                </div>
            </div>
            <Benefits />
            <Footer />
        </>
    );
};

export default Category;
