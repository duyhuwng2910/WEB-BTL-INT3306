const bcrypt = require('bcrypt');
const validator = require('validator');

const { BAD_REQUEST, UNKNOWN, UNAUTHORIZED, CONFLICT } = require('../config/HttpStatusCodes');
const { EMAIL_INVALID, USERNAME_INCORRECT, PASSWORD_INCORRECT, EMAIL_EXISTS, EMAIL_ERROR, TOKEN_INCORRECT, TOKEN_EXPIRED, REPASSWORD_INCORRECT, OTP_CODE_INCORRECT } = require('../config/ErrorMessages');

const {user} = require('../models/user');
const regitEmail = require('../models/regitEmail');
const product = require('../models/product');
const backAgent = require('../models/backAgent');
const erService = require('../models/erService');

//Đăng nhập
const login = async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    
    if (!username || !password) {
        console.log(req.body);
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
    
        //const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: 24 * 60 * 60 * 1000 });
        return res.json({
          success: 1,
          id: users._id
        });
      
    } catch (error) {
      res.status(UNKNOWN).json({ success: 0, djtme: 1 })
      return console.log(error);
    }
    
}

//Nhập thông tin email
const confirmEmail = async (req,res) => {
  if (!req.body.id_user || !req.body.email) {
    return res.status(BAD_REQUEST).json({ success: 0 });
  }
  if (!validator.isEmail(req.body.email)) {
    return res.status(BAD_REQUEST).json({ success: 0, errorMessage: EMAIL_INVALID });
  }

  try {
    await user.findByIdAndUpdate({_id: req.body.id_user}, {email: req.body.email});
    await regitEmail.deleteMany({id_user: req.body.id_user});
    const token = 123213;
    await new regitEmail({
      id_user: req.body.id_user,
      otp: token
    }).save();
    return res.json({
      success: 1,
      newEmail: req.body.email
    });
  } catch (error) {
    console.log(error);
    return res.status(UNKNOWN).json({ success: 0});
  }
}

//Mã xác nhận email
const regiterEmail = async (req,res) => {
  if (!req.body.id_user || !req.body.otp) {
    return res.status(BAD_REQUEST).json({ success: 0 });
  } 

  try {
    const regitEmail_ = regitEmail.findOne({id_user: req.body.id_user});
    if (!regitEmail_) {
      return res.status(UNAUTHORIZED).json({ success: 0, errorMessage: USERNAME_INCORRECT });
    }
    const match = bcrypt.compare(regitEmail_.otp, req.body.otp);
    if (match) {
      return res.json({
        success: 1,
        regit_email: true 
      });
    } else return res.json({success: 1, regit_email: false, errorMessage: OTP_CODE_INCORRECT});
  } catch (error) {
    console.log(error);
    return res.status(UNKNOWN).json({ success: 0});
  }
}

//Lấy lại mật khẩu
const forgetPassword = async (req,res) => {

}

//Lấy ra profile của tài khoản (của chính tài khoản đang đăng nhập)
const getProfile = async (req,res) => {
  if (!req.querry.user) {
    return res.status(BAD_REQUEST).json({ success: 0 });
  }
  
  try {
    const user_ = user.findById(req.querry.id_user);
    return res.json({
      success: 1,
      name: user_.name,
      username: user_.username,
      password: user_.password,
      type_user: user_.type_user
    });
  } catch (error) {
    console.log(error);
    return res.status(UNKNOWN).json({ success: 0});
  }
}

//Gửi đi thông tin cần chỉnh sửa của tài khoản
const editProfile = async (req,res) => {
  if (!req.body.name || !req.body.password || !req.body.email || !req.querry.id_user) {
    return res.status(BAD_REQUEST).json({ success: 0 });
  }
  if (!validator.isEmail(req.body.email)) {
    return res.status(BAD_REQUEST).json({ success: 0, errorMessage: EMAIL_INVALID });
  }

  try {
    await user.findByIdAndUpdate({_id: req.querry.id_user}, {
      name: req.body.name,
      password: req.body.password,
      email: req.body.email
    });
  } catch (error) {
    console.log(error);
    return res.status(UNKNOWN).json({ success: 0});
  }
}

//Lấy ra thông tin chi tiết của sản phẩm
const infoProduct = async (req,res) => {
  if (!req.querry.id_product) {
    return res.status(BAD_REQUEST).json({ success: 0 });
  }

  try {
    const product_ = product.findById(req.querry.id_product);
    return res.json({
      success: 1,
      name: product_.name,
      color: product_.color,
      namspace: product_.namspace,
      status: product_.status,
      bio: product_.bio
    });
  } catch (error) {
    console.log(error);
    return res.status(UNKNOWN).json({ success: 0});
  }
}

//sắp xếp theo thời gian
function sortFunction(a,b){  
  var dateA = new Date(a.date).getTime();
  var dateB = new Date(b.date).getTime();
  return dateA > dateB ? 1 : -1;  
}; 

//Số lượng sản phẩm xuất ra cho các đại lý/ số lượng sản phẩm nhập về của 1 đại lý trong mỗi tháng (của tất cả các năm)
const staticByMonthInBackAgent = async(req,res) => {
  if (!req.querry.id_user) {
    return res.status(BAD_REQUEST).json({ success: 0 });
  }

  try {
    const back_agent = await backAgent.find({id_user: req.querry.id_user});
    back_agent.sort(sortFunction);
    let arr = new Array;
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
      arr: arr
    });

  } catch (error) {
    console.log(error);
    return res.status(UNKNOWN).json({ success: 0});
  }
} 

//Số lượng sản phẩm xuất ra cho các đại lý/ số lượng sản phẩm nhập về của 1 đại lý trong mỗi năm
const staticByYearInBackAgent = async(req,res) => {
  if (!req.querry.id_user) {
    return res.status(BAD_REQUEST).json({ success: 0 });
  }

  try {
    const back_agent = await backAgent.find({id_user: req.querry.id_user});
    back_agent.sort(sortFunction);
    let arr = new Array;
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
      arr: arr
    });

  } catch (error) {
    console.log(error);
    return res.status(UNKNOWN).json({ success: 0});
  }
}

//Số lượng sản phẩm cần bảo hành của 1 trung tâm bảo hành/ số lượng sản phẩm đưa đi bảo hành của 1 đại lý trong mỗi tháng (của tất cả các năm)
const staticByMonthInErService = async(req,res) => {
  if (!req.querry.id_user) {
    return res.status(BAD_REQUEST).json({ success: 0 });
  }

  try {
    const er_service = await erService.find({id_user: req.querry.id_user});
    er_service.sort(sortFunction);
    let arr = new Array;
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
      arr: arr
    });

  } catch (error) {
    console.log(error);
    return res.status(UNKNOWN).json({ success: 0});
  }
}

//Số lượng sản phẩm cần bảo hành của 1 trung tâm bảo hành/ số lượng sản phẩm đưa đi bảo hành của 1 đại lý trong mỗi năm
const staticByYearInErService = async(req,res) => {
  if (!req.querry.id_user) {
    return res.status(BAD_REQUEST).json({ success: 0 });
  }

  try {
    const er_service = await erService.find({id_user: req.querry.id_user});
    er_service.sort(sortFunction);
    let arr = new Array;
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
      arr: arr
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
    sortFunction
}