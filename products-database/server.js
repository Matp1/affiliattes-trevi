import express from "express";
import { PrismaClient } from '@prisma/client';
import uploadRoutes from './routes/uploads.js';
const prisma = new PrismaClient();
const app = express();
import dotenv from 'dotenv';
dotenv.config();
import jwt from 'jsonwebtoken';

app.use(express.json());

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
  
    if (!token) {
      console.log('Token ausente');
      return res.status(401).json({ error: 'Acesso não autorizado!' });
    }
  
    console.log('TOKEN_SECRET na verificação:', process.env.TOKEN_SECRET);
    if (!process.env.TOKEN_SECRET) {
      return res.status(500).json({ error: 'TOKEN_SECRET não está definido no ambiente do servidor.' });
    }
  
    jwt.verify(token, process.env.TOKEN_SECRET, { algorithms: ['HS256'] }, (err, user) => {
      if (err) {
        console.log('Erro ao verificar o token:', err.message);
        return res.status(403).json({ error: 'Token inválido!' });
      }
      console.log('Token válido, usuário autenticado:', user);
      req.user = user;
      next();
    });
  };
  
  // Aplicar o middleware de autenticação à rota de upload
  app.use('/api/upload', authenticateToken, (req, res) => {
    res.json({ message: 'Arquivo enviado com sucesso!' });
  });
  
  // Montar a rota de upload de arquivos
  app.use('/api', uploadRoutes); 

// Rotas para produtos
app.post('/products', async (req, res) => {
    try {
        const product = await prisma.product.create({
            data: {
                name: req.body.name,
                description: req.body.description,
                price: req.body.price,
                sku: req.body.sku,
                category: req.body.category,
                size: req.body.size,
                color: req.body.color,
            }
        });
        res.status(201).json(product);
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: "Erro ao criar produto. Verifique os dados enviados." });
    }
});

app.get('/products', async (req, res) => {
    let products = [];
    
    try {
        const filterConditions = {};

        if (req.query.name) {
            filterConditions.name = {
                contains: req.query.name,
                mode: 'insensitive'
            };
        }

        if (req.query.category) {
            filterConditions.category = {
                contains: req.query.category,
                mode: 'insensitive'
            };
        }

        if (req.query.size) {
            filterConditions.size = {
                contains: req.query.size,
                mode: 'insensitive'
            };
        }

        if (req.query.color) {
            filterConditions.color = {
                contains: req.query.color,
                mode: 'insensitive'
            };
        }

        if (req.query.minPrice) {
            filterConditions.price = {
                gte: parseFloat(req.query.minPrice)
            };
        }

        if (req.query.maxPrice) {
            if (!filterConditions.price) {
                filterConditions.price = {};
            }
            filterConditions.price.lte = parseFloat(req.query.maxPrice);
        }

        products = await prisma.product.findMany({
            where: filterConditions
        });

        res.status(200).json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao buscar produtos" });
    }
});

app.put('/products/:id', async (req, res) => {
    try {
        const product = await prisma.product.update({
            where: {
                id: req.params.id
            },
            data: {
                name: req.body.name,
                description: req.body.description,
                price: req.body.price,
                sku: req.body.sku,
                category: req.body.category,
                size: req.body.size,
                color: req.body.color,
            }
        });
        res.status(201).json(product);
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: "Erro ao criar produto. Verifique os dados enviados." });
    }
});

app.delete('/products/:id', async (req, res) => {
    try {
        await prisma.product.delete({
            where: {
                id: req.params.id
            }
        });
        res.status(200).json({ message: "Produto deletado com Sucesso!" });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: "Erro ao deletar produto." });
    }
});

// Iniciar o servidor na porta 3010
app.listen(3010, () => {
    console.log('Servidor rodando na porta 3010');
});
