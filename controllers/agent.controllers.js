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
const { sortFunction } = require('./auth.controllers');
const { UNKNOWN, BAD_REQUEST } = require('../config/HttpStatusCodes');

//Lấy ra tất cả sản phẩm mới nhập về ở trong kho
const getAllNewProducts = async (req,res) => {
    if (!req.querry.id_user) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }

    try {
        const agent_product = await backAgent.find({id_user: req.querry.id_user, agent_status: 'Đã nhận'});
        let list = new Array;
        for (let i = 0; i < agent_product.length; i++) {
            const _product = product.findById(agent_product[i].id_product);
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

//Trả lại sản phẩm cho cơ sở sản xuất do lâu không bán được
const backToProduction = async (req,res) => {
    if (!req.body.id_product) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }

    try {
        const agent_product = await backAgent.findOne({id_product: req.body.id_product});
        await new backProduction({
            id_product: agent_product.id_product,
            id_user: agent_product.id_user, 
            status: "Chưa nhận"
        }).save();
        await product.findOneAndUpdate({_id: req.body.id_product}, {status: 'back_production'});
        return res.json({
            success: 1
        })
    } catch(error) {
        console.log(error);
        return res.status(UNKNOWN).json({ success: 0 });
    }
}

//Bán sản phẩm cho khách hàng
const letProductSold = async (req,res) => {
    if (!req.body.id_product || !req.body.customer || !req.body.address || !req.body.phoneNumber) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }

    try {
        const agent_product = await backAgent.findOne({_id: req.body.id_product});
        await new sold({
            id_product: agent_product.id_product,
            id_user: agent_product.id_user, //id đại lý
            customer: req.body.customer,
            phoneNumber: req.body.phoneNumber,
            address: req.body.address
        }).save();
        await product.findOneAndUpdate({_id: req.body.id_product}, {status: 'sold'});
        return res.json({
            success: 1
        }); 

    } catch(error) {
        console.log(error);
        return res.status(UNKNOWN).json({ success: 0 });
    }
}

//Lấy ra tất cả sản phẩm đã bán (chỉ gồm các sản phẩm đang ở trong tay khách hàng) của 1 đại lý
const listSold = async (req,res) => {
    if (!req.querry.id_user) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }

    try {
        let list = new Array;
        const product_sold = await sold.find({id_user: req.querry.id_user});
        const product_return = await svReturn.find({id_user: req.querry.id_user});
        for (let i = 0; i < product_sold.length; i++) {
            list.push(await product.findById(product_sold[i].id_product));
        }
        for (let i = 0; i < product_return.length; i++) {
            list.push(await product.findById(product_return[i].id_product));
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

//Triệu hồi sản phẩm
const callBackProduct = async (req,res) => {
    if (!req.querry.id_product) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }
    try {
        const customer_product = await product.findByIdAndUpdate({_id: req.querry.id_product}, {status: "er_recall"});
        await new erRecall({
            id_product: customer_product._id,
            id_user: customer_product.id_ag,
            status: "Chưa nhận"
        }).save();
        return res.json({
            success: 1
        })
    } catch(error) {
        console.log(error);
        return res.status(UNKNOWN).json({ success: 0 });
    }
}

//Đưa sản phẩm đi bảo hành
const letServiceProduct = async (req,res) => {
    if (!req.body.id_product || !req.body.service_name) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }

    try {
        const service = user.find({name: req.body.service_name});
        const product_service = await product.findByIdAndUpdate({_id: req.body.id_product}, {status: "er_service", id_sv: service._id});
        const er_service = await erService.find({id_product: req.querry.id_product});

        if (er_service.length == 0) {
            await new erService({
                id_product: product_service.id,
                id_user: product_service.id_user,
                arr:[{service_name: req.body.service_name, time: Date.now()}]
            }).save();

        } else {
            er_service.arr.push({
                service_name: req.body.service_name,
                time: Date.now()
            })
        }
        
        return res.json({
            success: 1
        })
    } catch(error) {
        console.log(error);
        return res.status(UNKNOWN).json({ success: 0 });
    }
}

