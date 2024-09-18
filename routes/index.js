const express = require('express');
const router = express.Router();
const productRoutes = require('./product');
const invoiceRoutes = require('./invoice');

router.use('/products', productRoutes);
router.use('/invoices', invoiceRoutes);

module.exports = router;