import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./style.css";

const CadastroProduto = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    sku: "",
    category: "",
    size: "",
    color: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("http://localhost:3000/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      setMessage("Produto cadastrado com sucesso!");
      setTimeout(() => {
        navigate("/home");
      }, 2000); // Redireciona após 2 segundos
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cadastro-produto-container">
      <form className="cadastro-produto-form" onSubmit={handleSubmit}>
        <h2>Cadastro de Produto</h2>
        {message && <p className={`mensagem ${message.includes("Erro") ? "error" : ""}`}>{message}</p>}

        <div className="input-group">
          <label htmlFor="name">Nome do Produto</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="description">Descrição</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            required
          ></textarea>
        </div>

        <div className="input-group">
          <label htmlFor="price">Preço</label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            step="0.01"
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="sku">SKU</label>
          <input
            type="text"
            id="sku"
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="category">Categoria</label>
          <input
            type="text"
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="size">Tamanho</label>
          <input
            type="text"
            id="size"
            name="size"
            value={formData.size}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="color">Cor</label>
          <input
            type="text"
            id="color"
            name="color"
            value={formData.color}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="cadastro-produto-button" disabled={loading}>
          {loading ? <div className="spinner"></div> : "Cadastrar Produto"}
        </button>
      </form>
    </div>
  );
};

export default CadastroProduto;
