import express from "express";
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from "multer";
import fs from 'fs';
import xlsx from "xlsx";
import cloudinary from "./cloudinary.js";
import mime from 'mime-types';
import { Server } from "socket.io";
import adminMiddleware from "./adminMiddleware.js";





dotenv.config();

const app = express();


app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      "http://localhost:5173",
      "https://affiliattes-trevi-front-58c0p0aua.vercel.app",
      "https://affiliattes-trevi-front-pub1b76z3.vercel.app",
      "https://affiliattes-trevi-front-h3apct1ac.vercel.app",
      "https://affiliattes-trevi-front.vercel.app",
      "https://afiliadostreviart.store",
      "https://www.afiliadostreviart.store",
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Não permitido por CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-socket-id"],
}));



app.use(express.json()); // Suporte para JSON

// Configuração do Prisma
const prisma = new PrismaClient();

// Configurar Uploads
const upload = multer({ dest: "uploads/" });

// Middleware para autenticação JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Acesso não autorizado!' });

  jwt.verify(token, process.env.TOKEN_SECRET, { algorithms: ['HS256'] }, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido!' });
    req.user = user;
    next();
  });
};

// ==============================
// ROTAS DE USUÁRIOS
// ==============================

// Criar Usuário
app.post('/users', async (req, res) => {
  try {
    const { name, email, phone, password, isAdmin, createdBy } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ error: "Todos os campos são obrigatórios." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone, // ✅ Agora salvando telefone
        password: hashedPassword,
        isAdmin: isAdmin || false, // ✅ Garantindo que recebe um valor booleano
        createdBy, // ✅ Registrando quem criou o usuário
      },
    });

    const token = jwt.sign({ id: user.id, email: user.email, isAdmin: user.isAdmin }, process.env.TOKEN_SECRET, { expiresIn: '1h' });

    res.json({ user, token });
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    res.status(400).json({ error: "Erro ao criar usuário." });
  }
});


// Login de Usuário
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Usuário ou senha incorretos!" });
    }

    const token = jwt.sign(
      { id: user.id, isAdmin: user.isAdmin }, // 🔹 Agora incluindo isAdmin no token
      process.env.TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      userId: user.id,
      isAdmin: user.isAdmin,  // 🔹 Garante que isAdmin seja enviado corretamente
      profileCompleted: user.profileCompleted, // ✅ Agora o frontend recebe o estado correto
    });
  } catch (error) {
    res.status(500).json({ error: "Erro ao realizar login" });
  }
});

// Rota para listar usuários (Apenas Admins)
app.get("/admin/users", authenticateToken, adminMiddleware, async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar usuários" });
  }
});

// Rota para listar pedidos (Apenas Admins)
// Rota para listar pedidos (Apenas Admins)
app.get("/admin/orders", authenticateToken, adminMiddleware, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            createdBy: true, // 🔹 Agora incluindo o ID do responsável pelo cadastro
          },
        },
      },
    });

    // 🔹 Buscar os nomes dos admins responsáveis
    const ordersWithAdminNames = await Promise.all(
      orders.map(async (order) => {
        if (order.user?.createdBy) {
          try {
            const admin = await prisma.user.findUnique({
              where: { id: order.user.createdBy },
              select: { name: true },
            });

            return { ...order, adminName: admin?.name || "Desconhecido" };
          } catch (error) {
            console.error("Erro ao buscar admin responsável:", error);
          }
        }
        return { ...order, adminName: "Desconhecido" };
      })
    );

    res.json(ordersWithAdminNames);
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error);
    res.status(500).json({ error: "Erro ao buscar pedidos." });
  }
});


// Rota para listar produtos (Apenas Admins)
app.get("/admin/products", authenticateToken, adminMiddleware, async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar produtos" });
  }
});



// Obter Todos os Usuários
app.get('/users', authenticateToken, async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar usuários." });
  }
});

// Buscar Usuário por ID
// Buscar Usuário por ID
app.get("/users/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        document: true, // ✅ Incluindo CPF/CNPJ
        adress: true, // ✅ Incluindo endereço completo
        avatarUrl: true,
        hasAcceptedTerms: true,
        tipoPessoa: true, // ✅ Isso resolve o problema!
      },
    });

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    // ✅ Garante que `adress` nunca será `null`
    user.adress = user.adress || {
      cep: "",
      rua: "",
      numero: "",
      complemento: "",
      cidade: "",
      estado: "",
      bairro: "",
      referencia: "",
    };

    res.json(user);
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    res.status(500).json({ error: "Erro ao buscar usuário." });
  }
});


