'use strict';
const crypto = require('crypto');

function generateRandomId() {
  return crypto.randomBytes(4).toString('hex');
}
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Create a single invoice
    const invoice = await queryInterface.bulkInsert('Invoices', [{
      customer: 'John Doe',
      salesperson: 'Jane Smith',
      payment_type: 'CREDIT',
      notes: 'First invoice seeded',
      createdAt: new Date(),
      updatedAt: new Date(),
      discarded_at: null
    }], { returning: true });

    // Create 5 products
    const products = await queryInterface.bulkInsert('Products', [
      { name: 'Laptop', picture_url: `https://picsum.photos/id/26/4209/2769`, stock: 100, price: 999.99, createdAt: new Date(), updatedAt: new Date(), discarded_at: null },
      { name: 'Smartphone', picture_url: `https://picsum.photos/id/26/4209/2769`, stock: 150, price: 599.99, createdAt: new Date(), updatedAt: new Date(), discarded_at: null },
      { name: 'Headphones', picture_url: `https://picsum.photos/id/26/4209/2769`, stock: 75, price: 149.99, createdAt: new Date(), updatedAt: new Date(), discarded_at: null },
      { name: 'Smartwatch', picture_url: `https://picsum.photos/id/26/4209/2769`, stock: 200, price: 249.99, createdAt: new Date(), updatedAt: new Date(), discarded_at: null },
      { name: 'Tablet', picture_url: `https://picsum.photos/id/26/4209/2769`, stock: 50, price: 399.99, createdAt: new Date(), updatedAt: new Date(), discarded_at: null }
    ], { returning: true });

    // Create 5 invoice details
    const invoiceDetails = await queryInterface.bulkInsert('InvoiceDetails', [
      { quantity: 999, invoice_id: invoice[0].id, product_id: products[0].id, createdAt: new Date(), updatedAt: new Date(), discarded_at: null },
      { quantity: 599, invoice_id: invoice[0].id, product_id: products[1].id, createdAt: new Date(), updatedAt: new Date(), discarded_at: null },
      { quantity: 149, invoice_id: invoice[0].id, product_id: products[2].id, createdAt: new Date(), updatedAt: new Date(), discarded_at: null },
      { quantity: 249, invoice_id: invoice[0].id, product_id: products[3].id, createdAt: new Date(), updatedAt: new Date(), discarded_at: null },
      { quantity: 399, invoice_id: invoice[0].id, product_id: products[4].id, createdAt: new Date(), updatedAt: new Date(), discarded_at: null }
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('InvoiceDetails', null, {});
    await queryInterface.bulkDelete('Products', null, {});
    await queryInterface.bulkDelete('Invoices', null, {});
  }
};
