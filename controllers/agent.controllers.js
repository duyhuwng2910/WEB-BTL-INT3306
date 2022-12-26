const { model } = require('mongoose');
const backAgent = require('../models/backAgent');
const product = require('../models/product');
const sold = require('../models/sold');
const backProduction = require('../models/backProduction');
const svReturn = require('../models/svReturn');
const erRecall = require('..//models/erRecall');
const erService = require('../models/erService');
const svFixing = require('../models/svFixing');
const svFixed = require('../models/svFixed');
const erBackFactory = require('../models/erBackFactory');
const erBackProduction = require('../models/erBackProduction');
const { user } = require('../models/user');
const { sortFunction, checkOverTimeService } = require('./auth.controllers');
const { UNKNOWN, BAD_REQUEST } = require('../config/HttpStatusCodes');
const historicMove = require('../models/historicMove');

//Lấy ra tất cả sản phẩm mới nhập về ở trong kho ****************
const getNewProductIsConfirm = async (req,res) => {
    if (!req.query.id_user) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }

    try {
        const agent_product = await backAgent.find({id_ag: req.query.id_user, agent_status: 'Đã nhận'});
        let list = new Array;
        for (let i = 0; i < agent_product.length; i++) {
            const _product = await product.findOne({_id: agent_product[i].id_product, status: "back_agent"});
            list.push(_product);
        }

        return res.json({
            success: 1,
            list: list 
        })
    } catch(error) {
        console.log(error);
        return res.status(UNKNOWN).json({ success: 0 });
    }
}

//Trả lại sản phẩm cho cơ sở sản xuất do lâu không bán được ********************************
const backToProduction = async (req,res) => {
    if (!req.body.id_product) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }

    try {
        const agent_product = await backAgent.findOne({id_product: req.body.id_product});
        await new backProduction({
            id_product: agent_product.id_product,
            id_pr: agent_product.id_pr,
            id_ag: agent_product.id_ag,
            status: "Chưa nhận"
        }).save();
        await product.findOneAndUpdate({_id: req.body.id_product}, {status: 'back_production', namespace: "Cơ sở sản xuất"} );
        const user_ = await user.findById(agent_product.id_ag);
        await historicMove.updateOne({id_product: req.body.id_product}, 
            {$push : {
                arr: {where: user_.name,time: Date.now(),status:"Cũ, trả lại CSSX"}}
        });
        return res.json({
            success: 1
        })
    } catch(error) {
        console.log(error);
        return res.status(UNKNOWN).json({ success: 0 });
    }
}

//Bán sản phẩm cho khách hàng **************************
const letProductSold = async (req,res) => {
    if (!req.body.id_product || !req.body.customer || !req.body.address || !req.body.phoneNumber) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }

    try {
        const agent_product = await backAgent.findOne({id_product: req.body.id_product});
        await new sold({
            id_product: agent_product.id_product,
            id_user: agent_product.id_ag, //id đại lý
            customer: req.body.customer,
            phoneNumber: req.body.phoneNumber,
            address: req.body.address
        }).save();
        await product.findOneAndUpdate({_id: req.body.id_product}, {status: 'sold'});
        await historicMove.updateOne({id_product: req.body.id_product}, 
            {$push : {
                arr: {where: req.body.customer,time: Date.now(),status:"Đã bán"}}
        });
        return res.json({
            success: 1
        }); 

    } catch(error) {
        console.log(error);
        return res.status(UNKNOWN).json({ success: 0 });
    }
}

