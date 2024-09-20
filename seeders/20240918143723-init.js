'use strict';
const crypto = require('crypto');
const { addDays, subDays } = require('date-fns');

function generateRandomId() {
  return crypto.randomBytes(4).toString('hex');
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Create 10 products
    const products = await queryInterface.bulkInsert('Products', [
      { name: 'Laptop', picture_url: `https://picsum.photos/id/0/200/200`, stock: 100, price: 999.99, createdAt: new Date(), updatedAt: new Date(), discarded_at: null },
      { name: 'Smartphone', picture_url: `https://picsum.photos/id/1/200/200`, stock: 150, price: 599.99, createdAt: new Date(), updatedAt: new Date(), discarded_at: null },
      { name: 'Headphones', picture_url: `https://picsum.photos/id/2/200/200`, stock: 75, price: 149.99, createdAt: new Date(), updatedAt: new Date(), discarded_at: null },
      { name: 'Smartwatch', picture_url: `https://picsum.photos/id/3/200/200`, stock: 200, price: 249.99, createdAt: new Date(), updatedAt: new Date(), discarded_at: null },
      { name: 'Tablet', picture_url: `https://picsum.photos/id/4/200/200`, stock: 50, price: 399.99, createdAt: new Date(), updatedAt: new Date(), discarded_at: null },
      { name: 'Desktop Computer', picture_url: `https://picsum.photos/id/5/200/200`, stock: 30, price: 1299.99, createdAt: new Date(), updatedAt: new Date(), discarded_at: null },
      { name: 'Wireless Earbuds', picture_url: `https://picsum.photos/id/6/200/200`, stock: 100, price: 129.99, createdAt: new Date(), updatedAt: new Date(), discarded_at: null },
      { name: 'External Hard Drive', picture_url: `https://picsum.photos/id/7/200/200`, stock: 80, price: 89.99, createdAt: new Date(), updatedAt: new Date(), discarded_at: null },
      { name: 'Wireless Mouse', picture_url: `https://picsum.photos/id/8/200/200`, stock: 120, price: 39.99, createdAt: new Date(), updatedAt: new Date(), discarded_at: null },
      { name: 'Keyboard', picture_url: `https://picsum.photos/id/9/200/200`, stock: 90, price: 59.99, createdAt: new Date(), updatedAt: new Date(), discarded_at: null }
    ], { returning: true });

    const customers = ['John Doe', 'Jane Smith', 'Alice Johnson', 'Bob Brown', 'Carol White', 'David Green', 'Eva Black', 'Frank Gray', 'Grace Lee', 'Henry Wilson'];
    const salespeople = ['Tom Salesman', 'Sarah Seller', 'Mike Merchant', 'Lisa Dealer', 'Paul Peddler'];
    const paymentTypes = ['CREDIT', 'CASH', 'NOTCASHORCREDIT'];

    const today = new Date();
    const invoices = [];

    // Create 50 invoices
    for (let i = 0; i < 50; i++) {
      const invoiceDate = subDays(today, getRandomInt(0, 60)); // Random date within the last 60 days
      const invoice = {
        customer: customers[getRandomInt(0, customers.length - 1)],
        salesperson: salespeople[getRandomInt(0, salespeople.length - 1)],
        payment_type: paymentTypes[getRandomInt(0, paymentTypes.length - 1)],
        notes: `Invoice #${i + 1}`,
        createdAt: invoiceDate,
        updatedAt: invoiceDate,
        discarded_at: null
      };
      invoices.push(invoice);
    }

    // Bulk insert all invoices
    const createdInvoices = await queryInterface.bulkInsert('Invoices', invoices, { returning: true });

    // Create invoice details
    const invoiceDetails = [];

    createdInvoices.forEach((invoice) => {
      const detailCount = getRandomInt(1, 5);
      for (let j = 0; j < detailCount; j++) {
        invoiceDetails.push({
          quantity: getRandomInt(1, 10),
          invoice_id: invoice.id,
          product_id: products[getRandomInt(0, products.length - 1)].id,
          createdAt: invoice.createdAt, // Use the same date as the invoice
          updatedAt: invoice.createdAt,
          discarded_at: null
        });
      }
    });

    // Bulk insert all invoice details
    await queryInterface.bulkInsert('InvoiceDetails', invoiceDetails);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('InvoiceDetails', null, {});
    await queryInterface.bulkDelete('Invoices', null, {});
    await queryInterface.bulkDelete('Products', null, {});
  }
};