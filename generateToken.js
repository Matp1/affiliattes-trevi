import jwt from 'jsonwebtoken';

// Secret do .env
const secret = "U2VncmVkb0RJRlNJQTN+Zn8wdUJuQCpSb2NoZTw0NU";

// Dados do usuário para o payload do token
const user = {
  id: "123456", // ID fictício, substitua pelo correto
  name: "Usuário Teste",
  email: "teste@email.com"
};

// Gera o token
const token = jwt.sign(user, secret, { expiresIn: '1h' }); // Token expira em 1 hora

console.log("Token Gerado:");
console.log(token);