//Lấy ra tất cả sản phẩm đã bán (chỉ gồm các sản phẩm đang ở trong tay khách hàng) của 1 đại lý ***********
const listSold = async (req,res) => {
    if (!req.query.id_user) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }

    try {
        let list = new Array;
        const product_sold = await sold.find({id_user: req.query.id_user});
        const product_return = await svReturn.find({id_user: req.query.id_user});
        for (let i = 0; i < product_sold.length; i++) {
            const ps = await product.findOne({_id:product_sold[i].id_product, status: "sold"});
            const sold_ = await sold.findOne({id_product: ps._id});
            if (checkOverTimeService(sold_,ps)) {
                await product.findByIdAndUpdate({_id: ps._id}, {st_Service: "Hết bảo hành"});
            }
            if (ps) list.push(ps);
        }
        for (let i = 0; i < product_return.length; i++) {
            const psr = await product.findOne({_id:product_return[i].id_product, status: "sv_return"});
            const sold_ = await sold.findOne({id_product: psr._id});
            if (checkOverTimeService(sold_,psr)) {
                await product.findByIdAndUpdate({_id: psr._id}, {st_Service: "Hết bảo hành"});
            }
            if (psr) list.push(psr);
        }
        return res.json({
            success: 1,
            list: list 
        });
    } catch(error) {
        console.log(error);
        return res.status(UNKNOWN).json({ success: 0 });
    }
}

//Triệu hồi sản phẩm  **********************************
const callBackProduct = async (req,res) => {
    if (!req.body.id_product) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }
    try {
        const customer_product = await product.findByIdAndUpdate({_id: req.body.id_product}, {status: "er_recall"});
        await new erRecall({
            id_product: customer_product._id,
            id_user: customer_product.id_ag,
            status: "Chưa nhận"
        }).save();
        const sold_ = await sold.findOne({id_product: req.body.id_product});
        await historicMove.updateOne({id_product: req.body.id_product}, 
            {$push : {
                arr: {where: sold_.customer,time: Date.now(),status:"Lỗi cần triệu hồi"}}
        });
        return res.json({
            success: 1
        })
    } catch(error) {
        console.log(error);
        return res.status(UNKNOWN).json({ success: 0 });
    }
}

// //Nhận sản phẩm lỗi cần bảo hành từ khách hàng kiểm tra còn bảo hành thì nhận, hết bảo hành thì không nhận
// const checkOverTime = async (req,res) => {
//     if (!req.body.id_product) {
//         return res.status(BAD_REQUEST).json({ success: 0 });
//     }

//     try {
//         const _product = await product.findById(id_product);
//         const sold_ = await sold.findOne({id_product: psr._id});
//         if (checkOverTimeService(sold_,_product)) {
//             await product.findByIdAndUpdate({_id: _product._id}, {st_Service: "Hết bảo hành"});
//             return res.json({
//                 success: 0,
//                 errorMessenger: "Sản phẩm đã hết bảo hành"
//             });
//         }
//         return res.json({
//             success: 1
//         });
//     } catch(error) {
//         console.log(error);
//         return res.status(UNKNOWN).json({ success: 0 });
//     }
// }

//Đưa sản phẩm đi bảo hành  **********************************
const letServiceProduct = async (req,res) => {
    if (!req.body.id_product || !req.body.service_name) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }

    try {
        const service = await user.findOne({name: req.body.service_name});
        const service_product = await product.findOne({_id: req.body.id_product});
        const er_service = await erService.findOne({id_product: req.body.id_product});
        if (!er_service) {
            await new erService({
                id_product: service_product._id,
                id_user: service_product.id_ag,
                arr:[{service_name: req.body.service_name, time: Date.now()}]
            }).save();
        } else {
            await erService.updateOne({_id: er_service._id}, 
                {$push : {
                    arr: {service_name: req.body.service_name,time: Date.now()}}
            });
        }
        await product.findByIdAndUpdate({_id: req.body.id_product}, {
            status: 'er_service', 
            id_sv: service._id
        });
        const user_ = await user.findById(service_product.id_ag);
        await historicMove.updateOne({id_product: req.body.id_product}, 
            {$push : {
                arr: {where: user_.name,time: Date.now(),status:"Lỗi cần bảo hành"}}
        });
        return res.json({
            success: 1
        })

    } catch(error) {
        console.log(error);
        return res.status(UNKNOWN).json({ success: 0 });
    }
}

