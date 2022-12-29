const validator = require('validator');
const { randomBytes } = require('node:crypto');

const { BAD_REQUEST, UNKNOWN, UNAUTHORIZED} = require('../config/HttpStatusCodes');
const { EMAIL_INVALID, USERNAME_INCORRECT, PASSWORD_INCORRECT, EMAIL_EXISTS, REPASSWORD_INCORRECT, EMAIL_INCORRECT, OTP_INCORRECT, OTP_EXPIRED } = require('../config/ErrorMessages');

const {user} = require('../models/user');
const regitEmail = require('../models/regitEmail');
const product = require('../models/product');
const backAgent = require('../models/backAgent');
const erService = require('../models/erService');
const { transporter, verificationEmailOptions , resetPasswordEmailOptions } = require('../services/mail');
const passwordRecovery = require('../models/passwordRecovery');
const sold = require('../models/sold');
const historicMove = require('../models/historicMove');
const svFixing = require('../models/svFixing');

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
        
        if (password != users.password) {
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
    if (!req.query.id_user) {
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
            address: user_.address,
            phone: user_.phone,
            bio: user_.bio,
            verified: user_.verified
        });
    } catch (error) {
        console.log(error);
        return res.status(UNKNOWN).json({ success: 0});
    }
}

//Lấy ra profile của tài khoản (để tài khoản khác xem)
const getProfileByName = async (req,res) => {
    if (!req.body.name) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }
  
    try {
        const user_ = await user.findOne({name: req.body.name});
        return res.json({
            success: 1,
            name: user_.name,
            address: user_.address,
            phone: user_.phone,
            bio: user_.bio,
            verified: user_.verified,
            type: user_.type_user,
            username: user_.username
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
        
        const sold_ = await sold.findOne({id_product: product_._id});
        if (sold_) {
            if (checkOverTimeService(sold_,product_) == 1) {
                await product.findByIdAndUpdate({_id: product_._id}, {st_Service: "Hết bảo hành"});
            }   
        }    
        
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
            st_service: product_.st_Service,
            ToS: product_.ToS,
            DoM: product_.DoM,
            capacity: product_.capacity
        });
    } catch (error) {
        console.log(error);
        return res.status(UNKNOWN).json({ success: 0});
    }
}

//Xem lịch sử di chuyển của sản phẩm
const historicMoveProduct = async (req,res) => {
    if (!req.query.id_product) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }
  
    try {
        const history = await historicMove.findOne({id_product: req.query.id_product});
        return res.json({
            success: 1,
            arr: history.arr
        });
    } catch (error) {
        console.log(error);
        return res.status(UNKNOWN).json({ success: 0});
    }
}

//check thời gian bảo hành
function checkOverTimeService(a,b){  //a sold ,b là product  
    var dateA = b.ToS * 30 * 24 * 60 * 60 * 1000;
    var dateB = new Date().getTime() - a.time;
    return dateA < dateB ? 1 : -1;  
}; 

//sắp xếp theo thời gian
function sortFunction(a,b){ 
    var dateA = new Date(a.time).getTime();
    var dateB = new Date(b.time).getTime();
    return dateA > dateB ? 1 : -1;  
}; 

//chia quý của 1 năm
function sortTime(a){
    if (0 < a && a <= 3) return "1";
    if (3 < a && a <= 6) return "2";
    if (6 < a && a <= 9) return "3";
    return "4";
}

