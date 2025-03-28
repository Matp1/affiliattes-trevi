import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import SortableItem from "../productsRegister/SortableItem.jsx";
import "../productsRegister/productsRegister.css";
import { Editor } from "@tinymce/tinymce-react";

const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "products_preset");

    try {
        const response = await axios.post(
            `https://api.cloudinary.com/v1_1/dse8ujkdq/image/upload`,
            formData
        );
        return response.data.secure_url;
    } catch (error) {
        console.error("Erro ao enviar para o Cloudinary:", error);
        throw error;
    }
};

const EditProduct = () => {
    const { id } = useParams(); // Obtém o ID do produto da URL
    const navigate = useNavigate();

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
    const [variants, setVariants] = useState([]);
    const [uploadProgress, setUploadProgress] = useState(0);

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (storedToken) setToken(storedToken);
        else setMessage("Token ausente. Faça login novamente.");

        const fetchProduct = async () => {
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_API_URL}/products/${id}`,
                    {
                      headers: { Authorization: `Bearer ${storedToken}` },
                    }
                  );                  

                const product = response.data;
                setFormData({
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    sku: product.sku || "",
                    category: product.category || "",
                });

                setFiles(
                    product.imageUrl.map((url, index) => ({
                        name: `image-${index}`,
                        url, // Mantemos a URL original
                    }))
                );
                setVariants(product.variants || []);

            } catch (error) {
                console.error("Erro ao buscar produto:", error);
            }
        };

        fetchProduct();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files).slice(0, 50);
        setFiles([...files, ...selectedFiles]);
    };

    const handleRemoveFile = (fileName) => {
        setFiles((prev) => prev.filter((file) => file.name !== fileName));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setUploadProgress(0);
    
        try {
            const imageUrls = [];
            for (const file of files) {
                if (file.url) {
                    imageUrls.push(file.url);
                } else {
                    const url = await uploadToCloudinary(file);
                    imageUrls.push(url);
                }
            }
    
            const payload = {
                ...formData,
                price: parseFloat(formData.price),
                variants: JSON.stringify(variants),
                imageUrl: imageUrls,
            };
    
            await axios.put(`${import.meta.env.VITE_API_URL}/products/${id}`, payload, {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              });
              
    
            alert("Produto atualizado com sucesso!"); // Exibe alerta
        } catch (error) {
            console.error("Erro ao atualizar produto:", error);
            alert("Erro ao atualizar produto. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="products-register">
            <h2>Editar Produto</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" name="name" placeholder="Nome" value={formData.name} onChange={handleChange} required />
                <Editor
                    apiKey="sua-chave-tinymce"
                    initialValue={formData.description}
                    onEditorChange={(content) => setFormData({ ...formData, description: content })}
                />
                <input type="number" name="price" placeholder="Preço" value={formData.price} onChange={handleChange} required />
                <input type="text" name="sku" placeholder="SKU" value={formData.sku} onChange={handleChange} />
                <input type="text" name="category" placeholder="Categoria" value={formData.category} onChange={handleChange} required />

                <div className="upload-area" onClick={() => document.getElementById("fileInput").click()}>
                    <p>Arraste ou clique para adicionar imagens</p>
                    <input id="fileInput" type="file" multiple accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
                </div>

                <DndContext collisionDetection={closestCenter}>
                    <SortableContext items={files.map((file) => file.name)}>
                        <div className="image-preview">
                            {files.map((file) => (
                                <SortableItem key={file.name} id={file.name} file={file.url ? { name: file.name, url: file.url } : file} onRemove={handleRemoveFile} />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>

                <button type="submit" disabled={loading}>
                    {loading ? "Atualizando..." : "Salvar Alterações"}
                </button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default EditProduct;
