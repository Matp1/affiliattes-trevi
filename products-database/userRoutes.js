import express from 'express';
import { createUser, loginUser } from './userController.js';

const router = express.Router();

// Rotas para usuários
router.post('/users', createUser); // Criar usuário
router.post('/login', loginUser);  // Login de usuário

export default router;
