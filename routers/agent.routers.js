const agent = require('../controllers/agent.controllers');

const router = require('express').Router();

router.get('/list_sold', agent.listSold);
router.get('/list_new_product_ic', agent.getNewProductIsConfirm); 
router.get('/list_recall_product', agent.getReCallingProduct);
router.get('/list_service_product', agent.listServiceProduct);
router.get('/list_fixed_product', agent.getFixedProducts);
router.get('/list_backproduction', agent.getBackProduction);
router.get('/list_new_product_nc', agent.getNewProductNonConfirm);
router.get('/list_month_soldproduct', agent.staticByMonthSoldProduct);
router.get('/list_year_soldproduct', agent.staticByYearSoldProduct);
router.get('/error_product', agent.getErrorProducts);
router.get('/fixed_product', agent.getFixedProducts);

router.post('/take_recallproduct', agent.takeRecallProduct);
router.post('/take_newproduct', agent.takeNewProducts);
router.post('/return_product', agent.returnProductCustomer);
router.post('/backproduction', agent.backToProduction); // Ok
router.post('/service_product', agent.letServiceProduct);
router.post('/sold_product', agent.letProductSold);
module.exports = router;