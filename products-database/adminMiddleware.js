import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const adminMiddleware = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: "Acesso negado. Apenas administradores podem acessar esta rota." });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: "Erro ao verificar permissões de administrador." });
  }
};

export default adminMiddleware;