//Số lượng sản phẩm xuất ra cho các đại lý/ số lượng sản phẩm nhập về của 1 đại lý trong mỗi tháng (của tất cả các năm)
const staticByMonthInBackAgent = async(req,res) => {
    if (!req.query.id_user) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }

    try {
        var back_agent = await backAgent.find({id_ag: req.query.id_user});
        if (back_agent.length == 0) back_agent = await backAgent.find({id_pr: req.query.id_user});
        back_agent.sort(sortFunction);
        let list = new Array;
        let k = 1;
        if (back_agent.length == 1) {
            let month = (back_agent[0].time.getUTCMonth() + 1).toString(); 
            let year = back_agent[0].time.getUTCFullYear().toString();
            list.push({month: month, year: year, amount: k});
        }
        for (let i = 1; i < back_agent.length; i++) {
            if (back_agent[i].time.getUTCMonth() - back_agent[i-1].time.getUTCMonth() == 0) k++; 
            else {
                let month = (back_agent[i-1].time.getUTCMonth() + 1).toString(); 
                let year = back_agent[i-1].time.getUTCFullYear().toString();
                list.push({month: month,year: year, amount: k});
                k = 1;
            }
            if (i == back_agent.length - 1) {
                let month = (back_agent[i].time.getUTCMonth() + 1).toString(); 
                let year = back_agent[i].time.getUTCFullYear().toString();
                list.push({month: month,year: year, amount: k});
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

//Số lượng sản phẩm xuất ra cho các đại lý/ số lượng sản phẩm nhập về của 1 đại lý trong mỗi quý (của tất cả các năm)
const staticByQuarterInBackAgent = async(req,res) => {
    if (!req.query.id_user) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }

    try {
        var back_agent = await backAgent.find({id_ag: req.query.id_user});
        if (back_agent.length == 0) back_agent = await backAgent.find({id_pr: req.query.id_user});
        back_agent.sort(sortFunction);
        let list = new Array;
        let k = 1;
        if (back_agent.length == 1) {
            let quarter = sortTime(back_agent[0].time.getUTCMonth() + 1); 
            let year = back_agent[0].time.getUTCFullYear().toString();
            list.push({quarter: quarter,year: year, amount: k});
        }
        for (let i = 1; i < back_agent.length; i++) {
            if (back_agent[i].time.getUTCMonth() - back_agent[i-1].time.getUTCMonth() == 0) k++; 
            else {
                let quarter = sortTime(back_agent[i-1].time.getUTCMonth() + 1); 
                let year = back_agent[i-1].time.getUTCFullYear().toString();
                list.push({quarter: quarter,year: year, amount: k});
                k = 1;
            }
            if (i == back_agent.length - 1) {
                let quarter = sortTime(back_agent[i].time.getUTCMonth() + 1); 
                let year = back_agent[i].time.getUTCFullYear().toString();
                list.push({quarter: quarter,year: year, amount: k});
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
        var back_agent = await backAgent.find({id_ag: req.query.id_user});
        if (back_agent.length == 0) back_agent = await backAgent.find({id_pr: req.query.id_user});
        back_agent.sort(sortFunction);
        let list = new Array;
        let k = 1;
        if (back_agent.length == 1) {
            let year = back_agent[0].time.getUTCFullYear().toString();
            list.push({year: year,amount: k})
        }
        for (let i = 1; i < back_agent.length; i++) {
            if (back_agent[i].time.getUTCFullYear() - back_agent[i-1].time.getUTCFullYear() == 0) k++; 
            else {
                let year = back_agent[i-1].time.getUTCFullYear().toString();
                list.push({year: year,amount: k});
                k = 1;
            }
            if (i == back_agent.length - 1) {
                let year = back_agent[i].time.getUTCFullYear().toString();
                list.push({year: year,amount: k});
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

//Số lượng sản phẩm cần bảo hành của 1 trung tâm bảo hành (của tất cả các năm)
const staticByMonthInErService = async(req,res) => {
    if (!req.query.id_user) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }

    try {
        const sv_fixing = await svFixing.find({id_sv: req.query.id_user});
        sv_fixing.sort(sortFunction);
        let list = new Array;
        let k = 1;
        if (sv_fixing.length == 1) {
            let month = (sv_fixing[0].time.getUTCMonth() + 1).toString(); 
            let year = sv_fixing[0].time.getUTCFullYear().toString();
            list.push({month: month, year: year, amount: k});
        }
        for (let i = 1; i < sv_fixing.length; i++) {
            if (sv_fixing[i].time.getUTCMonth() - sv_fixing[i-1].time.getUTCMonth() == 0) k++; 
            else {
                let month = (sv_fixing[i-1].time.getUTCMonth() + 1).toString(); 
                let year = sv_fixing[i-1].time.getUTCFullYear().toString();
                list.push({month: month,year: year, amount: k});
                k = 1;
            }
            if (i == sv_fixing.length - 1) {
                let month = (sv_fixing[i].time.getUTCMonth() + 1).toString(); 
                let year = sv_fixing[i].time.getUTCFullYear().toString();
                list.push({month: month,year: year, amount: k});
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

//Số lượng sản phẩm cần bảo hành của 1 trung tâm bảo hành/ số lượng sản phẩm đưa đi bảo hành của 1 đại lý trong mỗi quý (của tất cả các năm)
const staticByQuarterInErService = async(req,res) => {
    if (!req.query.id_user) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }

    try {
        const sv_fixing = await svFixing.find({id_sv: req.query.id_user});
        sv_fixing.sort(sortFunction);
        let list = new Array;
        let k = 1;
        if (sv_fixing.length == 1) {
            let quarter = sortTime(sv_fixing[0].time.getUTCMonth() + 1); 
            let year = sv_fixing[0].time.getUTCFullYear().toString();
            list.push({quarter: quarter,year: year, amount: k});
        }
        for (let i = 1; i < sv_fixing.length; i++) {
            if (sv_fixing[i].time.getUTCMonth() - sv_fixing[i-1].time.getUTCMonth() == 0) k++; 
            else {
                let quarter = sortTime(sv_fixing[i-1].time.getUTCMonth() + 1); 
                let year = sv_fixing[i-1].time.getUTCFullYear().toString();
                list.push({quarter: quarter,year: year, amount: k});
                k = 1;
            }
            if (i == sv_fixing.length - 1) {
                let quarter = sortTime(sv_fixing[i].time.getUTCMonth() + 1); 
                let year = sv_fixing[i].time.getUTCFullYear().toString();
                list.push({quarter: quarter,year: year, amount: k});
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
        const sv_fixing = await svFixing.find({id_sv: req.query.id_user});
        sv_fixing.sort(sortFunction);
        let list = new Array;
        let k = 1;
        if (sv_fixing.length == 1) {
            let year = sv_fixing[0].time.getUTCFullYear().toString();
            list.push({year: year,amount: k})
        }
        for (let i = 1; i < sv_fixing.length; i++) {
            if (sv_fixing[i].time.getUTCFullYear() - sv_fixing[i-1].time.getUTCFullYear() == 0) k++; 
            else {
                let year = sv_fixing[i-1].time.getUTCFullYear().toString();
                list.push({year: year,amount: k});
                k = 1;
            }
            if (i == sv_fixing.length - 1) {
                let year = sv_fixing[i].time.getUTCFullYear().toString();
                list.push({year: year,amount: k});
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

//Lấy ra thông tin khách hàng **********************
const inforCustomer = async (req,res) => {
    if (!req.query.id_product) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }
  
    try {
        const sold_ = await sold.findOne({id_product: req.query.id_product});
        return res.json({
            success: 1,
            name: sold_.customer,
            address: sold_.address,
            phone: sold_.phoneNumber
        });
      } catch (error) {
          console.log(error);
          return res.status(UNKNOWN).json({ success: 0});
    }
}

//Tìm kiếm bằng từ khóa
const searchUserByKeyword = async (req, res) => {
    if (!req.body.type_user) {
      return res.status(BAD_REQUEST).json({ success: 0 });
    }
  
    try {
        const users = await user
            .find({
                type_user: req.body.type_user,
                $or: [
                    { name: new RegExp(req.body.keyword, 'i') },
                    { email: req.body.keyword }
                ]
            });
            
        const returnUsers = users.map((_user) => {
            return {
                _id: _user._id,
                name: _user.name,
            }
      });
    
      return res.json({ success: 1, users: returnUsers });
  
    } catch (error) {
      console.log(error);
      return res.status(UNKNOWN).json({ success: 0 });
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
    reqChangeEmail,
    inforCustomer,
    getProfileByName,
    searchUserByKeyword,
    historicMoveProduct,
    checkOverTimeService,
    sortTime,
    staticByQuarterInBackAgent,
    staticByQuarterInErService
}