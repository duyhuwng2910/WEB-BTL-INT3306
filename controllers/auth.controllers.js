const bcrypt = require('bcrypt');
const validator = require('validator');
const { randomBytes } = require('node:crypto');

const { BAD_REQUEST, UNKNOWN, UNAUTHORIZED} = require('../config/HttpStatusCodes');
const { EMAIL_INVALID, USERNAME_INCORRECT, PASSWORD_INCORRECT, EMAIL_EXISTS, EMAIL_ERROR, TOKEN_INCORRECT, TOKEN_EXPIRED, REPASSWORD_INCORRECT, OTP_CODE_INCORRECT, EMAIL_INCORRECT, OTP_INCORRECT, OTP_EXPIRED } = require('../config/ErrorMessages');

const {user} = require('../models/user');
const regitEmail = require('../models/regitEmail');
const product = require('../models/product');
const backAgent = require('../models/backAgent');
const erService = require('../models/erService');
const { transporter, verificationEmailOptions , resetPasswordEmailOptions } = require('../services/mail');
const passwordRecovery = require('../models/passwordRecovery');

//Đăng nhập
const login = async (req, res) => {
    const username = req.query.username;
    const password = req.query.password;

    if (!username || !password) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }

    try {
        const users = await user.findOne({ username: username });
        if (!users) {
            return res.status(UNAUTHORIZED).json({ success: 0, username: username, errorMessage: USERNAME_INCORRECT });
        }
        
        const match = bcrypt.compare(password, users.password);
        if (!match) {
            return res.status(UNAUTHORIZED).json({ success: 0, errorMessage: PASSWORD_INCORRECT });
        }
    
        return res.json({
            success: 1,
            id: users._id,
            type: users.type_user,
            verified: users.verified
        });
      
    } catch (error) {
      res.status(UNKNOWN).json({ success: 0})
      return console.log(error);
    }
    
}

//Nhập thông tin email *******************************
const confirmEmail = async (req,res) => {
    if (!req.body.id_user || !req.body.email) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }
    if (!validator.isEmail(req.body.email)) {
        return res.status(BAD_REQUEST).json({ success: 0, errorMessage: EMAIL_INVALID });
    }

    try {
        if (await user.findOne({email: req.body.email})) {
            return res.status(UNAUTHORIZED).json({ success: 0, errorMessage: EMAIL_EXISTS });
        }
        await user.findByIdAndUpdate({_id: req.body.id_user}, {email: req.body.email, verified: true});
        await regitEmail.deleteMany({id_user: req.body.id_user});
        const token = randomBytes(6).toString('hex');
        const emailRegistration = await new regitEmail({
            id_user: req.body.id_user,
            otp: token,
            email: req.body.email
        }).save();

        await transporter.sendMail(verificationEmailOptions(emailRegistration.email, emailRegistration.otp));

        return res.json({
            success: 1
        });
    } catch (error) {
        console.log(error);
        return res.status(UNKNOWN).json({ success: 0});
    }
}

//Gửi yêu cầu thay đổi mail ***************************
const reqChangeEmail = async (req, res) => {
    if (!req.body.id_user) {
      return res.status(BAD_REQUEST).json({ success: 0 });
    }
  
    try {
        const _user = await user.findById(req.body.id_user);
        await regitEmail.deleteMany({id_user: req.body.id_user});
        const token = randomBytes(6).toString('hex');
        const emailRegistration = await new regitEmail({
            id_user: _user._id,
            otp: token,
            email: _user.email
        }).save();
        
        await transporter.sendMail(verificationEmailOptions(emailRegistration.email, emailRegistration.otp));

        return res.json({ success: 1 });
        
    } catch (error) {
        res.status(UNKNOWN).json({ success: 0 });
        return console.log(error);
    }
}  

//Mã xác nhận email *********************************************
const regiterEmail = async (req,res) => {
    if (!req.body.otp || !req.body.id_user) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }

    try {
        const emailRegistration = await regitEmail.findOne({id_user: req.body.id_user, otp: req.body.otp });
        if (!emailRegistration) {
          return res.status(BAD_REQUEST).json({ success: 0, errorMessage: OTP_INCORRECT });
        }
        const _time = new Date().getTime() - emailRegistration.time.getTime();
        if ( _time > parseInt(process.env.EMAIL_EXPIRATION_TIME)) {
          return res.status(UNAUTHORIZED).json({ success: 0, errorMessage: OTP_EXPIRED });
        }
    
        return res.json({ success: 1 });
      
      } catch (error) {
        res.status(UNKNOWN).json({ success: 0 });
        return console.log(error);
      }
}

