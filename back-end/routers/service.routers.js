const service = require('../controllers/service.controllers');

const router = require('express').Router();

router.get('/all_fixing_product', service.getAllFixingProduct);
router.get('/fixed_product', service.getFixedProducts);
router.get('/error_product', service.getErrorProducts);
router.get('/service_product', service.getServiceProducts);
router.get('/list_month_fixedproduct', service.staticByMonthFixedProduct);
router.get('/list_quarter_fixedproduct', service.staticByQuarterFixedProduct);
router.get('/list_year_fixedproduct', service.staticByYearFixedProduct);
router.get('/list_month_failproduct', service.staticByMonthFailProduct);
router.get('/list_quarter_failproduct', service.staticByQuarterFailProduct);
router.get('/list_year_failproduct', service.staticByYearFailProduct);

router.post('/send_product_to_agent', service.letBackProductToAgent);
router.post('/send_product_to_factory', service.letBackProductToFactory);
router.post('/take_service_product', service.takeServiceProduct);

module.exports = router;
