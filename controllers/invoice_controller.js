const { Op } = require('sequelize');
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
                order: [['createdAt', 'DESC']],
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

    static async getAllWithoutPagination(req, res) {
        try {
          const invoices = await Invoice.findAll({
            where: { discarded_at: null },
            order: [['createdAt', 'DESC']],
            include: [{ 
              model: InvoiceDetail, 
              where: { discarded_at: null }, 
              required: false,
              include: [{ model: Product }]
            }]
          });
          res.status(200).json(invoices);
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

    static async getBySpecificDate(req, res) {
        try {
          const { date, timeRange } = req.query;
          
          if (!date) {
            return res.status(400).json({ message: 'Date parameter is required' });
          }
    
          let startDate, endDate;
          switch (timeRange) {
            case 'daily':
              startDate = new Date(date);
              endDate = new Date(new Date(date).setHours(23, 59, 59, 999));
              break;
            case 'weekly':
              startDate = new Date(date);
              startDate.setDate(startDate.getDate() - startDate.getDay());
              endDate = new Date(startDate);
              endDate.setDate(endDate.getDate() + 6);
              endDate.setHours(23, 59, 59, 999);
              break;
            case 'monthly':
              startDate = new Date(date);
              startDate.setDate(1);
              endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0, 23, 59, 59, 999);
              break;
            default:
              startDate = new Date(date);
              endDate = new Date(new Date(date).setHours(23, 59, 59, 999));
          }
    
          const invoices = await Invoice.findAll({
            where: {
              createdAt: {
                [Op.between]: [startDate, endDate]
              },
              discarded_at: null
            },
            include: [{
              model: InvoiceDetail,
              include: [{
                model: Product,
              }]
            }]
          });
    
          const revenue = invoices.reduce((total, invoice) => {
            return total + invoice.InvoiceDetails.reduce((invoiceTotal, detail) => {
              return invoiceTotal + (detail.quantity * detail.Product.price);
            }, 0);
          }, 0);
    
          res.status(200).json({
            data: [{
              date: date,
              revenue: revenue
            }]
          });
        } catch (e) {
          console.error(e);
          res.status(500).json({ message: e.message });
        }
    }
}

module.exports = InvoiceController;