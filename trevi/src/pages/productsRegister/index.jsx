import { useState, useEffect } from "react";
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

  const [file, setFile] = useState(null); // Estado para armazenar o arquivo
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [token, setToken] = useState(null); // Novo estado para armazenar o token
  const navigate = useNavigate();

  // Recuperar o token do localStorage assim que o componente for montado
  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    if (storedToken) {
      setToken(storedToken); // Armazenar o token no estado
      setMessage(""); // Limpar a mensagem de erro se o token estiver disponível
    } else {
      setMessage("Token de autenticação ausente. Faça o login novamente.");
    }
  }, []); // Executar apenas quando o componente for montado

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Atualizar o estado do arquivo quando o usuário faz upload de uma imagem
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Verificar se o token ainda está disponível
    if (!token) {
      setMessage("Token de autenticação ausente. Faça o login novamente.");
      setLoading(false);
      return;
    }

    try {
      // Criar um FormData para enviar os dados do produto e o arquivo
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      if (file) {
        data.append("file", file); // Adicionar o arquivo ao FormData
      }

      // Fazer a requisição para o backend
      const response = await fetch("http://localhost:3010/products", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // Enviar o token JWT no cabeçalho
        },
        body: data,
      });

      // Tratamento da resposta
      if (response.status === 201) {
        setMessage("Produto cadastrado com sucesso!");
        setTimeout(() => {
          navigate("/home");
        }, 2000); // Redireciona após 2 segundos
      } else if (response.status === 403) {
        setMessage("Erro: Acesso negado! Verifique seu login.");
      } else {
        const errorData = await response.json();
        setMessage(`Erro ao cadastrar produto: ${errorData.error}`);
      }
    } catch (error) {
      setMessage("Erro ao cadastrar produto: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cadastro-produto-container">
      <form className="cadastro-produto-form" onSubmit={handleSubmit}>
        <h2>Cadastro de Produto</h2>
        {message && <p className={`mensagem ${message.includes("Erro") ? "error" : ""}`}>{message}</p>}

        {/* Campos do formulário para dados do produto */}
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

        {/* Novo campo de upload de imagem */}
        <div className="input-group">
          <label htmlFor="file">Imagem do Produto</label>
          <input
            type="file"
            id="file"
            name="file"
            onChange={handleFileChange}
            accept="image/*"
          />
        </div>

        {/* Botão de envio */}
        <button type="submit" className="cadastro-produto-button" disabled={loading}>
          {loading ? <div className="spinner"></div> : "Cadastrar Produto"}
        </button>
      </form>
    </div>
  );
};

export default CadastroProduto;
