import express from "express";
import { PrismaClient } from '@prisma/client';
import uploadRoutes from './routes/uploads.js';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config(); // Carregar as variáveis do .env logo no início

// Inicializando o PrismaClient com tratamento de erro
let prisma;

try {
  prisma = new PrismaClient();
  console.log("Prisma Client inicializado com sucesso.");
} catch (error) {
  console.error("Erro ao inicializar o Prisma Client:", error);
}

const app = express();

// Adicionar o middleware de CORS
app.use(cors({ 
  origin: 'http://localhost:5173', // Permitir acesso do frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos HTTP permitidos
  allowedHeaders: ['Content-Type', 'Authorization'] // Cabeçalhos permitidos, incluindo autorização
}));

// Outros middlewares
app.use(express.json()); // Lidar com requisições JSON

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

// Montar a rota de upload de arquivos
app.use('/api', uploadRoutes);

// Aplicar o middleware de autenticação à rota de upload
app.post('/api/upload', authenticateToken, (req, res) => {
  res.json({ message: 'Arquivo enviado com sucesso!' });
});

// Rota para cadastrar um novo produto
app.post('/products', authenticateToken, async (req, res) => {
  try {
    // Verificar se prisma está inicializado
    if (!prisma) {
      console.error("Prisma não está inicializado.");
      return res.status(500).json({ error: "Erro interno do servidor: Prisma não está inicializado." });
    }

    console.log("Dados recebidos para criação do produto:", req.body);

    // Validar os campos obrigatórios
    const { name, description, price, sku, category, size, color } = req.body;

    if (!name || !description || !price || !sku || !category || !size || !color) {
      console.error("Campos obrigatórios ausentes:", req.body);
      return res.status(400).json({ error: "Campos obrigatórios ausentes." });
    }

    // Criar o produto no banco de dados
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price), // Garantir que o preço seja numérico
        sku,
        category,
        size,
        color,
      },
    });

    console.log("Produto criado com sucesso:", product);
    res.status(201).json(product);
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    res.status(400).json({ error: "Erro ao criar produto. Verifique os dados enviados." });
  }
});

// Rota para buscar todos os produtos com filtros
app.get('/products', authenticateToken, async (req, res) => {
  try {
    // Verificar se prisma está inicializado
    if (!prisma) {
      console.error("Prisma não está inicializado.");
      return res.status(500).json({ error: "Erro interno do servidor: Prisma não está inicializado." });
    }

    const filterConditions = {};

    if (req.query.name) {
      filterConditions.name = {
        contains: req.query.name,
        mode: 'insensitive',
      };
    }

    if (req.query.category) {
      filterConditions.category = {
        contains: req.query.category,
        mode: 'insensitive',
      };
    }

    if (req.query.size) {
      filterConditions.size = {
        contains: req.query.size,
        mode: 'insensitive',
      };
    }

    if (req.query.color) {
      filterConditions.color = {
        contains: req.query.color,
        mode: 'insensitive',
      };
    }

    if (req.query.minPrice) {
      filterConditions.price = {
        gte: parseFloat(req.query.minPrice),
      };
    }

    if (req.query.maxPrice) {
      if (!filterConditions.price) {
        filterConditions.price = {};
      }
      filterConditions.price.lte = parseFloat(req.query.maxPrice);
    }

    console.log('Condições de Filtro:', filterConditions);

    const products = await prisma.product.findMany({
      where: filterConditions,
    });

    console.log("Produtos encontrados:", products);
    res.status(200).json(products);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({ error: "Erro ao buscar produtos" });
  }
});

// Rota para atualizar um produto existente
app.put('/products/:id', authenticateToken, async (req, res) => {
  try {
    if (!prisma) {
      console.error("Prisma não está inicializado.");
      return res.status(500).json({ error: "Erro interno do servidor: Prisma não está inicializado." });
    }

    const { name, description, price, sku, category, size, color } = req.body;

    console.log("Dados recebidos para atualizar o produto:", req.body);

    const product = await prisma.product.update({
      where: {
        id: req.params.id,
      },
      data: {
        name,
        description,
        price: parseFloat(price),
        sku,
        category,
        size,
        color,
      },
    });

    console.log("Produto atualizado com sucesso:", product);
    res.status(200).json(product);
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(400).json({ error: "Erro ao atualizar produto. Verifique os dados enviados." });
  }
});

// Rota para deletar um produto existente
app.delete('/products/:id', authenticateToken, async (req, res) => {
  try {
    if (!prisma) {
      console.error("Prisma não está inicializado.");
      return res.status(500).json({ error: "Erro interno do servidor: Prisma não está inicializado." });
    }

    console.log("Tentando deletar produto com ID:", req.params.id);

    await prisma.product.delete({
      where: {
        id: req.params.id,
      },
    });

    console.log("Produto deletado com sucesso. ID:", req.params.id);
    res.status(200).json({ message: "Produto deletado com sucesso!" });
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    res.status(400).json({ error: "Erro ao deletar produto." });
  }
});

// Iniciar o servidor na porta 3010
app.listen(3010, () => {
  console.log('Servidor rodando na porta 3010');
});
