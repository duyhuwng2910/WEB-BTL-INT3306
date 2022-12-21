const agent = require('../controllers/agent.controllers');

const router = require('express').Router();

router.get('/list_sold', agent.listSold);
router.get('/list_new_product_ic', agent.getNewProductIsConfirm); 
router.get('/list_recall_product', agent.getReCallingProduct);
router.get('/list_service_product', agent.listServiceProduct);
router.get('/list_fixed_product_nc', agent.getFixedProductsNonConfirm);
router.get('/list_back_production', agent.getBackProduction);
router.get('/list_new_product_nc', agent.getNewProductNonConfirm);
router.get('/list_month_soldproduct', agent.staticByMonthSoldProduct);
router.get('/list_year_soldproduct', agent.staticByYearSoldProduct);
router.get('/list_error_product', agent.getErrorProducts);
router.get('/list_fixed_product_ic', agent.getFixedProductsIsConfirm);

