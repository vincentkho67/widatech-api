const express = require('express');
const router = express.Router();
const InvoiceController = require('../controllers/invoice_controller');

router.get('/', InvoiceController.getAll);
router.get('/:id', InvoiceController.getOne);
router.post('/', InvoiceController.create);
router.put('/:id', InvoiceController.update);
router.delete('/:id', InvoiceController.delete);

module.exports = router;