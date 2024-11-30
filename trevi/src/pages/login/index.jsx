import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import logoTrevi from './logo-trevi.png';
import defaultUserIcon from './defaultUserIcon.png';
import './style.css';

const LoginUsuario = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mensagemErro, setMensagemErro] = useState('');
  const [etapa, setEtapa] = useState(1); // Etapa 1: Email, Etapa 2: Senha
  const [usuarioNome, setUsuarioNome] = useState('');
  const [usuarioImagem, setUsuarioImagem] = useState(defaultUserIcon);
  const [loadingNextStep, setLoadingNextStep] = useState(false);
  const [loadingLogin, setLoadingLogin] = useState(false);

  const navigate = useNavigate();

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (etapa === 1) {
        handleProximaEtapa();
      } else if (etapa === 2) {
        handleSubmit(e);
      }
    }
  };

  const handleProximaEtapa = async () => {
    setLoadingNextStep(true);
    try {
      if (email) {
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Simula o spinner por 2 segundos

        const response = await fetch('http://localhost:3000/users/email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: email }),
        });

        if (!response.ok) {
          throw new Error('Usuário não encontrado');
        }

        const data = await response.json();
        setUsuarioNome(data.name);
        setUsuarioImagem(data.image ? data.image : defaultUserIcon);

        setEtapa(3);
        setTimeout(() => {
          setEtapa(2);
        }, 600);
      } else {
        throw new Error('Por favor, insira um email válido.');
      }
    } catch (error) {
      setMensagemErro(error.message);
      balancarInput('email');
    } finally {
      setLoadingNextStep(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingLogin(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simula o spinner por 2 segundos

      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: senha,
        }),
      });

      if (!response.ok) {
        throw new Error('Usuário ou senha incorretos!');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      navigate('/home');
    } catch (error) {
      setMensagemErro(error.message);
      balancarInput('senha');
    } finally {
      setLoadingLogin(false);
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

  return (
    <div className="login-container" onKeyDown={handleKeyDown}>
      <div className="login-form-wrapper">
        <div className={`login-form ${etapa === 3 ? 'slide-out-left' : ''}`}>
          <img src={logoTrevi} alt="Logo Trevi" className="logo-trevi" />

          {etapa === 1 && (
            <>
              <h2>Fazer login</h2>
              <p className="login-subtitle">Use sua Conta Trevi</p>
              {mensagemErro && <p className="mensagem-erro">{mensagemErro}</p>}
              <div className="input-group">
                <label htmlFor="email">E-mail ou telefone</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button
                type="button"
                className="login-button"
                onClick={handleProximaEtapa}
                disabled={loadingNextStep}
              >
                {loadingNextStep ? <div className="spinner"></div> : 'Próxima'}
              </button>
              {/* Botão Criar Conta */}
              <button
                type="button"
                className="create-account-button"
                onMouseEnter={(e) => {
                  const rect = e.target.getBoundingClientRect();
                  const x = e.clientX - rect.left; // Posição horizontal relativa ao botão
                  const y = e.clientY - rect.top; // Posição vertical relativa ao botão
                  e.target.style.setProperty('--hover-top', `${y}px`);
                  e.target.style.setProperty('--hover-left', `${x}px`);
                }}
                onClick={() => navigate('/cadastro')}
              >
                <span>Criar Conta</span>
              </button>
            </>
          )}

          {etapa === 2 && (
            <div className="slide-in-right">
              <div className="user-info">
                <img src={usuarioImagem} alt="Usuário" className="user-icon" />
                <h3 className="user-name">{usuarioNome}</h3>
              </div>
              <div className="input-group senha-group">
                <label htmlFor="senha">Digite sua senha</label>
                <div className="senha-input-wrapper">
                  <input
                    type={mostrarSenha ? 'text' : 'password'}
                    id="senha"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                  />
                  <FontAwesomeIcon
                    icon={mostrarSenha ? faEyeSlash : faEye}
                    onClick={toggleMostrarSenha}
                    className="icone-olho"
                  />
                </div>
              </div>
              <p className="esqueceu-senha">Esqueceu sua senha?</p>
              {mensagemErro && <p className="mensagem-erro">{mensagemErro}</p>}
              <button
                type="submit"
                className="login-button"
                onClick={handleSubmit}
                disabled={loadingLogin}
              >
                {loadingLogin ? <div className="spinner"></div> : 'Entrar'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginUsuario;