//Lấy ra các sản phẩm đang được triệu hồi của 1 đại lý  ********************
const getReCallingProduct = async (req,res) => {
    if (!req.query.id_user) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }

    try {
        const recallProduct = await erRecall.find({id_user: req.query.id_user});
        let list = new Array;
        for (let i = 0; i < recallProduct.length; i++) {
            const _product = await product.findOne({_id: recallProduct[i].id_product, status: "er_recall"});
            list.push(_product);
        }
        return res.json({
            success: 1,
            list: list
        });
    } catch(error) {
        console.log(error);
        return res.status(UNKNOWN).json({ success: 0 });
    }
}

//Nhận sản phẩm triệu hồi từ khách hàng và đem đi bảo hành**********************
const takeRecallProduct = async (req,res) => {
    if (!req.body.id_product || !req.body.service_name) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }

    try {
        const service = await user.findOne({name: req.body.service_name});
        const product_recall = await erRecall.findOne({id_product: req.body.id_product});
        await erRecall.findByIdAndUpdate({_id: product_recall._id}, {status: "Đã nhận"});
        const er_service = await erService.findOne({id_product: req.body.id_product});
        if (!er_service) {
            await new erService({
                id_product: product_recall.id_product,
                id_user: product_recall.id_user,
                arr:[{service_name: req.body.service_name, time: Date.now()}]
            }).save();
        } else {
            await erService.updateOne({_id: er_service._id}, 
                {$push : {
                    arr: {service_name: req.body.service_name,time: Date.now()}}
            });
        }
        const product_ = await product.findOneAndUpdate({_id: req.body.id_product}, {status: 'er_service', id_sv: service._id});
        const user_ = await user.findById(product_.id_ag);
        await historicMove.updateOne({id_product: req.body.id_product}, 
            {$push : {
                arr: {where: user_.name,time: Date.now(),status:"Triệu hồi thành công"}}
        });
        return res.json({
            success: 1
        })
    } catch(error) {
        console.log(error);
        return res.status(UNKNOWN).json({ success: 0 });
    }
}

//Lấy ra các sản phẩm đang bảo hành của 1 đại lý  **********************
const listServiceProduct = async (req,res) => {
    if (!req.query.id_user) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }

    try {
        let list = new Array;
        const er_service = await erService.find({id_user: req.query.id_user});
        const sv_fixing = await svFixing.find({id_user: req.query.id_user});
        for (let i = 0; i < er_service.length; i++) {
            const es = await product.findOne({_id: er_service[i].id_product})
            if (es) list.push(es);
        }
        for (let i = 0; i < sv_fixing.length; i++) {
            const sf = await product.findOne({_id: sv_fixing[i].id_product})
            if (sf) list.push(sf);
        }
        return res.json({
            success: 1,
            list: list 
        })
    } catch(error) {
        console.log(error);
        return res.status(UNKNOWN).json({ success: 0 });
    }
}

//Lấy ra các sản phẩm đã bảo hành xong và đại lý đã nhận sản phẩm đó của 1 đại lý ***************
const getFixedProductsIsConfirm = async (req,res) => {
    if (!req.query.id_user) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }

    try {
        const sv_fixed = await svFixed.find({id_ag: req.query.id_user, agent_status: 'Đã nhận'});
        let list = new Array;
        for (let i = 0; i < sv_fixed.length; i++) {
            const _product = await product.findOne({_id: sv_fixed[i].id_product});
            list.push(_product);
        }

        return res.json({
            success: 1,
            list: list 
        })
    } catch(error) {
        console.log(error);
        return res.status(UNKNOWN).json({ success: 0 });
    }
}

