const factory = require('../controllers/factory.controllers');

const router = require('express').Router();

router.post('/entry_product', factory.entryBatchProduct); //
router.post('/send_product_to_agent', factory.sendProductToAgent);
router.post('/take_old_product', factory.takeOldProduct);
router.post('/take_err_product', factory.takeErrorProduct);

router.get('/list_product_to_agent', factory.getSendAgentProduct);
router.get('/new_product', factory.getNewProducts);
router.get('/list_month_backproduction', factory.staticByMonthBackProduct);
router.get('/list_year_backproduction', factory.staticByYearBackProduct);
router.get('/list_month_newproduct', factory.staticByMonthNewProduct);
router.get('/list_year_newproduct', factory.staticByYearNewProduct);

module.exports = router;