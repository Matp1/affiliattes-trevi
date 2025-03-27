import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

// Criar usuário
export const createUser = async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const user = await prisma.user.create({
            data: {
                name: req.body.name,
                email: req.body.email,
                password: hashedPassword,
                role: req.body.role || 'user'
            }
        });

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.TOKEN_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ user, token });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Erro ao criar usuário.' });
    }
};

// Login de usuário
export const loginUser = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { email: req.body.email }
        });

        if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.TOKEN_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Erro ao fazer login.' });
    }
};