// Atualizar Usuário
app.put('/users/:id', authenticateToken, async (req, res) => {
  try {
    const { name, phone, password, document, adress, level, profileCompleted, hasAcceptedTerms, tipoPessoa } = req.body;
    const userId = req.params.id;

    if (!userId || userId === "undefined") {
      return res.status(400).json({ error: "ID do usuário inválido." });
    }

    // Inicializa objeto para atualização
    let data = { name, phone, document, adress };

    if (tipoPessoa !== undefined) {
      data.tipoPessoa = tipoPessoa?.toLowerCase() ?? null;
    }

    if (profileCompleted !== undefined) {
      data.profileCompleted = profileCompleted;
    }

    // Atualiza a senha caso seja enviada
    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    // Atualiza o nível do usuário (1 a 5)
    if (level !== undefined) {
      const parsedLevel = parseInt(level, 10);
      if (isNaN(parsedLevel) || parsedLevel < 1 || parsedLevel > 5) {
        return res.status(400).json({ error: "Nível inválido." });
      }
      data.level = parsedLevel;
    }

    // ✅ Se `adress` vier vazio, evita salvar `null`
    if (adress !== undefined) { // 🔹 Só atualiza o endereço se ele for enviado na requisição
      data.adress = {
        cep: adress.cep || null,
        rua: adress.rua || null,
        numero: adress.numero || null,
        complemento: adress.complemento || null,
        cidade: adress.cidade || null,
        estado: adress.estado || null,
        bairro: adress.bairro || null,
        referencia: adress.referencia || null,
      };
    }

    if (hasAcceptedTerms === true) {
      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { hasAcceptedTerms: true },
      });

      if (!existingUser.hasAcceptedTerms) {
        data.hasAcceptedTerms = true;
      }
    }



    console.log("📥 Dados recebidos no backend:", JSON.stringify(req.body, null, 2));


    // Atualiza usuário no banco de dados
    const user = await prisma.user.update({
      where: { id: userId },
      data,
    });

    res.json(user);
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    res.status(400).json({ error: "Erro ao atualizar usuário." });
  }
});


// Deletar Usuário
app.delete('/users/:id', authenticateToken, async (req, res) => {
  const userId = req.params.id;

  try {
    // Excluir todos os pedidos do usuário
    await prisma.order.deleteMany({
      where: { userId },
    });

    // Agora sim, pode excluir o usuário
    await prisma.user.delete({
      where: { id: userId },
    });

    res.json({ message: "Usuário e pedidos deletados com sucesso!" });
  } catch (error) {
    console.error("Erro ao deletar usuário:", error);
    res.status(500).json({ error: "Erro ao deletar usuário." });
  }
});



// Buscar Usuário por E-mail
app.post('/users/email', async (req, res) => {
  console.log("📨 Body recebido em /users/email:", req.body);

  try {
    if (!req.body.email) {
      return res.status(400).json({ error: "Email é obrigatório." });
    }

    const user = await prisma.user.findUnique({ where: { email: req.body.email } });

    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    res.json(user);
  } catch (error) {
    console.error("Erro ao buscar usuário por e-mail:", error);
    res.status(500).json({ error: "Erro ao buscar usuário por e-mail." });
  }
});


app.post("/users/:id/avatar", upload.single("avatar"), async (req, res) => {
  try {
    const filePath = req.file.path;
    const result = await cloudinary.uploader.upload(filePath);
    const avatarUrl = result.secure_url;

    await prisma.user.update({
      where: { id: req.params.id },
      data: { avatarUrl },
    });

    res.json({ avatarUrl });
  } catch (error) {
    console.error("Erro ao fazer upload do avatar:", error);
    res.status(500).json({ error: "Erro ao fazer upload do avatar." });
  }
});

// ==============================
// ROTAS DE PRODUTOS
// ==============================

