const factory = require('../controllers/factory.controllers');

const router = require('express').Router();

router.post('/entry_product', factory.entryBatchProduct); //
router.post('/send_product_to_agent', factory.sendProductToAgent);
router.post('/take_old_product', factory.takeOldProduct);
router.post('/take_err_product', factory.takeErrorProduct);
router.post('/de_entry', factory.deEntryBatchProduct);

router.get('/list_product_to_agent', factory.getSendAgentProduct);
router.get('/list_new_product', factory.getNewProducts);
router.get('/list_month_backproduction', factory.staticByMonthBackProduct);
router.get('/list_quarter_backproduction', factory.staticByQuarterBackProduct);
router.get('/list_year_backproduction', factory.staticByYearBackProduct);
router.get('/list_month_newproduct', factory.staticByMonthNewProduct);
router.get('/list_quarter_newproduct', factory.staticByQuarterNewProduct);  
router.get('/list_year_newproduct', factory.staticByYearNewProduct);
router.get('/list_agent_fail', factory.staticByAgentFail);
router.get('/list_productline_fail', factory.staticByProductLineFail);
router.get('/list_error_or_old_ic', factory.getErrorOrOldProductIsConfirm);
router.get('/list_error_or_old_nc', factory.getErrorOrOldProductNonConfirm);

module.exports = router;