//Lấy lại mật khẩu ***************************
const forgetPassword = async (req,res) => {
    if (!req.body.email) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }
    if (!validator.isEmail(req.body.email)) {
        return res.status(BAD_REQUEST).json({ success: 0, errorMessage: EMAIL_INVALID });
    }
    
    try {
        const user_ = await user.findOne({ email: req.body.email });
        if (!user_) {
            return res.status(UNAUTHORIZED).json({ success: 0, errorMessage: EMAIL_INCORRECT });
        }
    
        const otp = randomBytes(10).toString('hex');
        passwordRecovery.deleteMany({ email: req.body.email }, (error) => {});
        const passwordRecovery_ = await new passwordRecovery({
            id_user: user_._id,
            email: req.body.email,
            otp: otp
        }).save();
    
        await transporter.sendMail(resetPasswordEmailOptions(passwordRecovery_.email, passwordRecovery_.otp));
        
        return res.json({ success: 1 });
      
    } catch (error) {
        res.status(UNKNOWN).json({ success: 0 });
        return console.log(error);
    }
}

//Xác nhận quên mật khẩu ******************************
const checkPasswordRecovery = async (req, res) => {
    if (!req.query.otp) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }
  
    try {
        const passwordRecovery_ = await passwordRecovery.findOne({ otp: req.query.otp });
        if (!passwordRecovery_) {
            return res.status(BAD_REQUEST).json({ success: 0, errorMessage: OTP_INCORRECT });
        }
        if (new Date().getTime() - passwordRecovery_.time.getTime() > parseInt(process.env.EMAIL_EXPIRATION_TIME)) {
            return res.status(UNAUTHORIZED).json({ success: 0, errorMessage: OTP_EXPIRED });
        }
        
        return res.json({ success: 1, id_user: passwordRecovery_.id_user});
        
    } catch (error) {
        res.status(UNKNOWN).json({ success: 0 });
        return console.log(error);
    }
}

//Đổi mật khẩu ********************************
const changePassword = async (req, res) => {
    if (!req.body.id_user || !req.body.password || !req.body.repassword) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }

    if (req.body.password !== req.body.repassword) {
        return res.status(BAD_REQUEST).json({ success: 0, errorMessage: REPASSWORD_INCORRECT });
    }
  
    try {
        await user.findByIdAndUpdate({_id: req.body.id_user},{password: req.body.password});
        
        return res.json({ success: 1 });
        
    } catch (error) {
        res.status(UNKNOWN).json({ success: 0 });
        return console.log(error);
    }
} 

//Lấy ra profile của tài khoản (của chính tài khoản đang đăng nhập)
const getProfile = async (req,res) => {
    if (!req.query.user) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }
  
    try {
        const user_ = await user.findById(req.query.id_user);
        return res.json({
            success: 1,
            name: user_.name,
            email: user_.email,
            username: user_.username,
            password: user_.password,
            type_user: user_.type_user,
            verified: user_.verified
        });
    } catch (error) {
        console.log(error);
        return res.status(UNKNOWN).json({ success: 0});
    }
}

//Gửi đi thông tin cần chỉnh sửa của tài khoản
const editProfile = async (req,res) => {
    if (!req.body.id_user) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }

    try {
        await user.findByIdAndUpdate({_id: req.body.id_user}, {
            name: req.body.name,
            bio: req.body.bio,
            address: req.body.address,
            phone: req.body.phone
        });
      
        return res.json({
            success: 1
        });
    } catch (error) {
        console.log(error);
        return res.status(UNKNOWN).json({ success: 0});
    }
}

//Lấy ra thông tin chi tiết của sản phẩm **********************
const infoProduct = async (req,res) => {
  if (!req.query.id_product) {
      return res.status(BAD_REQUEST).json({ success: 0 });
  }

  try {
      const product_ = await product.findById(req.query.id_product);
      return res.json({
          success: 1,
          name: product_.name,
          color: product_.color,
          namspace: product_.namespace,
          status: product_.status,
          bio: product_.bio,
          id_ag: product_.id_ag,
          id_sv: product_.id_sv,
          id_pr: product_.id_pr,
          batch: product_.batch,
          verified: product_.verified
      });
    } catch (error) {
        console.log(error);
        return res.status(UNKNOWN).json({ success: 0});
    }
}