// Criar Produto
app.post("/products", authenticateToken, async (req, res) => {
  try {
    console.log("📥 Dados recebidos no backend:", JSON.stringify(req.body, null, 2)); // 🔹 Log detalhado

    const { name, description, price, sku, category, variants, imageUrl, userId } = req.body;

    if (!name || !description || !price || !category || !imageUrl || imageUrl.length === 0) {
      return res.status(400).json({ error: "Campos obrigatórios faltando ou inválidos." });
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice)) {
      return res.status(400).json({ error: "Preço inválido." });
    }

    let parsedVariants;
    try {
      parsedVariants = Array.isArray(variants) ? variants : JSON.parse(variants || "[]");
    } catch (error) {
      return res.status(400).json({ error: "Formato de variants inválido." });
    }

    // Buscar o nome do usuário que cadastrou o produto
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    // Buscar o maior SKU existente com prefixo "TRV"
    const lastProductWithSku = await prisma.product.findMany({
      where: {
        sku: {
          startsWith: "TRV",
        },
      },
      orderBy: {
        sku: 'desc',
      },
      take: 1,
    });

    let nextSku = "TRV01";
    if (lastProductWithSku.length > 0) {
      const lastSku = lastProductWithSku[0].sku;
      const lastNumber = parseInt(lastSku.replace("TRV", ""), 10);
      const nextNumber = (lastNumber + 1).toString().padStart(2, "0");
      nextSku = `TRV${nextNumber}`;
    }

    // Criar o produto com o próximo SKU
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parsedPrice,
        sku: nextSku, // 🔥 Usando o SKU gerado automaticamente
        category,
        imageUrl,
        variants: parsedVariants,
        createdBy: user.name,
      },
    });


    res.status(201).json(product);
  } catch (error) {
    console.error("❌ Erro ao criar produto:", error.message);
    res.status(500).json({ error: "Erro interno no servidor.", detalhes: error.message });
  }
});

// Rota para importação de produtos via planilha
app.post("/products/import", authenticateToken, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo enviado!" });
    }

    // Lendo a planilha
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Validando os dados
    const requiredFields = ["name", "description", "price", "category", "imageUrl"];
    for (const product of sheetData) {
      for (const field of requiredFields) {
        if (!product[field]) {
          return res.status(400).json({ error: `Campo obrigatório faltando: ${field}` });
        }
      }
    }

    // Convertendo os dados antes de salvar
    const productsToInsert = sheetData.map((product) => ({
      name: product.name,
      description: product.description,
      price: parseFloat(product.price),
      sku: product.sku || null,
      category: product.category,
      imageUrl: Array.isArray(product.imageUrl) ? product.imageUrl : [product.imageUrl],
      variants: product.variants ? JSON.parse(product.variants) : [],
    }));

    // Salvando no banco via Prisma
    const createdProducts = await prisma.product.createMany({
      data: productsToInsert,
    });

    // Removendo o arquivo após o processamento
    fs.unlinkSync(req.file.path);

    res.json({
      message: `${createdProducts.count} produtos importados com sucesso!`,
      products: createdProducts,
    });
  } catch (error) {
    console.error("Erro ao importar produtos:", error);
    res.status(500).json({ error: "Erro ao importar produtos." });
  }
});

// Listar Produtos


app.get("/products", authenticateToken, async (req, res) => {
  const { category } = req.query;

  try {
    const products = await prisma.product.findMany({
      where: category ? { category } : {}, // Se houver categoria, filtra
    });

    res.json(products);
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    res.status(500).json({ error: "Erro ao buscar produtos." });
  }
});


//Listar Produtos A Partir do Id

app.get('/products/:id', authenticateToken, async (req, res) => {
  try {
    console.log('Recebendo requisição para produto ID:', req.params.id); // Log do ID recebido

    const product = await prisma.product.findUnique({
      where: { id: req.params.id }, // Não converte para Int
    });

    if (!product) {
      console.log('Produto não encontrado para ID:', req.params.id); // Log para produto não encontrado
      return res.status(404).json({ error: "Produto não encontrado." });
    }

    res.json(product);
  } catch (error) {
    console.error('Erro ao buscar produto:', error); // Log detalhado do erro
    res.status(500).json({ error: "Erro ao buscar produto.", detalhes: error.message });
  }
});

