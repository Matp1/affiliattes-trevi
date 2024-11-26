import express from "express";
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'; // Para hash de senhas
import jwt from 'jsonwebtoken'; // Para criar tokens JWT (se for usar autenticação)

const prisma = new PrismaClient()

const app = express();
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

        res.status(201).json(user);
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: "Erro ao criar usuário. Verifique os dados enviados." });
    }
});
// Rota de login de usuário (exemplo básico com JWT)
app.post('/login', async (req, res) => {
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

        // Gera o token JWT
        const token = jwt.sign({ id: user.id, email: user.email }, 'secrettokenkey', { expiresIn: '1h' });

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