const { UNKNOWN, BAD_REQUEST, CONFLICT, UNAUTHORIZED } = require('../config/HttpStatusCodes');
const bcrypt = require('bcrypt');

const {user, userType} = require('../models/user');
const product = require('../models/product');
const listProduct = require('../models/listProduct');
const { USERTYPE_INVALID, REPASSWORD_INCORRECT, USERNAME_EXISTS } = require('../config/ErrorMessages');
const { deleteAccountOP, transporter } = require('../services/mail');
const portfolio = require('../models/portfolio');
const historicMove = require('../models/historicMove');

//Lấy ra danh sách các tài khoản đã cấp phát không bao gồm tài khoản quản lý
const getAllUser = async (req, res) => {
    if (!req.query.id_user) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }

    try {
        const manager = await user.findById(req.query.id_user);
        if (manager.type_user != "mg") return res.status(BAD_REQUEST).json({ success: 0, errorMessage: "Bạn không có quyền truy cập" });
        const users = await user.find({$or:[
                {type_user: userType.agent}, 
                {type_user: userType.production_unit}, 
                {type_user: userType.service_center} 
            ]});
        return res.json({
            success: 1,
            users: users
        });
    }
    catch (error) {
        console.log(error);
        return res.status(UNKNOWN).json({success: 0})
    }
}

//Lấy ra danh sách tất cả các sản phẩm trên toàn quốc
const getAllProduct = async (req,res) => {
    if (!req.query.id_user) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }

    try {
        const manager = await user.findById(req.query.id_user);
        if (manager.type_user != "mg") return res.status(BAD_REQUEST).json({ success: 0, errorMessage: "Bạn không có quyền truy cập" });
        const products = await product.find({});
        return res.json({
            success: 1,
            products: products
        });
    } catch (error) {
        console.log(error);
        return res.status(UNKNOWN).json({success: 0})
    }
}

//Danh mục các sản phẩm
const getPortFolioProduct = async (req, res) => {
    if (!req.query.id_user) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }

    try {
        const manager = await user.findById(req.query.id_user);
        if (manager.type_user != "mg"){
            console.log({manager: manager});
            return res.status(UNAUTHORIZED).json({ success: 0, errorMessage: "Bạn không có quyền truy cập" });
        }

        return res.json({
            success: 1,
            listProduct: await portfolio.find({})
        });
        
    }
    catch (error) {
        console.log(error);
        return res.status(UNKNOWN).json({success: 0})
    }
}

//Theo dõi và xem thống kê sản phẩm trên toàn quốc, theo trạng thái và theo cơ sở sản xuất, đại lý phân phối và trung tâm bảo hành.
const staticAllProduct = async (req, res) => {
    if (!req.body.id_user || !req.body.namespace) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }

    await listProduct.deleteMany({});

    try {
        const manager = await user.findById(req.body.id_user);
        if (manager.type_user != "mg"){
            console.log({manager: manager});
            return res.status(UNAUTHORIZED).json({ success: 0, errorMessage: "Bạn không có quyền truy cập" });
        }
        const products = await product.find({namespace: req.body.namespace});
        let namespace_ = req.body.namespace;
        for (let i = 0; i < products.length; i++) {
            const product_ = await listProduct.findOne({name: products[i].name});
            let id_ = products[i].id_pr;
            if (req.body.namespace == "Đại lý phân phối") id_ = products[i].id_ag;
            if (req.body.namespace == "Trung tâm bảo hành") id_ = products[i].id_sv;
            const user_ = await user.findById(id_);
            const h = await historicMove.findOne({id_product: products[i]._id});
            const pd1 = await listProduct.findOne({name: products[i].name, where: user_.name} );
            const pd2 = await listProduct.findOne({name: products[i].name, where: user_.name, status: h.arr[h.arr.length - 1].status });
            if (!product_ || !pd1 || !pd2) {
                await new listProduct({
                    namespace: namespace_,
                    name: products[i].name,
                    where: user_.name,
                    status: h.arr[h.arr.length - 1].status,
                    amount: 1 
                }).save();
            } else {
                await listProduct.findOneAndUpdate({name: products[i].name, where: user_.name, status: h.arr[h.arr.length - 1].status },{ $inc : { any : 1 } });
            } 
        }            
        return res.json({
            success: 1,
            listProduct: await listProduct.find({})
        });
        
    }
    catch (error) {
        console.log(error);
        return res.status(UNKNOWN).json({success: 0})
    }
}

//Tạo tài khoản
const createAccount = async (req, res) => {
    if (!req.body.username || !req.body.password || !req.body.repassword || !req.body.user_type ) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }

    if (!(req.body.password == req.body.repassword)) {
        console.log(req.body);
      return res.status(BAD_REQUEST).json({ success: 0, errorMessage: REPASSWORD_INCORRECT });
    }

    const ut = req.body.user_type;
    if (!(ut == userType.agent || ut == userType.production_unit || ut == userType.service_center)) {
        console.log(ut);
        return res.status(BAD_REQUEST).json({ success: 0, errorMessage: USERTYPE_INVALID });
    }
    
    try {
        const users = await user.findOne({ username: req.body.username });
        if (users) {
            return res.status(CONFLICT).json({ success: 0, errorMessage: USERNAME_EXISTS });
        }

        await new user({
            username: req.body.username,
            password: req.body.password,
            type_user: req.body.user_type,
            email: "",
            address: "",
            name: "",
            phone: "",
            bio: "",
            verified: false
        }).save();
  
        return res.json({ success: 1 });
    
    } catch (error) {
      res.status(UNKNOWN).json({ success: 0 });
      return console.log(error);
    }
}

//Xóa tài khoản
const deleteAccount = async (req, res) => {
    if (!req.body.username) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }
    
    try {
        const uid = await user.findOne({username: req.body.username});
        if (!uid) {
            return res.status(CONFLICT).json({ success: 0, errorMessage: "Tài khoản không tồn tại" });
        }

        if (uid.verified) await transporter.sendMail(deleteAccountOP(uid.email));

        await user.deleteOne({_id: uid._id});
  
        return res.json({ success: 1 });
    
    } catch (error) {
      res.status(UNKNOWN).json({ success: 0 });
      return console.log(error);
    }
}

//Lấy profile của tài khoản dựa trêm username
const getProfileByUsername = async (req,res) => {
    if (!req.query.username) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }
  
    try {
        const user_ = await user.findOne({username: req.query.username});
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


module.exports = {
    getAllUser,  
    getPortFolioProduct,
    createAccount,
    getAllProduct,
    deleteAccount,
    getProfileByUsername,
    staticAllProduct
}