app.get("/products", async (req, res) => {
  const { category } = req.query;

  try {
    let products;

    if (category) {
      products = await prisma.product.findMany({
        where: {
          category: {
            contains: category, // Tenta filtrar usando string
          },
        },
      });

      // Se não encontrar nada, tenta com regex (case insensitive)
      if (products.length === 0) {
        products = await prisma.$queryRaw`
          db.getCollection("products").find({ category: { $regex: ${category}, $options: "i" } }).toArray()
        `;
      }
    } else {
      products = await prisma.product.findMany();
    }

    res.json(products);
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    res.status(500).json({ error: "Erro ao buscar produtos." });
  }
});

// Atualizar Produto
app.put('/products/:id', authenticateToken, async (req, res) => {
  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json(product);
});

// Deletar Produto
app.delete('/products/:id', authenticateToken, async (req, res) => {
  await prisma.product.delete({ where: { id: req.params.id } });
  res.json({ message: "Produto deletado com sucesso!" });
});

// ==============================
// ROTAS DE COMISSÕES
// ==============================

// Definição dos níveis e comissões máximas
const MAX_COMMISSION_BY_LEVEL = {
  1: 10,  // Nível 1: até 10%
  2: 20,  // Nível 2: até 20%
  3: 30,  // Nível 3: até 30%
  4: 40,  // Nível 4: até 40%
  5: 100, // Nível 5: sem limite
};

// Definir comissão para um usuário
app.post("/commission", authenticateToken, async (req, res) => {
  const { userId, commission } = req.body;

  try {
    // Buscar usuário pelo ID e pegar o nível
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { level: true }, // Pegamos apenas o nível do usuário
    });

    if (!user) return res.status(404).json({ error: "Usuário não encontrado." });

    // Obter o nível do usuário
    const userLevel = user.level || 1; // Se não existir, assume nível 1
    const maxCommission = MAX_COMMISSION_BY_LEVEL[userLevel];

    // Valida se a comissão está dentro do limite
    if (commission > maxCommission) {
      return res.status(400).json({
        error: `A comissão máxima permitida para o nível ${userLevel} é de ${maxCommission}%.`,
      });
    }

    res.status(200).json({ message: "Comissão válida e aceita!", commission });
  } catch (error) {
    console.error("Erro ao definir comissão:", error);
    res.status(500).json({ error: "Erro interno ao definir comissão." });
  }
});

// Obter limite de comissão permitido para um usuário
app.get("/commission/:userId", authenticateToken, async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { level: true },
    });

    if (!user) return res.status(404).json({ error: "Usuário não encontrado." });

    const userLevel = user.level || 1; // Assume nível 1 se não estiver definido
    const maxCommission = MAX_COMMISSION_BY_LEVEL[userLevel];

    res.status(200).json({ userLevel, maxCommission });
  } catch (error) {
    console.error("Erro ao buscar comissão:", error);
    res.status(500).json({ error: "Erro ao buscar comissão." });
  }
});

app.post("/products/increase-prices", authenticateToken, async (req, res) => {
  const { percentage } = req.body;

  if (!percentage || percentage <= 0) {
    return res.status(400).json({ error: "Porcentagem inválida para aumento de preços." });
  }

  try {
    const products = await prisma.product.findMany();

    for (const product of products) {
      await prisma.product.update({
        where: { id: product.id },
        data: { price: product.price * (1 + percentage / 100) },
      });
    }

    res.status(200).json({ message: "Preços dos produtos aumentados com sucesso!" });
  } catch (error) {
    console.error("Erro ao atualizar preços dos produtos:", error);
    res.status(500).json({ error: "Erro interno ao atualizar preços." });
  }
});


// ==============================
// ROTAS DE PEDIDOS
// ==============================

