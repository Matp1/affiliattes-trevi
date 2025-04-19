import React, { useState, useEffect } from "react";
import axios from "axios";
import './PerfilAfiliado.css'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import Header from "../header/header.jsx";
import Footer from "../footer/footer.jsx";
import { useParams } from "react-router-dom"; // 🔹 Para capturar o ID na URL

const UserProfile = () => {
  const [userData, setUserData] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    document: "",
    adress: {
      cep: "",
      rua: "",
      numero: "",
      complemento: "",
      cidade: "",
      estado: "",
      bairro: "",
      referencia: "",
    },
    password: "",
    avatarUrl: "images/defaultUserIcon.png",
  });

  const [userAddress, setUserAddress] = useState({
    cep: "",
    rua: "",
    numero: "",
    complemento: "",
    cidade: "",
    estado: "",
    bairro: "",
    referencia: "",
  });


  const [loading, setLoading] = useState(true);
  const [avatarFile, setAvatarFile] = useState(null);
  const [tempAvatar, setTempAvatar] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); // Novo estado
  const token = localStorage.getItem("token");
  const [userLevel, setUserLevel] = useState(1); // Nível do usuário
  const [maxCommission, setMaxCommission] = useState(10); // Comissão máxima permitida
  const [commission, setCommission] = useState(""); // Valor da comissão escolhida
  const [productIncrease, setProductIncrease] = useState(""); // Porcentagem de aumento nos produtos
  const { id } = useParams(); // 🔹 Obtém o ID da URL (se existir)
  const isAdmin = localStorage.getItem("isAdmin") === "true"; // 🔹 Verifica se é admin
  const [tipoPessoa, setTipoPessoa] = useState("fisica"); // "fisica" ou "juridica"

  const loggedUserId = localStorage.getItem("userId");
  const userId = id || loggedUserId;


  // Buscar nível do usuário e a comissão máxima ao carregar a página
  useEffect(() => {
    const fetchUserCommission = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/commission/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });        

        if (response.status === 200) {
          setUserLevel(response.data.userLevel);
          setMaxCommission(response.data.maxCommission);
        }
      } catch (error) {
        console.error("Erro ao buscar comissão do usuário:", error);
      }
    };

    fetchUserCommission();
  }, [userId, token]);

  const handleCommissionChange = async () => {
    const commissionValue = parseFloat(commission);

    if (commissionValue > maxCommission) {
      alert(`A comissão máxima permitida para seu nível (${userLevel}) é ${maxCommission}%.`);
      return;
    }

    try {
      // Atualizar comissão do usuário no banco
      await axios.post(`${import.meta.env.VITE_API_URL}/commission`, {
        userId,
        commission: commissionValue,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });      

      // Armazenar a comissão no localStorage para uso em outras partes do site
      localStorage.setItem("userCommission", commissionValue);

      alert("Comissão definida com sucesso! Os preços agora refletem sua comissão.");
    } catch (error) {
      console.error("Erro ao definir a comissão:", error);
      alert("Erro ao definir a comissão.");
    }
  };

  const handleCompleteProfile = async () => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/users/${userId}`, {
        profileCompleted: true,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });      

      localStorage.setItem("profileCompleted", "true");
      alert("Cadastro concluído com sucesso!");

      window.location.href = "/home"; // ✅ Agora o usuário pode navegar livremente
    } catch (error) {
      console.error("Erro ao completar cadastro:", error);
      alert("Erro ao salvar as informações.");
    }
  };

  // Função para aumentar o preço dos produtos cadastrados
  const handleIncreasePrices = async () => {
    if (!productIncrease || productIncrease <= 0) {
      alert("Informe um valor válido para aumentar os preços.");
      return;
    }

    if (productIncrease > maxCommission) {
      alert(`O aumento máximo permitido é ${maxCommission}%.`);
      return;
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/products/increase-prices`, {
        percentage: parseFloat(productIncrease),
      }, 
      {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        alert("Preços dos produtos atualizados com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao aumentar preços:", error);
      alert("Erro ao atualizar os preços dos produtos.");
    }
  };

  // Buscar dados do usuário ao carregar a página

  // Buscar dados do usuário ao carregar a página
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });        

        const user = response.data;

        setUserData({
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          document: user.document || "",
          avatarUrl: user.avatarUrl || "images/defaultUserIcon.png",
        });

        // Garante que o endereço nunca será null
        setUserAddress(user.adress || {
          cep: "",
          rua: "",
          numero: "",
          complemento: "",
          cidade: "",
          estado: "",
          bairro: "",
          referencia: "",
        });

      } catch (error) {
        console.error("Erro ao buscar usuário:", error);
        alert("Erro ao carregar os dados do usuário.");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId, token]);

  // Formatar CPF e CNPJ automaticamente
  const formatDocument = (value) => {
    if (tipoPessoa === "fisica") {
      return value
        .replace(/\D/g, "")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
        .slice(0, 14);
    } else {
      return value
        .replace(/\D/g, "")
        .replace(/(\d{2})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1/$2")
        .replace(/(\d{4})(\d)/, "$1-$2")
        .slice(0, 18);
    }
  };

  // Buscar endereço pelo CEP
  const buscarCep = async () => {
    if (!userAddress.cep || userAddress.cep.length < 8) return;

    try {
      const response = await axios.get(`https://viacep.com.br/ws/${userAddress.cep}/json/`);
      if (!response.data.erro) {
        setUserAddress((prev) => ({
          ...prev,
          rua: response.data.logradouro || "",
          bairro: response.data.bairro || "",
          cidade: response.data.localidade || "",
          estado: response.data.uf || "",
        }));
      }
    } catch (error) {
      console.error("Erro ao buscar o CEP:", error);
    }
  };

  // Atualizar estado do usuário
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (Object.keys(userAddress).includes(name)) {
      setUserAddress((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else {
      setUserData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        

        const user = response.data;

        setUserData({
          ...user,
          document: user.document || "", // ✅ Garante que não será `null`
          adress: user.adress || { // ✅ Se `adress` vier como `null`, definimos um objeto padrão
            cep: "",
            rua: "",
            numero: "",
            complemento: "",
            cidade: "",
            estado: "",
            bairro: "",
            referencia: "",
          },
        });

        setTipoPessoa(user.document?.length === 14 ? "fisica" : "juridica");
      } catch (error) {
        console.error("Erro ao buscar usuário:", error);
        alert("Erro ao carregar os dados do usuário.");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId, token]);


  // Alerta ao sair se houver mudanças não salvas
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (hasUnsavedChanges) {
        event.preventDefault();
        event.returnValue = "Você tem alterações não salvas. Deseja continuar?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  // Atualiza a pré-visualização da imagem ao selecionar um novo arquivo
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
  
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempAvatar(reader.result);
      };
      reader.readAsDataURL(file);
  
      setAvatarFile(file);
      setHasUnsavedChanges(true);
  
      // Envia automaticamente
      await uploadAvatar(file);
    }
  };
  
  const uploadAvatar = async (file) => {
    const formData = new FormData();
    formData.append("avatar", file);
  
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/users/${userId}/avatar`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
  
      setUserData((prevData) => ({
        ...prevData,
        avatarUrl: response.data.avatarUrl,
      }));
      setTempAvatar(null);
      setAvatarFile(null);
      setHasUnsavedChanges(false);
      alert("Avatar atualizado com sucesso!");
    } catch (err) {
      console.error("Erro ao fazer upload do avatar:", err);
      alert("Erro ao fazer upload do avatar.");
    }
  };
  




  // Salvar alterações no backend
  const handleSave = async () => {
    try {
      // Certifica que o endereço não contém valores vazios antes de enviar
      const completeAddress = Object.fromEntries(
        Object.entries(userAddress).map(([key, value]) => [key, value || null])
      );

      const payload = {
        name: userData.name || "",
        document: userData.document || "",
        adress: completeAddress,
        ...(userData.password && { password: userData.password }), // ← só envia se tiver valor
      };
      

      console.log("📢 Payload enviado para o backend:", payload); // Debug

      await axios.put(`${import.meta.env.VITE_API_URL}/users/${userId}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Buscar os dados mais recentes do usuário após a atualização
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const updatedUser = response.data;
      console.log("✅ Dados do usuário atualizados:", updatedUser);

      // Verificar se os campos obrigatórios estão preenchidos
      const isProfileComplete =
        (updatedUser.name || "").trim() &&
        (updatedUser.document || "").trim() &&
        (updatedUser.adress?.cep || "").trim() &&
        (updatedUser.adress?.rua || "").trim() &&
        (updatedUser.adress?.numero || "").trim() &&
        (updatedUser.adress?.cidade || "").trim() &&
        (updatedUser.adress?.estado || "").trim();

      console.log("📢 isProfileComplete:", isProfileComplete);

      // Se todos os campos obrigatórios estiverem preenchidos, definir `profileCompleted`
      if (isProfileComplete) {
        await axios.put(`${import.meta.env.VITE_API_URL}/users/${userId}`, { profileCompleted: true }, {
          headers: { Authorization: `Bearer ${token}` },
        });        

        localStorage.setItem("profileCompleted", "true");

        console.log("✅ profileCompleted atualizado no localStorage:", localStorage.getItem("profileCompleted"));

        setTimeout(() => {
          window.location.reload(); // 🔥 Recarrega a página para garantir que o PrivateRoute capture a mudança
        }, 300);


        // Verifica se o usuário é admin e redireciona para a página correta
        const isAdmin = localStorage.getItem("isAdmin") === "true";
        alert("Perfil atualizado e cadastro concluído com sucesso!");

        if (isAdmin) {
          window.location.href = "/admin-dashboard"; // ✅ Se for admin, vai para o painel de admin
        } else {
          window.location.href = "/home"; // ✅ Se for usuário comum, vai para home
        }
      } else {
        alert("Perfil atualizado, mas ainda há campos obrigatórios em branco.");
      }
    } catch (err) {
      console.error("❌ Erro ao atualizar perfil:", err);
      alert("Erro ao atualizar perfil.");
    }
  };



  if (loading) return <p>Carregando...</p>;



  const defaultAvatar = "/images/defaultUserIcon.png"; // Caminho relativo à pasta public

  <img
    src={tempAvatar || userData.avatarUrl || defaultAvatar}
    alt="Avatar do usuário"
    className="profile-avatar"
  />


  return (
    <div>
      <header>
        <Header />
      </header>
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
        <h2 className="page-title">
          {isAdmin && id ? `Editando Usuário: ${userData.name}` : "Meu Perfil"}
        </h2>


        {/* Avatar */}
        <div className="profile-container">
          <div className="avatar-wrapper">
            <img src={tempAvatar || userData.avatarUrl || defaultAvatar} alt="Avatar do usuário" className="profile-avatar" />
            <div className="avatar-overlay">
              <FontAwesomeIcon icon={faPen} className="edit-icon" />
              <span className="edit-text">Editar foto de perfil</span>
              <input type="file" accept="image/*" className="file-input" onChange={handleAvatarChange} />
            </div>
          </div>
        </div>

        {/* Formulário de dados do usuário */}
        <form>
          <div>
            <label>Login (Email):</label>
            <input
              type="email"
              name="email"
              value={userData.email}
              readOnly
              className="profile-input"
              style={{ backgroundColor: "#f0f0f0", cursor: "not-allowed" }}
            />
          </div>
          <div>
            <label>Nome:</label>
            <input
              type="text"
              name="name"
              value={userData.name}
              onChange={handleInputChange}
              className="profile-input"
            />
          </div>

          {/* Seleção de Pessoa Física ou Jurídica */}
          <div className="input-group">
            <label>Você é Pessoa Física ou Jurídica?</label>
            <select value={tipoPessoa} onChange={(e) => setTipoPessoa(e.target.value)}>
              <option value="fisica">Pessoa Física</option>
              <option value="juridica">Pessoa Jurídica</option>
            </select>
          </div>

          {/* Input de CPF ou CNPJ */}
          <div className="input-group">
            <label>{tipoPessoa === "fisica" ? "CPF" : "CNPJ"}</label>
            <input
              type="text"
              name="document"
              value={userData.document || ""}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label>Senha:</label>
            <input
              type="password"
              name="password"
              placeholder="Nova senha (opcional)"
              onChange={handleInputChange}
              className="profile-input"
            />
          </div>

          {/* Campos de endereço */}
          <div className="input-group">
            <h3>Endereço</h3>
            <label>CEP:</label>
            <input type="text" name="cep" value={userAddress.cep} onChange={handleInputChange} onBlur={buscarCep} />

            <label>Rua:</label>
            <input type="text" name="rua" value={userAddress.rua} onChange={handleInputChange} />

            <label>Número:</label>
            <input type="text" name="numero" value={userAddress.numero} onChange={handleInputChange} />

            <label>Complemento:</label>
            <input type="text" name="complemento" value={userAddress.complemento} onChange={handleInputChange} />

            <label>Bairro:</label>
            <input type="text" name="bairro" value={userAddress.bairro} onChange={handleInputChange} />

            <label>Cidade:</label>
            <input type="text" name="cidade" value={userAddress.cidade} onChange={handleInputChange} />

            <label>Estado:</label>
            <input type="text" name="estado" value={userAddress.estado} onChange={handleInputChange} />

            <label>Referência:</label>
            <input type="text" name="referencia" value={userAddress.referencia} onChange={handleInputChange} />
          </div>

          <div className="commission-container">
            <label>Definir Comissão (%):</label>
            <div className="commission-input-group">
              <input
                type="number"
                name="commission"
                className="profile-input commission-input"
                placeholder={`Máximo permitido: ${maxCommission}%`}
                value={commission}
                onChange={(e) => setCommission(e.target.value)}
              />
              <button type="button" onClick={handleCommissionChange} className="save-button small-button">
                Salvar
              </button>
            </div>

            {/* Aceite dos Termos de Afiliação */}
            <div className="terms-container">
              <input
                type="checkbox"
                id="acceptTerms"
                checked={userData.hasAcceptedTerms}
                disabled={userData.hasAcceptedTerms}
                onChange={async (e) => {
                  if (e.target.checked) {
                    try {
                      await api.put(`/users/${userId}`, {
                        hasAcceptedTerms: true,
                      });
                    
                      setUserData((prev) => ({
                        ...prev,
                        hasAcceptedTerms: true,
                      }));
                    
                      alert("Você aceitou os Termos de Afiliação.");
                    }
                    catch (err) {
                      console.error("Erro ao salvar aceite dos termos:", err);
                      alert("Erro ao salvar o aceite dos termos.");
                    }
                  }
                }}
              />
              <label htmlFor="acceptTerms" className="terms-label">
                Declaro que Li e Concordo com os{" "}
                <a
                  href="/termo-de-afiliado.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="terms-link"
                >
                  Termos de Afiliação
                </a>
              </label>
            </div>


          </div>
          {(isAdmin || userId === userData.id) && (
            <button
              type="button"
              onClick={() => handleSave()}
              className="save-button"

            >
              Salvar Alterações
            </button>
          )}
        </form>
      </div>
      <footer>
        <Footer />
      </footer>
    </div>
  );
};

export default UserProfile;
