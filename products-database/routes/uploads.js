import express from 'express';
import multer from 'multer';
import fs from 'fs';
import { uploadFile } from '../googleDriveService.js'; // Ajuste conforme necessário
import dotenv from 'dotenv';

dotenv.config(); // Garantir que as variáveis do .env sejam carregadas

import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware de autenticação para verificar o token JWT
const authenticateToken = (req, res, next) => {
  console.log('Cabeçalhos recebidos:', req.headers); // Para verificar todos os cabeçalhos
  const authHeader = req.headers['authorization'];
  console.log('Cabeçalho de autorização recebido:', authHeader);

  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    console.log('Token ausente');
    return res.status(401).json({ error: 'Acesso não autorizado!' });
  }

  console.log('TOKEN_SECRET:', process.env.TOKEN_SECRET);

  jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
      if (err) {
          if (err.name === 'TokenExpiredError') {
              console.log('Erro: Token expirado');
              return res.status(403).json({ error: 'Token expirado!' });
            }
            console.log('Erro ao verificar o token:', err.message); // Log para ver qual erro está acontecendo
            return res.status(403).json({ error: 'Token inválido!' });
        }
        console.log('Token válido, usuário autenticado:', user);
        req.user = user;
        next();
    });
};
// Verificar o TOKEN_SECRET
console.log('TOKEN_SECRET:', process.env.TOKEN_SECRET); // Para garantir que o TOKEN_SECRET esteja sendo carregado

// Configuração do multer para upload temporário
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const mimeTypesAllowed = ['image/jpeg', 'image/png', 'application/pdf'];
    if (mimeTypesAllowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não suportado. Apenas JPEG, PNG e PDF são permitidos.'));
    }
  },
});

// Rota de upload de imagem
router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
  console.log('POST /api/upload chamado');
  try {
    const { file } = req;
    if (!file) {
      throw new Error('Nenhum arquivo foi enviado.');
    }

    const fileName = file.originalname;

    // Enviar o arquivo para o Google Drive
    const driveResponse = await uploadFile(file.path, fileName);

    // Apagar o arquivo temporário local
    fs.unlinkSync(file.path);
    console.log('Arquivo enviado e temporário removido');

    res.status(200).json({
      message: 'Imagem enviada com sucesso!',
      file: driveResponse,
    });
  } catch (error) {
    console.error('Erro ao enviar a imagem:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