app.post('/orders', authenticateToken, async (req, res) => {
  try {
    console.log("📥 Recebendo pedido:", req.body); // 🔹 Log detalhado

    const { userId, items, totalPrice, orderName, adress } = req.body;

    if (!userId || !items || totalPrice == null || !orderName || !adress) {
      console.log("❌ Campos obrigatórios ausentes:", { userId, items, totalPrice, orderName, adress });
      return res.status(400).json({ error: "Campos obrigatórios estão faltando." });
    }

    const formattedAdress = adress || {
      cep: "",
      rua: "",
      numero: "",
      complemento: "",
      cidade: "",
      estado: "",
      bairro: "",
      referencia: "",
    };

    const newOrder = await prisma.order.create({
      data: {
        userId,
        orderName,
        items,
        totalPrice,
        adress: formattedAdress, // 🔹 Agora salvando endereço do pedido
      },
    });

    console.log("✅ Pedido criado com sucesso:", newOrder);
    res.status(201).json(newOrder);
  } catch (error) {
    console.error("❌ Erro ao criar pedido:", error);
    res.status(500).json({ error: "Erro ao criar pedido." });
  }
});


app.get('/orders/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        orderName: true,
        items: true,
        totalPrice: true,
        adress: true,
        status: true, // ✅ Garantindo que `status` seja retornado
        createdAt: true, // ✅ Incluindo data de criação do pedido
      }
    });

    res.json(orders);
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error);
    res.status(500).json({ error: "Erro ao buscar pedidos." });
  }
});



app.get('/orders/details/:orderId', authenticateToken, async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.orderId },
      select: {
        id: true,
        orderName: true,
        items: true,
        totalPrice: true,
        adress: true,  // ✅ Incluindo `adress` explicitamente
        status: true,
        createdAt: true,
        userId: true,
      }
    });

    if (!order) {
      return res.status(404).json({ error: "Pedido não encontrado." });
    }

    // 🛠️ Garante que `items` seja um array no backend
    order.items = typeof order.items === "string" ? JSON.parse(order.items) : order.items;

    // ✅ Se `adress` for `null`, define um objeto vazio para evitar erro no frontend
    order.adress = order.adress || {
      cep: "",
      rua: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
      referencia: "",
    };

    res.json(order);
  } catch (error) {
    console.error("Erro ao buscar pedido:", error);
    res.status(500).json({ error: "Erro ao buscar pedido." });
  }
});


app.put('/orders/:orderId', authenticateToken, async (req, res) => {
  try {
    const { status, items, totalPrice, commission, adress } = req.body;

    // Verifica se o pedido existe
    const order = await prisma.order.findUnique({
      where: { id: req.params.orderId },
    });

    if (!order) {
      return res.status(404).json({ error: "Pedido não encontrado." });
    }

    // Recalcular o total do pedido aplicando a comissão, se necessário
    let updatedTotalPrice = totalPrice;
    if (commission !== undefined) {
      const commissionMultiplier = 1 + (commission / 100);
      updatedTotalPrice = totalPrice * commissionMultiplier;
    }

    // Criar objeto de atualização dinâmico
    let updateData = {
      status,
      items,
      totalPrice: updatedTotalPrice, // 🔹 Agora o total inclui a comissão!
      commission,
    };

    // Se o endereço foi enviado, atualiza ele também
    if (adress) {
      updateData.adress = adress;
    }

    // Atualiza os dados do pedido no banco
    const updatedOrder = await prisma.order.update({
      where: { id: req.params.orderId },
      data: updateData,
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error("Erro ao atualizar pedido:", error);
    res.status(500).json({ error: "Erro ao atualizar pedido." });
  }
});

app.delete('/orders/:orderId', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;

    await prisma.order.delete({
      where: { id: orderId },
    });

    res.json({ message: "Pedido deletado com sucesso!" });
  } catch (error) {
    console.error("Erro ao deletar pedido:", error);
    res.status(500).json({ error: "Erro ao deletar pedido." });
  }
});



// ==============================
// WEBSOCKET - Progresso de Upload
// ==============================

const PORT = process.env.PORT || 3010; // Padrão: 3010
const httpServer = app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://affiliattes-trevi-front-58c0p0aua.vercel.app",
      "https://affiliattes-trevi-front-pub1b76z3.vercel.app" // adicione aqui o novo domínio que deu erro
    ],
    methods: ["GET", "POST"],
  },
});


io.on("connection", (socket) => {
  console.log(`Cliente conectado: ${socket.id}`);
  let progress = 0;
  const interval = setInterval(() => {
    progress += 10;
    socket.emit("uploadProgress", progress);
    if (progress >= 100) clearInterval(interval);
  }, 1000);
});