//Trả lại sản phẩm đã bảo hành cho khách hàng *******************
const returnProductToCustomer = async (req,res) => {
    if (!req.body.id_product) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }

    try {
        const product_fixed = await svFixed.findOne({id_product: req.body.id_product});
        const pf = await sold.findOne({id_product: req.body.id_product});
        await new svReturn({
            id_product: product_fixed.id_product,
            id_user: product_fixed.id_ag,
            customer: pf.customer
        }).save();
        await product.findByIdAndUpdate({_id: req.body.id_product},{status: "sv_return"});
        await historicMove.updateOne({id_product: req.body.id_product}, 
            {$push : {
                arr: {where: pf.customer,time: Date.now(),status:"Đã trả lại cho khách hàng"}}
        });
        return res.json({
            success: 1
        });
    } catch(error) {
        console.log(error);
        return res.status(UNKNOWN).json({ success: 0 });
    }
}

//Lấy ra các sản phẩm cũ cần trả lại cơ sở sản xuất của 1 đại lý ********************
const getBackProduction = async (req,res) => {
    if (!req.query.id_user) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }

    try {
        const product_backproduction = await backProduction.find({id_user: req.query.id_user});
        let list = new Array;
        for (let i = 0; i < product_backproduction.length; i++) {
            const _product = await product.findById(product_backproduction[i].id_product);
            list.push(_product);
        }

        return res.json({
            success: 1,
            list: list
        });
    } catch(error) {
        console.log(error);
        return res.status(UNKNOWN).json({ success: 0 });
    }
}

//Lấy ra các sản phẩm mới về của 1 đại lý *****************
const getNewProductNonConfirm = async (req,res) => {
    if (!req.query.id_user) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }

    try {
        const agent_product = await backAgent.find({id_ag: req.query.id_user, agent_status: 'Chưa nhận'});
        let list = new Array;
        for (let i = 0; i < agent_product.length; i++) {
            const _product = await product.findById(agent_product[i].id_product);
            list.push(_product);
        }

        return res.json({
            success: 1,
            list: list 
        })
    } catch(error) {
        console.log(error);
        return res.status(UNKNOWN).json({ success: 0 });
    }
}

//Nhận sản phẩm mới từ cơ sở sản xuất **************************************
const takeNewProducts = async (req,res) => {
    if (!req.body.id_product) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }

    try {
        const bg_product = await backAgent.findOne({id_product: req.body.id_product});
        await backAgent.findByIdAndUpdate({_id: bg_product._id}, {agent_status: 'Đã nhận'});
        const user_ = await user.findById(bg_product.id_ag);
        await historicMove.updateOne({id_product: req.body.id_product}, 
            {$push : {
                arr: {where: user_.name,time: Date.now(),status:"Mới nhập từ CSSX"}}
        });
        return res.json({
            success: 1
        })
    } catch(error) {
        console.log(error);
        return res.status(UNKNOWN).json({ success: 0 });
    }
}

//Lấy ra các sản phẩm đã bảo hành xong nhưng đại lý chưa nhận được của 1 đại lý ***************
const getFixedProductsNonConfirm = async (req,res) => {
    if (!req.query.id_user) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }

    try {
        const agent_product = await svFixed.find({id_ag: req.query.id_user, agent_status: 'Chưa nhận'});
        let list = new Array;
        for (let i = 0; i < agent_product.length; i++) {
            const _product = await product.findById(agent_product[i].id_product);
            list.push(_product);
        }

        return res.json({
            success: 1,
            list: list 
        })
    } catch(error) {
        console.log(error);
        return res.status(UNKNOWN).json({ success: 0 });
    }
}

//Nhận sản phẩm đã bảo hành xong từ trung tâm bảo hành của 1 đại lý ***************
const takeFixedProducts = async (req,res) => {
    if (!req.body.id_product) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }

    try {
        const sv_fixed = await svFixed.findOne({id_product: req.body.id_product});
        await svFixed.findByIdAndUpdate({_id: sv_fixed._id}, {agent_status: 'Đã nhận'});
        await product.findByIdAndUpdate({_id: req.body.id_product}, {id_sv: ""})
        const user_ = await user.findById(sv_fixed.id_ag);
        await historicMove.updateOne({id_product: req.body.id_product}, 
            {$push : {
                arr: {where: user_.name,time: Date.now(),status:"Đã bảo hành xong"}}
        });
        return res.json({
            success: 1
        })
    } catch(error) {
        console.log(error);
        return res.status(UNKNOWN).json({ success: 0 });
    }
}

