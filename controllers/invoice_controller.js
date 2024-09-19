const { Invoice, InvoiceDetail, Product } = require('../models');
const { sequelize } = require('../models');

class InvoiceController {
    static async create(req, res) {
        const t = await sequelize.transaction();
        try {
            const { customer, salesperson, payment_type, notes, details } = req.body;
            
            if (!Array.isArray(details) || details.length === 0) {
                throw new Error('Bad request. Please provide valid invoice details');
            }
            
            const invalidDetails = details.some(detail => 
                !detail.product_id || 
                !detail.quantity || 
                typeof detail.quantity !== 'number' || 
                detail.quantity <= 0
            );
            
            if (invalidDetails) {
                throw new Error('Bad request. Each detail must have a valid product_id and a positive quantity');
            }
           
            const newInvoice = await Invoice.create({
                customer,
                salesperson,
                payment_type,
                notes
            }, { transaction: t });
    
            const invoiceDetails = details.map(detail => ({
                ...detail,
                invoice_id: newInvoice.id
            }));
            await InvoiceDetail.bulkCreate(invoiceDetails, { transaction: t });
    
            await t.commit();
            res.status(201).json(newInvoice);
        } catch (e) {
            await t.rollback();
            res.status(400).json({ message: e.message });
        }
    }

    static async getAll(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            const { count, rows } = await Invoice.findAndCountAll({
                where: { discarded_at: null },
                limit,
                offset,
                order: [['id', 'ASC']],
                include: [{
                    model: InvoiceDetail,
                    where: { discarded_at: null },
                    required: false
                }]
            });

            const totalPages = Math.ceil(count / limit);
            res.status(200).json({
                data: rows,
                meta: {
                    totalItems: count,
                    itemsPerPage: limit,
                    currentPage: page,
                    totalPages
                }
            });
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    }

    static async getOne(req, res) {
        try {
            const { id } = req.params;
            const invoice = await Invoice.findOne({
                where: { id, discarded_at: null },
                include: [{
                    model: InvoiceDetail,
                    where: { discarded_at: null },
                    required: false,
                    include: [{
                        model: Product
                    }]
                }]
            });

            if (!invoice) {
                return res.status(404).json({ message: 'Invoice not found' });
            }

            res.status(200).json(invoice);
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    }

    static async update(req, res) {
        const t = await sequelize.transaction();

        try {
            const { id } = req.params;
            const { customer, salesperson, payment_type, notes, details } = req.body;

            const [updated] = await Invoice.update(
                { customer, salesperson, payment_type, notes },
                { where: { id, discarded_at: null }, transaction: t }
            );

            if (updated) {
                if (details && details.length > 0) {
                    await InvoiceDetail.update(
                        { discarded_at: new Date() },
                        { where: { invoice_id: id }, transaction: t }
                    );

                    const newDetails = details.map(detail => ({
                        ...detail,
                        invoice_id: id
                    }));
                    await InvoiceDetail.bulkCreate(newDetails, { transaction: t });
                }

                await t.commit();
                const updatedInvoice = await Invoice.findOne({
                    where: { id },
                    include: [{
                        model: InvoiceDetail,
                        as: 'details',
                        where: { discarded_at: null },
                        required: false
                    }]
                });
                return res.status(200).json(updatedInvoice);
            }

            throw new Error('Invoice not found');
        } catch (e) {
            await t.rollback();
            res.status(500).json({ message: e.message });
        }
    }

    static async delete(req, res) {
        const t = await sequelize.transaction();

        try {
            const { id } = req.params;
            const deleted = await Invoice.update(
                { discarded_at: new Date() },
                { where: { id, discarded_at: null }, transaction: t }
            );

            if (deleted) {
                await InvoiceDetail.update(
                    { discarded_at: new Date() },
                    { where: { invoice_id: id, discarded_at: null }, transaction: t }
                );

                await t.commit();
                return res.status(204).send();
            }

            throw new Error('Invoice not found');
        } catch (e) {
            await t.rollback();
            res.status(500).json({ message: e.message });
        }
    }
}

module.exports = InvoiceController;