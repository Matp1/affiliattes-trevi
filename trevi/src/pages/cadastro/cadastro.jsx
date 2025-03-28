import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import logoTrevi from './logo-trevi.png';
import './cadastro.css';

const CadastroUsuario = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mensagemErro, setMensagemErro] = useState('');
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [telefone, setTelefone] = useState(''); // Novo campo telefone
  const [isAdmin, setIsAdmin] = useState(false); // Define se o usuário será admin
  const [validCaracteres, setValidCaracteres] = useState(false);
  const [validMaiuscula, setValidMaiuscula] = useState(false);
  const [validNumero, setValidNumero] = useState(false);

  const navigate = useNavigate();

  // Adicionando evento de tecla Enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const validarFormulario = () => {
    if (!nome.trim().includes(' ')) {
      setMensagemErro('Por favor, insira seu nome completo.');
      balancarInput('nome');
      return false;
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      setMensagemErro('Por favor, insira um email válido.');
      balancarInput('email');
      return false;
    }

    if (!validCaracteres || !validMaiuscula || !validNumero) {
      setMensagemErro('Sua senha não cumpre os requisitos mínimos.');
      balancarInput('senha');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagemErro('');

    if (!nome.includes(' ')) {
      setMensagemErro('Por favor, insira seu nome completo.');
      return;
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      setMensagemErro('Por favor, insira um email válido.');
      return;
    }

    if (!telefone) {
      setMensagemErro('Por favor, insira um telefone válido.');
      return;
    }

    const adminId = localStorage.getItem("userId"); // Captura o ID do admin logado

    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nome,
          email,
          phone: telefone,      // ✅ Telefone agora é enviado
          password: senha,
          isAdmin: isAdmin,      // ✅ Define corretamente se será admin
          createdBy: adminId,    // ✅ Registra quem criou
        }),
      });
      

      if (!response.ok) {
        throw new Error('Erro ao criar usuário.');
      }

      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        navigate('/admin-dashboard');
      }, 1000);
    } catch (error) {
      setMensagemErro(error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMostrarSenha = () => {
    setMostrarSenha(!mostrarSenha);
  };

  const balancarInput = (inputId) => {
    const input = document.getElementById(inputId);
    if (input) {
      input.classList.add('shake');
      setTimeout(() => {
        input.classList.remove('shake');
      }, 500);
    }
  };

  const validarSenha = (senha) => {
    setSenha(senha);
    setValidCaracteres(senha.length >= 8);
    setValidMaiuscula(/[A-Z]/.test(senha));
    setValidNumero(/\d/.test(senha));
  };

  return (
    <div className="login-container" onKeyDown={handleKeyDown}>
      <div className="login-form-wrapper">
        <div className="login-form">
          {/* Exibindo a logo Trevi */}
          <img src={logoTrevi} alt="Logo Trevi" className="logo-trevi" />

          <h2>Cadastre-se</h2>
          <p className="login-subtitle">Crie sua conta Trevi</p>

          {mensagemErro && <p className="mensagem-erro">{mensagemErro}</p>}

          <div className="input-group">
            <label htmlFor="nome">Nome completo</label>
            <input
              type="text"
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="telefone">Telefone</label>
            <input type="tel" id="telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} required />
          </div>

          <div className="input-group">
            <label htmlFor="email">E-mail</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group senha-group">
            <label htmlFor="senha">Senha</label>
            <div className="senha-input-wrapper">
              <input
                type={mostrarSenha ? 'text' : 'password'}
                id="senha"
                value={senha}
                onChange={(e) => validarSenha(e.target.value)}
                required
              />
              <FontAwesomeIcon
                icon={mostrarSenha ? faEyeSlash : faEye}
                onClick={toggleMostrarSenha}
                className="icone-olho"
              />
            </div>
          </div>

          <div className="senha-requisitos">
            <p className={validCaracteres ? 'valid' : 'invalid'}>
              <FontAwesomeIcon icon={validCaracteres ? faCheck : faTimes} />
              Pelo menos 8 caracteres
            </p>
            <p className={validMaiuscula ? 'valid' : 'invalid'}>
              <FontAwesomeIcon icon={validMaiuscula ? faCheck : faTimes} />
              Pelo menos 1 letra maiúscula
            </p>
            <p className={validNumero ? 'valid' : 'invalid'}>
              <FontAwesomeIcon icon={validNumero ? faCheck : faTimes} />
              Pelo menos 1 número
            </p>
          </div>

          <div className="input-group">
            <label htmlFor="isAdmin">O Usuário será Administrador?</label>
            <select id="isAdmin" value={isAdmin} onChange={(e) => setIsAdmin(e.target.value === "true")}>
              <option value="false">Não</option>
              <option value="true">Sim</option>
            </select>
          </div>


          <button
            type="submit"
            className="login-button"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? <div className="spinner"></div> : 'Cadastrar'}
          </button>
        </div>
      </div>

      {showToast && (
        <div className="toast">
          <p>Usuário criado com sucesso!</p>
        </div>
      )}
    </div>
  );
};

export default CadastroUsuario;
