const { Product } = require('../models');

class ProductController {
    static async create(req, res) {
        try {
            const { name, picture_url, stock, price } = req.body;
            const newProduct = await Product.create({
                name,
                picture_url,
                stock,
                price
            });
            res.status(201).json(newProduct);
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    }

    static async getAll(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            const { count, rows } = await Product.findAndCountAll({
                where: {
                    discarded_at: null
                },
                limit: limit,
                offset: offset,
                order: [['id', 'ASC']]
            });

            const totalPages = Math.ceil(count / limit);

            res.status(200).json({
                data: rows,
                meta: {
                    totalItems: count,
                    itemsPerPage: limit,
                    currentPage: page,
                    totalPages: totalPages
                }
            });
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    }

    static async getOne(req, res) {
        try {
            const { id } = req.params;
            const product = await Product.findOne({
                where: {
                    id,
                    discarded_at: null
                }
            });
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }
            res.status(200).json(product);
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const { name, picture_url, stock, price } = req.body;
            const [updated] = await Product.update(
                { name, picture_url, stock, price },
                { where: { id, discarded_at: null } }
            );
            if (updated) {
                const updatedProduct = await Product.findOne({ where: { id } });
                return res.status(200).json(updatedProduct);
            }
            throw new Error('Product not found');
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const deleted = await Product.update(
                { discarded_at: new Date() },
                { where: { id, discarded_at: null } }
            );
            if (deleted) {
                return res.status(204).send();
            }
            throw new Error('Product not found');
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    }
}

module.exports = ProductController;