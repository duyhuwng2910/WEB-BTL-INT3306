const { BAD_REQUEST, UNKNOWN } = require("../config/HttpStatusCodes");
const erBackFactory = require("../models/erBackFactory");
const erBackProduction = require("../models/erBackProduction");
const historicMove = require("../models/historicMove");
const product = require("../models/product");
const svFixed = require("../models/svFixed");
const svFixing = require("../models/svFixing");
const { user } = require("../models/user");
const { sortFunction } = require("./auth.controllers");

//Lấy ra tất cả sản phẩm đang được sửa chữa của 1 trung tâm bảo hành ************
const getAllFixingProduct = async (req,res) => {
    if (!req.query.id_user) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }
    
    try {
        const fixing_product = await svFixing.find({id_sv: req.query.id_user});
        let list = new Array;
        for (let i = 0; i < fixing_product.length; i++) {
            const _product = await product.findById(fixing_product[i].id_product);
            list.push(_product);
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

//Trả sản phẩm về cho đại lý **************
const letBackProductToAgent = async (req,res) => {
    if (!req.body.id_product) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }
    
    try {
        const fixed_product = await product.findByIdAndUpdate({_id: req.body.id_product},{ 
            namespace:"Đại lý phân phối",
            status: "sv_fixed"
        });
        const user_ = await user.findById(fixed_product.id_sv);
        await new svFixed({
            id_product: fixed_product._id,
            id_sv: fixed_product.id_sv,
            id_ag: fixed_product.id_ag,
            agent_status: "Chưa nhận"
        }).save();
        await svFixing.deleteOne({id_product: req.body.id_product});
        await historicMove.updateOne({id_product: req.body.id_product}, 
            {$push : {
                arr: {where: user_.name,time: Date.now(),status:"Đã sửa xong"}}
        });
        return res.json({
            success: 1
        });
    
    } catch (error) {
        console.log(error);
        return res.status(UNKNOWN).json({ success: 0});
    }
}

//Trả sản phẩm về cho cơ sở sản xuất do không sửa được ******************
const letBackProductToFactory = async (req,res) => {
    if (!req.body.id_product) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }
    
    try {
        const fail_product = await product.findByIdAndUpdate({_id: req.body.id_product},{
            id_sv: "", 
            namespace:"Cơ sở sản xuất",
            status: "er_back_factory"
        });
        await new erBackFactory({
            id_product: fail_product._id,
            id_pr: fail_product.id_pr,
            id_ag: fail_product.id_ag,
            id_sv: fail_product.id_sv
        }).save();
        const user_ = await user.findById(fail_product.id_sv);
        await svFixing.deleteOne({id_product: fail_product._id});
        await historicMove.updateOne({id_product: req.body.id_product}, 
            {$push : {
                arr: {where: user_.name,time: Date.now(),status:"Bị lỗi cần trả về CSSX"}}
        });
        return res.json({
            success: 1
        });
    
    } catch (error) {
        console.log(error);
        return res.status(UNKNOWN).json({ success: 0});
    }
}

//Lấy ra tất cả sản phẩm đã sửa chữa xong của 1 trung tâm bảo hành mà chưa trả về đại lý **********
const getFixedProducts = async (req,res) => {
    if (!req.query.id_user) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }
    
    try {
        const fixed_product = await svFixed.find({id_sv: req.query.id_user});
        let list = new Array;
        for (let i = 0; i < fixed_product.length; i++) {
            const _product = await product.findById(fixed_product[i].id_product);
            list.push(_product);
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

//Lấy ra tất cả sản phẩm không sửa được phải trả về cơ sở sản xuất của 1 trung tâm bảo hành 
const getErrorProducts = async (req,res) => {
    if (!req.query.id_user) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }

    try {
        let list = new Array;
        const er_back_factory = await erBackFactory.find({id_sv: req.query.id_user});
        const er_back_production = await erBackProduction.find({id_sv: req.query.id_user});
        for (let i = 0; i < er_back_factory.length; i++) {
            const bf = await product.findById(er_back_factory[i].id_product)
            if (bf) list.push(bf);
        }
        for (let i = 0; i < er_back_production.length; i++) {
            const bp = await product.findById(er_back_production[i].id_product)
            if (bp) list.push(bp);
        }
        return res.json({
            success: 1,
            list: list 
        })
    } catch(error) {
        console.log(error);
        return res.status(BAD_REQUEST).json({ success: 0 });
    }
}

//Lấy ra tất cả sản phẩm được đại lý gửi đến để sửa chữa của 1 trung tâm bảo hành **************
const getServiceProducts = async (req,res) => {
    if (!req.query.id_user) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }

    try {
        const product_service = await product.find({id_sv: req.query.id_user, status:"er_service"});

        return res.json({
            success: 1,
            list: product_service 
        });
    } catch(error) {
        console.log(error);
        return res.status(BAD_REQUEST).json({ success: 0 });
    }
}

//Nhận sản phẩm cần bảo hành từ đại lý ************
const takeServiceProduct = async (req,res) => {
    if (!req.body.id_product) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }

    try {
        const product_service = await product.findByIdAndUpdate({_id: req.body.id_product},{
            status:"sv_fixing", 
            namespace: "Trung tâm bảo hành"
        });
        const user_ = await user.findById(product_service.id_sv);
        await new svFixing({
            id_product: product_service._id,
            id_ag: product_service.id_ag,
            id_sv: product_service.id_sv,
            time: Date.now()
        }).save();
        await historicMove.updateOne({id_product: req.body.id_product}, 
            {$push : {
                arr: {where: user_.name,time: Date.now(),status:"Đang bảo hành"}}
        });
        return res.json({
            success: 1
        });
    } catch(error) {
        console.log(error);
        return res.status(BAD_REQUEST).json({ success: 0 });
    }
}

//Số lượng sản phẩm bảo hành thành công trong mỗi tháng (của tất cả các năm) của 1 trung tâm bảo hành
const staticByMonthFixedProduct = async(req,res) => {
    if (!req.query.id_user) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }
  
    try {
        const fixed_product = await svFixed.find({id_sv: req.query.id_user});
        fixed_product.sort(sortFunction);
        let list = new Array;
        let k = 1;
        for (let i = 1; i < fixed_product.length; i++) {
            if (fixed_product[i].time.getUTCMonth() - fixed_product[i-1].time.getUTCMonth() == 0) k++; 
            else {
                let time = fixed_product[i-1].time.getUTCMonth().toString() + "/" + fixed_product[i-1].time.getUTCFullYear().toString();
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

//Số lượng sản phẩm bảo hành thành công trong mỗi năm của 1 trung tâm bảo hành
const staticByYearFixedProduct = async(req,res) => {
    if (!req.query.id_user) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }
  
    try {
        const fixed_product = await svFixed.find({id_sv: req.query.id_user});
        fixed_product.sort(sortFunction);
        let list = new Array;
        let k = 1;
        for (let i = 1; i < fixed_product.length; i++) {
            if (fixed_product[i].time.getUTCFullYear() - fixed_product[i-1].time.getUTCFullYear() == 0) k++; 
            else {
                let time = fixed_product[i-1].time.getUTCFullYear().toString();
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
    getAllFixingProduct,
    getFixedProducts,
    letBackProductToAgent,
    letBackProductToFactory,
    getErrorProducts,
    takeServiceProduct,
    getServiceProducts,
    staticByMonthFixedProduct,
    staticByYearFixedProduct
}