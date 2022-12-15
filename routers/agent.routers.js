const agent = require('../controllers/agent.controllers');

const router = require('express').Router();

router.get('/list_sold', agent.listSold);
router.get('/new_product', agent.getAllNewProducts);
router.get('/list_recall_product', agent.getReCallingProduct);
router.get('/list_service_product', agent.listServiceProduct);
router.get('/list_fixed_product', agent.getFixedProducts);
router.get('/list_backproduction', agent.getBackProduction);
router.get('/list_newproduct', agent.getNewProducts);
router.get('/list_month_soldproduct', agent.staticByMonthSoldProduct);
router.get('/list_year_soldproduct', agent.staticByYearSoldProduct);
router.get('/error_product', agent.getErrorProducts);
router.get('/fixed_product', agent.getFixedProducts);
router.get('/take_fixedproduct', agent.takeFixedProducts);

router.post('/take_recallproduct', agent.takeRecallProduct);
router.post('/take_newproduct', agent.takeNewProducts);
router.post('/return_product', agent.returnProductCustomer);
router.post('/backproduction', agent.backToProduction);
router.post('/service_product', agent.letServiceProduct);
router.post('/sold_product', agent.letProductSold);
module.exports = router;