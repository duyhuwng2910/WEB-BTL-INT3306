const manager = require('../controllers/manager.controllers');

const router = require('express').Router();

router.get('/list_user', manager.getAllUser);
router.get('/portfolio_product', manager.getPortFolioProduct);
router.post('/delete_account', manager.deleteAccount);
router.post('/list_all_product', manager.staticAllProduct);

router.post('/create_account', manager.createAccount); //
router.get('/all_product', manager.getAllProduct);

module.exports = router;