const manager = require('../controllers/manager.controllers');

const router = require('express').Router();

router.get('/list_user', manager.getAllUser);
router.get('/portfolio_product', manager.getPortFolioProduct);
router.post('/delete_account', manager.deleteAccount);
router.get('/list_all_product', manager.staticAllProduct);

router.post('/create_account', manager.createAccount); //
router.get('/all_product', manager.getAllProduct);
router.get('/get_profile_by_username', manager.getProfileByUsername);

module.exports = router;