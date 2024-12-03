import express from "express";
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const app = express();
app.use(express.json());



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
        // Verifica se há parâmetros na query string
        if (req.query) {
            // Construa as condições dinamicamente com base nos query params
            const filterConditions = {};

            if (req.query.name) {
                filterConditions.name = {
                    contains: req.query.name, // Filtra por nome, ignorando maiúsculas/minúsculas
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

            // Filtro de preço mínimo e máximo (se existirem)
            if (req.query.minPrice) {
                filterConditions.price = {
                    gte: parseFloat(req.query.minPrice) // Maior ou igual a minPrice
                };
            }

            if (req.query.maxPrice) {
                if (!filterConditions.price) {
                    filterConditions.price = {};
                }
                filterConditions.price.lte = parseFloat(req.query.maxPrice); // Menor ou igual a maxPrice
            }

            // Faz a consulta com os filtros aplicados
            products = await prisma.product.findMany({
                where: filterConditions
            });
        } else {
            // Caso não haja query params, retorna todos os produtos
            products = await prisma.product.findMany();
        }

        res.status(200).json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao buscar produtos" });
    }
});


app.put('/products/:id', async (req, res) => {

    console.log(req);

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
    await prisma.product.delete({
        where: {
            id: req.params.id
        }
    })

    res.status(200).json({ message: " Produto deletado com Sucesso! " });

})


app.listen(3010, () => {
    console.log('Servidor rodando na porta 3010');
});