//Lấy ra các sản phẩm đang được triệu hồi của 1 đại lý
const getReCallingProduct = async (req,res) => {
    if (!req.body.id_user) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }

    try {
        const recallProduct = await erRecall.findOne({id_user: req.body.id_user});
        let list = new Array;
        for (let i = 0; i < recallProduct.length; i++) {
            const _product = product.findById(recallProduct[i].id_product);
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

//Nhận sản phẩm triệu hồi từ khách hàng
const takeRecallProduct = async (req,res) => {
    if (!req.body.id_product || !req.body.service_name) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }

    try {
        const product_recall = await erRecall.findByIdAndUpdate({id_product: req.body.id_product}, {status: "Đã nhận"});
        const er_service = await erService.find({id_product: req.querry.id_product});
        if (er_service.length == 0) {
            await new erService({
                id_product: product_recall.id_product,
                id_user: product_recall.id_user,
                arr:[{service_name: req.body.service_name, time: Date.now()}]
            }).save();
        } else {
            er_service.arr.push({
                service_name: req.body.service_name,
                time: Date.now()
            })
        }
        await product.findOneAndUpdate({_id: req.body.id_product}, {status: 'er_service'});
        return res.json({
            success: 1
        })
    } catch(error) {
        console.log(error);
        return res.status(UNKNOWN).json({ success: 0 });
    }
}

//Lấy ra các sản phẩm đang bảo hành của 1 đại lý
const listServiceProduct = async (req,res) => {
    if (!req.querry.id_user) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }

    try {
        let list = new Array;
        const er_service = await erService.find({id_user: req.querry.id_user});
        const sv_fixing = await svFixing.find({id_user: req.querry.id_user});
        for (let i = 0; i < er_service.length; i++) {
            list.push(await er_service.find({id: er_service[i].id}));
        }
        for (let i = 0; i < sv_fixing.length; i++) {
            list.push(await sv_fixing.find({id: sv_fixing[i].id}));
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

//Lấy ra các sản phẩm đã bảo hành xong và đại lý đã nhận sản phẩm đó của 1 đại lý
const getFixedProductsInAgent = async (req,res) => {
    if (!req.querry.id_user) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }

    try {
        const sv_fixed = await svFixed.find({id_ag: req.querry.id_user, agent_status: 'Đã nhận'});
        let list = new Array;
        for (let i = 0; i < sv_fixed.length; i++) {
            const _product = product.findById(sv_fixed[i].id_product);
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

//Trả lại sản phẩm đã bảo hành cho khách hàng
const returnProductCustomer = async (req,res) => {
    if (!req.body.id_product) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }

    try {
        const product_fixed = await sold.find({id_product: req.body.id_product});
        await new svReturn({
            id_product: product_fixed.id_product,
            id_user: product_fixed.id_user,
            customer: product_fixed.customer
        }).save();
        await product.findByIdAndUpdate({_id: req.body.id_product},{status: "sv_return"});

        return res.json({
            success: 1
        });
    } catch(error) {
        console.log(error);
        return res.status(UNKNOWN).json({ success: 0 });
    }
}

//Lấy ra các sản phẩm cũ cần trả lại cơ sở sản xuất của 1 đại lý
const getBackProduction = async (req,res) => {
    if (!req.body.id_user) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }

    try {
        const product_backproduction = await backProduction.find({id_user: req.body.id_user});
        let list = new Array;
        for (let i = 0; i < product_backproduction.length; i++) {
            const _product = product.findById(product_backproduction[i].id_product);
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

//Lấy ra các sản phẩm mới về của 1 đại lý
const getNewProducts = async (req,res) => {
    if (!req.querry.id_user) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }

    try {
        const agent_product = await backAgent.find({id_user: req.querry.id_user, agent_status: 'Chưa nhận'});
        let list = new Array;
        for (let i = 0; i < agent_product.length; i++) {
            const _product = product.findById(agent_product[i].id_product);
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

//Nhận sản phẩm mới từ cơ sở sản xuất
const takeNewProducts = async (req,res) => {
    if (!req.querry.id_product) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }

    try {
        await backAgent.findByIdAndUpdate({id_product: req.querry.id_product}, {agent_status: 'Đã nhận'});
        await product.findByIdAndUpdate({_id: req.body.id_product}, {status: "back_agent"})

        return res.json({
            success: 1
        })
    } catch(error) {
        console.log(error);
        return res.status(UNKNOWN).json({ success: 0 });
    }
}

//Lấy ra các sản phẩm đã bảo hành xong nhưng đại lý chưa nhận được của 1 đại lý
const getFixedProducts = async (req,res) => {
    if (!req.querry.id_user) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }

    try {
        const agent_product = await svFixed.find({id_ag: req.querry.id_user, agent_status: 'Chưa nhận'});
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

//Nhận sản phẩm đã bảo hành xong từ trung tâm bảo hành của 1 đại lý
const takeFixedProducts = async (req,res) => {
    if (!req.querry.id_product) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }

    try {
        await svFixed.findByIdAndUpdate({id_product: req.querry.id_product}, {agent_status: 'Đã nhận'});
        await product.findByIdAndUpdate({_id: req.body.id_product}, {status: "sv_fixed"})

        return res.json({
            success: 1
        })
    } catch(error) {
        console.log(error);
        return res.status(UNKNOWN).json({ success: 0 });
    }
}

//Lấy ra các sản phẩm lỗi trả về cơ sở sản xuất của 1 đại lý
const getErrorProducts = async (req,res) => {
    if (!req.querry.id_user) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }

    try {
        let list = new Array;
        const er_back_factory = await erBackFactory.find({id_ag: req.querry.id_user});
        const er_back_production = await erBackProduction.find({id_ag: req.querry.id_user});
        for (let i = 0; i < er_back_factory.length; i++) {
            list.push(await product.findById(er_back_factory[i].id_product));
        }
        for (let i = 0; i < er_back_production.length; i++) {
            list.push(await product.findById(er_back_production[i].id_product));
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
    if (!req.querry.id_user) {
      return res.status(BAD_REQUEST).json({ success: 0 });
    }
  
    try {
        const sold_product = await sold.find({id_user: req.querry.id_user});
        sold_product.sort(sortFunction);
        let list = new Array;
        let k = 1;
        for (let i = 1; i < sold_product.length; i++) {
            if (sold_product[i].time.getUTCMonth() - sold_product[i-1].time.getUTCMonth() == 0) k++; 
            else {
                let time = sold_product[i-1].time.getUTCMonth().toString() + "/" + sold_product[i-1].time.getUTCFullYear().toString();
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

//Số lượng sản phẩm bán ra trong mỗi năm của 1 đại lý
const staticByYearSoldProduct = async(req,res) => {
    if (!req.querry.id_user) {
      return res.status(BAD_REQUEST).json({ success: 0 });
    }
  
    try {
        const sold_product = await sold.find({id_user: req.querry.id_user});
        sold_product.sort(sortFunction);
        let list = new Array;
        let k = 1;
        for (let i = 1; i < sold_product.length; i++) {
            if (sold_product[i].time.getUTCFullYear() - sold_product[i-1].time.getUTCFullYear() == 0) k++; 
            else {
                let time = sold_product[i-1].time.getUTCFullYear().toString();
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
    getAllNewProducts,
    letProductSold,
    backToProduction,
    listSold,
    callBackProduct,
    letServiceProduct,
    getReCallingProduct,
    listServiceProduct,
    getFixedProductsInAgent,
    returnProductCustomer,
    takeRecallProduct,
    getBackProduction,
    getNewProducts,
    takeNewProducts,
    staticByMonthSoldProduct,
    staticByYearSoldProduct,
    getErrorProducts,
    getFixedProducts,
    takeFixedProducts
}