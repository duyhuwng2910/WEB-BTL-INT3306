const auth = require('../controllers/auth.controllers');

const router = require('express').Router();

router.get('/login', auth.login);
router.get('/check_passwordrc', auth.checkPasswordRecovery);
router.get('/my_profile', auth.getProfile);
router.get('/infor_product', auth.infoProduct);
router.get('/list_month_backagent', auth.staticByMonthInBackAgent);
router.get('/list_year_backagent', auth.staticByYearInBackAgent);
router.get('/list_moth_erservice', auth.staticByMonthInErService);
router.get('/list_year_erservice', auth.staticByYearInErService);
router.get('/info_customer', auth.inforCustomer);

router.post('/search_user_by_keyword', auth.searchUserByKeyword);
router.post('/get_profile_by_name', auth.getProfileByName);
router.post('/req_change_email', auth.reqChangeEmail);
router.post('/confirm_email', auth.confirmEmail);
router.post('/regit_email', auth.regiterEmail);
router.post('/edit_profile', auth.editProfile);
router.post('/forget_password', auth.forgetPassword);
router.post('/change_password', auth.changePassword);

module.exports = router;