//Lấy ra các sản phẩm lỗi trả về cơ sở sản xuất của 1 đại lý ********************
const getErrorProducts = async (req,res) => {
    if (!req.query.id_user) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }

    try {
        let list = new Array;
        const er_back_factory = await erBackFactory.find({id_ag: req.query.id_user});
        const er_back_production = await erBackProduction.find({id_ag: req.query.id_user});
        for (let i = 0; i < er_back_factory.length; i++) {
            const bf = await product.findById(er_back_factory[i].id_product);
            if (bf) list.push(bf);
        }
        for (let i = 0; i < er_back_production.length; i++) {
            const bp = await product.findById(er_back_production[i].id_product);
            if (bp) list.push(bp);
        }
        return res.json({
            success: 1,
            list: list 
        })
    } catch(error) {
        console.log(error);
        return res.status(UNKNOWN).json({ success: 0 });
    }
}

//Số lượng sản phẩm bán ra trong mỗi tháng (của tất cả các năm) của 1 đại lý
const staticByMonthSoldProduct = async(req,res) => {
    if (!req.query.id_user) {
      return res.status(BAD_REQUEST).json({ success: 0 });
    }
  
    try {
        const sold_product = await sold.find({id_user: req.query.id_user});
        sold_product.sort(sortFunction);
        let list = new Array;
        let k = 1;
        for (let i = 1; i < sold_product.length; i++) {
            console.log(sold_product[i].time.getUTCMonth());
            if (sold_product[i].time.getUTCMonth() - sold_product[i-1].time.getUTCMonth() == 0) k++; 
            else {
                let time = (sold_product[i-1].time.getUTCMonth() + 1).toString() + "/" + sold_product[i-1].time.getUTCFullYear().toString();
                list.push({time: time,amount: k});
                k = 1;
            }
            if (i == sold_product.length - 1) {
                let time = (sold_product[i].time.getUTCMonth() + 1).toString() + "/" + sold_product[i].time.getUTCFullYear().toString();
                list.push({time: time,amount: k});
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

//Số lượng sản phẩm bán ra trong mỗi năm của 1 đại lý
const staticByYearSoldProduct = async(req,res) => {
    if (!req.query.id_user) {
      return res.status(BAD_REQUEST).json({ success: 0 });
    }
  
    try {
        const sold_product = await sold.find({id_user: req.query.id_user});
        sold_product.sort(sortFunction);
        let list = new Array;
        let k = 1;
        for (let i = 1; i < sold_product.length; i++) {
            console.log(sold_product[i].time.getUTCMonth());
            if (sold_product[i].time.getUTCMonth() - sold_product[i-1].time.getUTCMonth() == 0) k++; 
            else {
                let time = (sold_product[i-1].time.getUTCMonth() + 1).toString() + "/" + sold_product[i-1].time.getUTCFullYear().toString();
                list.push({time: time,amount: k});
                k = 1;
            }
            if (i == sold_product.length - 1) {
                let time = (sold_product[i].time.getUTCMonth() + 1).toString() + "/" + sold_product[i].time.getUTCFullYear().toString();
                list.push({time: time,amount: k});
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
    getNewProductIsConfirm,
    letProductSold,
    backToProduction,
    listSold,
    callBackProduct,
    letServiceProduct,
    getReCallingProduct,
    listServiceProduct,
    getFixedProductsIsConfirm,
    returnProductToCustomer,
    takeRecallProduct,
    getBackProduction,
    getNewProductNonConfirm,
    takeNewProducts,
    staticByMonthSoldProduct,
    staticByYearSoldProduct,
    getErrorProducts,
    getFixedProductsNonConfirm,
    takeFixedProducts,
    //checkOverTime
}