//sắp xếp theo thời gian
function sortFunction(a,b){  
    var dateA = new Date(a.time).getTime();
    var dateB = new Date(b.time).getTime();
    return dateA > dateB ? 1 : -1;  
}; 

//Số lượng sản phẩm xuất ra cho các đại lý/ số lượng sản phẩm nhập về của 1 đại lý trong mỗi tháng (của tất cả các năm)
const staticByMonthInBackAgent = async(req,res) => {
    if (!req.query.id_user) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }

    try {
        const back_agent = await backAgent.find({id_ag: req.query.id_user});
        back_agent.sort(sortFunction);
        let list = new Array;
        let k = 1;
        for (let i = 1; i < back_agent.length; i++) {
            if (back_agent[i].time.getUTCMonth() - back_agent[i-1].time.getUTCMonth() == 0) k++; 
            else {
                let time = back_agent[i-1].time.getUTCMonth().toString() + "/" + back_agent[i-1].time.getUTCFullYear().toString();
                list.push({time: time,amount: k});
                k = 1;
            }
          }
        return res.json({
            success: 1,
            list: list
        });

    } catch (error) {
        console.log(error);
        return res.status(UNKNOWN).json({ success: 0});
    }
} 

//Số lượng sản phẩm xuất ra cho các đại lý/ số lượng sản phẩm nhập về của 1 đại lý trong mỗi năm
const staticByYearInBackAgent = async(req,res) => {
    if (!req.query.id_user) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }

    try {
        const back_agent = await backAgent.find({id_ag: req.query.id_user});
        back_agent.sort(sortFunction);
        let list = new Array;
        let k = 1;
        for (let i = 1; i < back_agent.length; i++) {
            if (back_agent[i].time.getUTCFullYear() - back_agent[i-1].time.getUTCFullYear() == 0) k++; 
            else {
                let time = back_agent[i-1].time.getUTCFullYear().toString();
                list.push({time: time,amount: k});
                k = 1;
            }
        }
        return res.json({
            success: 1,
            list: list
        });

    } catch (error) {
        console.log(error);
        return res.status(UNKNOWN).json({ success: 0});
    }
}

//Số lượng sản phẩm cần bảo hành của 1 trung tâm bảo hành/ số lượng sản phẩm đưa đi bảo hành của 1 đại lý trong mỗi tháng (của tất cả các năm)
const staticByMonthInErService = async(req,res) => {
    if (!req.query.id_user) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }

    try {
        const er_service = await erService.find({id_user: req.query.id_user});
        er_service.sort(sortFunction);
        let list = new Array;
        let k = 1;
        for (let i = 1; i < er_service.length; i++) {
            if (er_service[i].time.getUTCMonth() - er_service[i-1].time.getUTCMonth() == 0) k++; 
            else {
                let time = er_service[i-1].time.getUTCMonth().toString() + "/" + er_service[i-1].time.getUTCFullYear().toString();
                list.push({time: time,amount: k});
                k = 1;
            }
        }
        return res.json({
            success: 1,
            list: list
        });

    } catch (error) {
        console.log(error);
        return res.status(UNKNOWN).json({ success: 0});
    }
}

//Số lượng sản phẩm cần bảo hành của 1 trung tâm bảo hành/ số lượng sản phẩm đưa đi bảo hành của 1 đại lý trong mỗi năm
const staticByYearInErService = async(req,res) => {
    if (!req.query.id_user) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }

    try {
        const er_service = await erService.find({id_user: req.query.id_user});
        er_service.sort(sortFunction);
        let list = new Array;
        let k = 1;
        for (let i = 1; i < fixed_product.length; i++) {
            if (er_service[i].time.getUTCFullYear() - er_service[i-1].time.getUTCFullYear() == 0) k++; 
            else {
                let time = er_service[i-1].time.getUTCFullYear().toString();
                list.push({time: time,amount: k});
                k = 1;
            }
        }
        return res.json({
            success: 1,
            list: list
        });

    } catch (error) {
        console.log(error);
        return res.status(UNKNOWN).json({ success: 0});
    }
}

module.exports = {
    login,
    regiterEmail,
    confirmEmail,
    forgetPassword,
    getProfile,
    editProfile,
    infoProduct,
    staticByMonthInBackAgent,
    staticByYearInBackAgent,
    staticByMonthInErService,
    staticByYearInErService,
    sortFunction,
    checkPasswordRecovery,
    changePassword,
    reqChangeEmail
}