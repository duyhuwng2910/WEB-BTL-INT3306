const manager = require('../controllers/manager.controllers');

const router = require('express').Router();

router.get('/list_user', manager.getAllUser);
router.get('/list_product', manager.getListProduct);

router.post('/create_account', manager.createAccount); //
router.get('/all_product', manager.getAllProduct);

module.exports = router;