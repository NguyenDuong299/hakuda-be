const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplier.controller');

router.get('/', supplierController.getAllSupplier);
router.post('/', supplierController.createSupplier);
router.get('/:id', supplierController.getSupplierById);
router.put('/:id', supplierController.updateSupplier);
router.delete('/:id', supplierController.deleteSupplier);

module.exports = router;
