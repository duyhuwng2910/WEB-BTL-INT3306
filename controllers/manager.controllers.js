const { UNKNOWN, BAD_REQUEST, CONFLICT, UNAUTHORIZED } = require('../config/HttpStatusCodes');
const bcrypt = require('bcrypt');

const {user, userType} = require('../models/user');
const product = require('../models/product');
const listProduct = require('../models/listProduct');
const { USERTYPE_INVALID, EMAIL_INVALID, REPASSWORD_INCORRECT, USERNAME_EXISTS } = require('../config/ErrorMessages');

const getAllUser = async (req, res) => {
    if (!req.query.id_user) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }

    try {
        const manager = await user.findById(req.query.id_user);
        if (manager.type_user != "mg") return res.status(BAD_REQUEST).json({ success: 0, errorMessage: "Bạn không có quyền truy cập" });
        const users = await user.find({$or:{type_user: userType.agent, type_user: userType.production_unit, type_user: userType.service_center }});
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

const getListProduct = async (req, res) => {
    if (!req.query.id_user) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }

    await listProduct.deleteMany({namespace:'Đại lý phân phối'});
    await listProduct.deleteMany({namespace:'Cơ sở sản xuất'});
    await listProduct.deleteMany({namespace:'Trung tâm bảo hành'});

    try {
        const manager = await user.findById(req.query.id_user);
        if (manager.type_user != "mg"){
            console.log({manager: manager});
            return res.status(UNAUTHORIZED).json({ success: 0, errorMessage: "Bạn không có quyền truy cập" });
        }
        const products = await product.find({});
        for (let i = 0; i < products.length; i++) {
            const product_ = await listProduct.findOne({name: products[i].name});

            if (!product_) {
                await new listProduct({
                    name: products[i].name,
                    namespace: products[i].namespace,
                    any: 1
                }).save();
            } else {
                const pd1 = await listProduct.findOne({name: products[i].name, namespace: products[i].namespace })
                if (!pd1) {
                    await new listProduct({
                        name: products[i].name,
                        namespace: products[i].namespace,
                        any: 1
                    }).save();
                } else {
                    await listProduct.findOneAndUpdate({name: products[i].name, namespace: products[i].namespace },{ $inc : { any : 1 } });
                } 
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

module.exports = {
    getAllUser,
    getListProduct,
    createAccount,
    getAllProduct
}