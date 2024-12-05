import express from "express";
import { PrismaClient } from '@prisma/client';
import cors from 'cors'; // Importar CORS
import bcrypt from 'bcryptjs'; // Para hash de senhas
import dotenv from 'dotenv';

dotenv.config();
import jwt from 'jsonwebtoken'; // Para criar tokens JWT
const prisma = new PrismaClient();
const app = express();

app.use(cors()); // Ativar CORS
app.use(express.json());

// Rota de criação de usuário
app.post('/users', async (req, res) => {
    try {
        // Criptografa a senha do usuário antes de salvar no banco
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const user = await prisma.user.create({
            data: {
                name: req.body.name,
                email: req.body.email,
                password: hashedPassword,
            }
        });
        // Gera o token JWT para autenticar o usuário automaticamente após o cadastro
        const token = jwt.sign(
            { id: user.id, email: user.email }, 
            process.env.TOKEN_SECRET, 
            { expiresIn: '1h' }
        );
        console.log('TOKEN_SECRET na geração do JWT:', process.env.TOKEN_SECRET);
          
          // Enviar o token na resposta
          res.json({ user, token });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: "Erro ao criar usuário. Verifique os dados enviados." });
    }
});

// Rota de login de usuário (exemplo básico com JWT)
/*app.post('/login', async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { email: req.body.email }
        });

        if (!user) {
            return res.status(400).json({ error: "Usuário não encontrado!" });
        }

        const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
        
        if (!isPasswordValid) {
            return res.status(400).json({ error: "Senha incorreta!" });
        }

        const user = { id: "dummyUserId", email };  // Apenas para simulação

        console.log('TOKEN_SECRET na geração do JWT:', process.env.TOKEN_SECRET);
        if (!process.env.TOKEN_SECRET) {
          return res.status(500).json({ error: 'TOKEN_SECRET não está definido no ambiente do servidor.' });
        }

        // Gera o token JWT
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.TOKEN_SECRET,
            { expiresIn: '1h', algorithm: 'HS256' }  // Garantir que o algoritmo está sendo especificado
          );

        res.status(200).json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao realizar login." });
    }
});*/

app.post('/login', async (req, res) => {
    try {
        // Buscar usuário pelo e-mail fornecido
        const user = await prisma.user.findUnique({
            where: { email: req.body.email }
        });

        if (!user) {
            return res.status(400).json({ error: "Usuário não encontrado!" });
        }

        // Verificar se a senha fornecida é válida
        const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
        
        if (!isPasswordValid) {
            return res.status(400).json({ error: "Senha incorreta!" });
        }

        // Exibir o TOKEN_SECRET para depuração
        console.log('TOKEN_SECRET na geração do JWT:', process.env.TOKEN_SECRET);

        if (!process.env.TOKEN_SECRET) {
            return res.status(500).json({ error: 'TOKEN_SECRET não está definido no ambiente do servidor.' });
        }

        // Gera o token JWT usando o usuário encontrado
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.TOKEN_SECRET,
            { expiresIn: '1h', algorithm: 'HS256' }  // Garantir que o algoritmo está sendo especificado
        );

        // Responder com o token gerado
        res.status(200).json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao realizar login." });
    }
});


// Rota de obter todos os usuários (somente para administração)
app.get('/users', async (req, res) => {
    try {
        const users = await prisma.user.findMany();
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao buscar usuários." });
    }
});

// Rota de atualizar um usuário
app.put('/users/:id', async (req, res) => {
    try {
        // Se a senha for fornecida, criptografa a nova senha
        const data = { ...req.body };

        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }

        const user = await prisma.user.update({
            where: { id: req.params.id },
            data: data
        });

        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: "Erro ao atualizar usuário." });
    }
});

// Rota de deletar um usuário
app.delete('/users/:id', async (req, res) => {
    try {
        await prisma.user.delete({
            where: { id: req.params.id }
        });

        res.status(200).json({ message: "Usuário deletado com sucesso!" });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: "Erro ao deletar usuário." });
    }
});

// Inicia o servidor
app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});


// Rota de obter usuário por email
app.post('/users/email', async (req, res) => {
    try {
        const email = req.body.email;

        const user = await prisma.user.findUnique({
            where: { email: email }
        });

        if (!user) {
            return res.status(404).json({ error: "Usuário não encontrado" });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao buscar usuário pelo email." });
    }
});
