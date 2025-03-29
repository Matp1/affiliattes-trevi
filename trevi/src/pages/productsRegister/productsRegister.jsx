import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import axios from "axios";
import SortableItem from "./SortableItem";
import "./productsRegister.css";
import { Editor } from "@tinymce/tinymce-react";


const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "products_preset"); // Nome do preset configurado no Cloudinary

  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/dse8ujkdq/image/upload`, // Cloud Name fixo
      formData
    );
    return response.data.secure_url; // Retorna o link seguro do Cloudinary
  } catch (error) {
    console.error("Erro ao enviar para o Cloudinary:", error);
    throw error;
  }
};

const CadastroProduto = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    sku: "",
    category: "",
  });

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [token, setToken] = useState(null);
  const [variantType, setVariantType] = useState("");
  const [variantValue, setVariantValue] = useState("");
  const [variants, setVariants] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [file, setFile] = useState(null);
  const [importMessage, setImportMessage] = useState("");

  const navigate = useNavigate();

  // Recuperar token do localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) setToken(storedToken);
    else setMessage("Token de autenticação ausente. Faça o login novamente.");
  }, []);


  const handleImport = async () => {
    if (!file) {
      setImportMessage("Por favor, selecione um arquivo.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/products/import`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });      

      setImportMessage(response.data.message);
    } catch (error) {
      setImportMessage("Erro ao importar produtos.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    console.log(`✏ Atualizando campo ${name}:`, value); // 🔹 Verifica se os valores estão sendo capturados

    setFormData((prevData) => ({
        ...prevData,
        [name]: value, // 🔹 Atualiza corretamente o estado
    }));
};

const handleEditorChange = (content, editor) => {
  console.log("✏ Atualizando descrição:", content); // 🔹 Verifica se TinyMCE está capturando as mudanças corretamente

  setFormData((prevData) => ({
      ...prevData,
      description: content, // 🔹 Atualiza o campo de descrição corretamente
  }));
};



  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files).slice(0, 50);
    const validFiles = selectedFiles.filter((file) => file.type.startsWith("image/"));

    setFiles((prev) => {
      const existingFiles = new Set(prev.map((file) => file.name));
      const newFiles = validFiles.filter((file) => !existingFiles.has(file.name));
      return [...prev, ...newFiles].slice(0, 50);
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files).slice(0, 50);
    const validFiles = droppedFiles.filter((file) => file.type.startsWith("image/"));

    setFiles((prev) => {
      const existingFiles = new Set(prev.map((file) => file.name));
      const newFiles = validFiles.filter((file) => !existingFiles.has(file.name));
      return [...prev, ...newFiles].slice(0, 50);
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setFiles((prev) => {
        const oldIndex = prev.findIndex((file) => file.name === active.id);
        const newIndex = prev.findIndex((file) => file.name === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  const handleRemoveFile = (fileName) => {
    setFiles((prev) => prev.filter((file) => file.name !== fileName));
  };

  const handleAddVariant = () => {
    if (variantType && variantValue) {
      setVariants([...variants, { type: variantType, value: variantValue }]);
      setVariantType("");
      setVariantValue("");
    }
  };

  const handleRemoveVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("🚀 handleSubmit foi chamado!"); // 🔹 Teste para ver se a função está sendo executada

    setLoading(true);
    setUploadProgress(0);

    console.log("🛠 Dados do formulário:", formData); // 🔹 Ver os valores antes da validação

    if (!formData.name || !formData.description || !formData.price || !formData.category) {
        console.log("❌ Campos faltando:", formData); // 🔹 Ver quais campos estão vazios
        setMessage("Por favor, preencha todos os campos obrigatórios!");
        setLoading(false);
        return;
    }

    console.log("✅ Todos os campos foram preenchidos. Continuando...");

    const price = parseFloat(formData.price);
    if (isNaN(price)) {
        console.log("❌ Erro: O preço não é um número válido.");
        setMessage("O preço deve ser um número válido.");
        setLoading(false);
        return;
    }

    try {
        console.log("📡 Preparando upload de imagens...");
        const imageUrls = [];
        for (const file of files) {
            const url = await uploadToCloudinary(file);
            imageUrls.push(url);
        }

        const userId = localStorage.getItem("userId"); // 🔹 Pegamos o usuário logado
        if (!userId) {
            console.log("❌ Usuário não autenticado!");
            setMessage("Usuário não autenticado.");
            setLoading(false);
            return;
        }

        const payload = {
            ...formData,
            price,
            variants: variants.length > 0 ? JSON.stringify(variants) : "[]",
            imageUrl: imageUrls,
            userId,
        };

        console.log("📤 Enviando Payload para o Backend:", JSON.stringify(payload, null, 2));

        const response = await axios.post(`${import.meta.env.VITE_API_URL}/products`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });        

        console.log("✅ Produto cadastrado com sucesso:", response.data);
        setMessage(`Produto "${response.data.name}" cadastrado com sucesso!`);
        setFormData({
            name: "",
            description: "",
            price: "",
            sku: "",
            category: "",
        });
        setFiles([]);
        setVariants([]);
        setUploadProgress(0);
    } catch (error) {
        console.error("❌ Erro ao cadastrar produto:", error);
        setMessage("Erro ao cadastrar produto. Verifique os campos e tente novamente.");
    } finally {
        setLoading(false);
    }
};

  const handleSpreadsheetUpload = (e) => {
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };
  



  return (
    <div className="products-register" onDragOver={handleDragOver} onDrop={handleDrop}>
      <h2>Cadastro de Produto</h2>
      <form onSubmit={handleSubmit} onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}>
        <input
          type="text"
          name="name"
          placeholder="Nome"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <Editor
          apiKey="93w69soa5e65xx0lv89rbfn5v8u5z4hjzvhdzllukur8v7jh" // Modo gratuito sem chave de API
          value={formData.description} // 🔹 Garante que o estado controle o conteúdo do editor
          init={{
              height: 300,
              menubar: false,
              plugins: "lists link image",
              toolbar: "undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat",
          }}
          onEditorChange={handleEditorChange} // 🔹 Garante que as mudanças sejam capturadas
      />

        <input
          type="number"
          name="price"
          placeholder="Preço"
          value={formData.price}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="sku"
          placeholder="SKU"
          value={formData.sku}
          onChange={handleChange}
        />
        <input
          type="text"
          name="category"
          placeholder="Categoria"
          value={formData.category}
          onChange={handleChange}
          required
        />

        {/* Variantes */}
        <div className="variant-inputs">
          <select value={variantType} onChange={(e) => setVariantType(e.target.value)}>
            <option value="">Selecione</option>
            <option value="Cor">Cor</option>
            <option value="Tamanho">Tamanho</option>
          </select>
          <input
            type="text"
            placeholder={`Digite a ${variantType || "variante"}`}
            value={variantValue}
            onChange={(e) => setVariantValue(e.target.value)}
            disabled={!variantType}
          />
          <button
            type="button"
            onClick={handleAddVariant}
            disabled={!variantType || !variantValue}
          >
            +
          </button>
        </div>

        {/* Lista de Variantes */}
        <ul className="variants-list">
          {variants.map((variant, index) => (
            <li key={index} className="variant-item">
              <span>{`${variant.type}: ${variant.value}`}</span>
              <button
                type="button"
                onClick={() => handleRemoveVariant(index)}
                className="remove-variant-button"
              >
                X
              </button>
            </li>
          ))}
        </ul>

        {/* Upload de arquivos */}
        <div
          className={`upload-area ${dragOver ? "drag-over" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            handleDrop(e);
            setDragOver(false);
          }}
          onClick={() => document.getElementById("fileInput").click()}
        >
          <div className="upload-icon">📂</div>
          <p>Arraste suas imagens aqui ou clique para selecionar</p>
          <input
            id="fileInput"
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </div>

        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={files.map((file) => file.name)}>
            <div className="image-preview">
              {files.map((file) => (
                <SortableItem
                  key={file.name}
                  id={file.name}
                  file={file}
                  onRemove={handleRemoveFile}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <button type="submit" disabled={loading}>
          {loading ? (
            <div className="progress-bar">
              <div
                className="progress"
                style={{ width: `${uploadProgress}%` }}
              >
                {uploadProgress}%
              </div>
            </div>
          ) : (
            "Cadastrar Produto"
          )}
        </button>
      </form>
      {message && <p>{message}</p>}
    {/*   <div>
        <h2>Importar Produtos via Planilha</h2>
        <input type="file" accept=".xlsx" onChange={handleSpreadsheetUpload} />
        <button onClick={handleImport}>Importar</button>
        {importMessage && <p>{importMessage}</p>}
      </div> */}

    </div>
  );
};

export default CadastroProduto;
