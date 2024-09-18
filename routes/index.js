const express = require('express');
const router = express.Router();
const productRoutes = require('./product');
const invoiceRoutes = require('./invoice');

router.use('/product', productRoutes);
router.use('/invoice', invoiceRoutes);

module.exports = router;