const { UNKNOWN, BAD_REQUEST } = require("../config/HttpStatusCodes");
const backAgent = require("../models/backAgent");
const backProduction = require("../models/backProduction");
const erBackFactory = require("../models/erBackFactory");
const erBackProduction = require("../models/erBackProduction");
const historicMove = require("../models/historicMove");
const newProduct = require("../models/newProduct");
const portfolio = require("../models/portfolio");
const product = require("../models/product");
const { user } = require("../models/user");
const { sortFunction } = require("./auth.controllers");

//Lấy ra danh sách sản phẩm mới trong kho của 1 cơ sở sản xuất **********
const getNewProducts = async (req,res) => {
    if (!req.query.id_user) {
        return res.status(BAD_REQUEST).json({ success: 0 });
      }
    
    try {
        const new_product = await newProduct.find({id_user: req.query.id_user});
        let list = new Array;
        for (let i = 0; i < new_product.length; i++) {
            const _product = await product.findOne({_id: new_product[i].id_product, status: 'new_product'});
            if (_product) list.push(_product);
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

//Xuất sản phẩm cho đại lý **********************
const sendProductToAgent = async (req,res) => {
    if (!req.body.id_product || !req.body.agent_name) {
        return res.status(BAD_REQUEST).json({ success: 0 });
      }
    
    try {
        const agent = await user.findOne({name: req.body.agent_name});
        const agent_product = await product.findByIdAndUpdate({_id: req.body.id_product},{
            status:"back_agent", 
            id_ag: agent._id, 
            namespace: "Đại lý phân phối"
        });
        if (agent_product) {
            await new backAgent({
                id_product: req.body.id_product,
                id_ag: agent._id,
                id_pr: agent_product.id_pr,
                agent_status: "Chưa nhận"
            }).save();
            const user_ = await user.findById(agent_product.id_pr);
            //await newProduct.deleteOne({id_product: req.body.id_product});
            await historicMove.updateOne({id_product: req.body.id_product}, 
                {$push : {
                    arr: {where: user_.name,time: Date.now(),status:"Xuất cho đại lý"}}
            });

            return res.json({
                success: 1
            });
        } 
        return res.json({
            success: 0,
            error: "Không tìm thấy sản phẩm"
        });
    
    } catch (error) {
        console.log(error);
        return res.status(UNKNOWN).json({ success: 0});
    }
}

//Nhập các lô sản phẩm vào kho ****************
const entryBatchProduct = async (req,res) => {
    if (!req.body.id_user || !req.body.batch || !req.body.name || !req.body.color || !req.body.amount
        || !req.body.DoM || !req.body.ToS || !req.body.bio || !req.body.capacity) {
        return res.status(BAD_REQUEST).json({ success: 0 });
      }
    
    try {
        const user_ = user.findById(req.body.id_user);
        let k = req.body.amount;
        for (let i = 0; i < k; i++) {
            const new_product = await new product({
                id_pr: req.body.id_user,
                id_ag: "",
                id_sv: "",
                batch: req.body.batch,
                capacity: req.body.capacity,
                status: "new_product",
                name: req.body.name,
                color: req.body.color,
                bio: req.body.bio,
                namespace: "Cơ sở sản xuất",
                DoM: req.body.DoM,
                ToS: req.body.ToS,
                st_Service: "Còn bảo hành"
            }).save();
            await new newProduct({
                id_product: new_product._id,
                id_user: new_product.id_pr
            }).save();
            await new historicMove({
                id_product: new_product._id,
                arr:[{
                    status: "Mới sản xuất",
                    where: user_.name
                }]
            }).save();
        }
        const portfo = await portfolio.findOne({name: req.body.name});
        if (portfo) {
            let tf = false;
            for (let j = 0; j < portfo.model.length; j++) {
                if (portfo.model[j] == req.body.capacity) {
                    tf = true;
                    break;
                }
            }
            if (!tf) await portfolio.updateOne({_id: portfo._id}, {$push: {model : req.body.capacity}});
        } else {
            await new portfolio({
                name: req.body.name,
                model:[req.body.capacity]
            }).save();
        }

        return res.json({
          success: 1
        });
    
    } catch (error) {
        console.log(error);
        return res.status(UNKNOWN).json({ success: 0});
    }
}

//Lấy ra danh sách tất cả sản phẩm xuất đi của 1 cơ sở sản xuất *********
const getSendAgentProduct = async (req,res) => {
    if (!req.query.id_user) {
        return res.status(BAD_REQUEST).json({ success: 0 });
      }
    
    try {
        const send_product = await backAgent.find({id_pr: req.query.id_user});
        let list = new Array;
        for (let i = 0; i < send_product.length; i++) {
            const _product = await product.findById(send_product[i].id_product);
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

//Nhận sản phẩm cũ ********************
const takeOldProduct = async (req,res) => {
    if (!req.body.id_product) {
        return res.status(BAD_REQUEST).json({ success: 0 });
      }
    
    try {
        const back_production = await backProduction.findOne({id_product: req.body.id_product});
        const user_ = await user.findById(back_production.id_pr);
        await backProduction.findByIdAndUpdate({_id: back_production._id},{status: "Đã nhận"});
        await historicMove.updateOne({id_product: req.body.id_product}, 
            {$push : {
                arr: {where: user_.name,time: Date.now(),status:"CSSX đã nhận sản phẩm cũ"}}
        });
        return res.json({
          success: 1
        });
    } catch (error) {
        console.log(error);
        return res.status(UNKNOWN).json({ success: 0});
    }
}

//Nhận sản phẩm lỗi ************************
const takeErrorProduct = async (req,res) => {
    if (!req.body.id_product) {
        return res.status(BAD_REQUEST).json({ success: 0 });
      }
    
    try {
        const error_product = await erBackFactory.findOne({id_product: req.body.id_product});
        const user_ = await user.findById(error_product.id_pr);
        await new erBackProduction({
            id_product: error_product.id_product,
            id_ag: error_product.id_ag,
            id_pr: error_product.id_pr,
            id_sv: error_product.id_sv
        }).save();
        await erBackFactory.deleteOne({id_product: req.body.id_product});
        await product.findByIdAndUpdate({_id: req.body.id_product}, {status: "er_back_production"});
        await historicMove.updateOne({id_product: req.body.id_product}, 
            {$push : {
                arr: {where: user_.name,time: Date.now(),status:"CSSX đã nhận sản phẩm lỗi"}}
        });
        return res.json({
          success: 1
        });
    } catch (error) {
        console.log(error);
        return res.status(UNKNOWN).json({ success: 0});
    }
}

//Lấy ra danh sách sản phẩm lỗi - cũ mà cơ sở chưa nhận được ***********************
const getErrorOrOldProductNonConfirm = async (req,res) => {
    if (!req.query.id_user) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }

    try {
        let list = new Array;
        const er_back_factory = await erBackFactory.find({id_pr: req.query.id_user});
        const back_production = await backProduction.find({id_pr: req.query.id_user, status: "Chưa nhận"});
        for (let i = 0; i < er_back_factory.length; i++) {
            const bf = await product.findById(er_back_factory[i].id_product);
            if (bf) list.push(bf);
        }
        for (let i = 0; i < back_production.length; i++) {
            const bp = await product.findById(back_production[i].id_product)
            if (bp) list.push(bp);
            console.log(bp);
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

//Lấy ra danh sách sản phẩm lỗi - cũ mà cơ sở sản xuất đã nhận **************************
const getErrorOrOldProductIsConfirm = async (req,res) => {
    if (!req.query.id_user) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }

    try {
        let list = new Array;
        const er_back_production = await erBackProduction.find({id_pr: req.query.id_user});
        const back_production = await backProduction.find({id_pr: req.query.id_user, status: "Đã nhận"});
        for (let i = 0; i < er_back_production.length; i++) {
            const ebp = await product.findById(er_back_production[i].id_product);
            if (ebp) list.push(ebp);
        }
        for (let i = 0; i < back_production.length; i++) {
            const bp = await product.findById(back_production[i].id_product);
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

//Số lượng sản phẩm sản xuất trong mỗi tháng (của tất cả các năm) của 1 cơ sở sản xuất
const staticByMonthNewProduct = async(req,res) => {
    if (!req.query.id_user) {
      return res.status(BAD_REQUEST).json({ success: 0 });
    }
  
    try {
        const new_product = await newProduct.find({id_user: req.query.id_user});
        new_product.sort(sortFunction);
        let list = new Array;
        let k = 1;
        if (new_product.length == 1) {
            let month = (new_product[0].time.getUTCMonth() + 1).toString(); 
            let year = new_product[0].time.getUTCFullYear().toString();
            list.push({month: month,quater: quater, year: year, amount: k});
        }
        for (let i = 1; i < new_product.length; i++) {
            if (new_product[i].time.getUTCMonth() - new_product[i-1].time.getUTCMonth() == 0) k++; 
            else {
                let month = (new_product[i-1].time.getUTCMonth() + 1).toString(); 
                let year = new_product[i-1].time.getUTCFullYear().toString();
                list.push({month: month,year: year, amount: k});
                k = 1;
            }
            if (i == new_product.length - 1) {
                let month = (new_product[i-1].time.getUTCMonth() + 1).toString(); 
                let year = new_product[i-1].time.getUTCFullYear().toString();
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

//Số lượng sản phẩm sản xuất trong mỗi quý (của tất cả các năm) của 1 cơ sở sản xuất
const staticByQuarterNewProduct = async(req,res) => {
    if (!req.query.id_user) {
      return res.status(BAD_REQUEST).json({ success: 0 });
    }
  
    try {
        const new_product = await newProduct.find({id_user: req.query.id_user});
        new_product.sort(sortFunction);
        let list = new Array;
        let k = 1;
        if (new_product.length == 1) {
            let quater = sortTime(new_product[0].time.getUTCMonth() + 1); 
            let year = new_product[0].time.getUTCFullYear().toString();
            list.push({quater: quater,year: year, amount: k});
        }
        for (let i = 1; i < new_product.length; i++) {
            if (new_product[i].time.getUTCMonth() - new_product[i-1].time.getUTCMonth() == 0) k++; 
            else {
                let quater = sortTime(new_product[0].time.getUTCMonth() + 1); 
                let year = new_product[0].time.getUTCFullYear().toString();
                list.push({quater: quater,year: year, amount: k});
                k = 1;
            }
            if (i == new_product.length - 1) {
                let quater = sortTime(new_product[0].time.getUTCMonth() + 1); 
                let year = new_product[0].time.getUTCFullYear().toString();
                list.push({quater: quater,year: year, amount: k});
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

//Số lượng sản phẩm sản xuất trong mỗi năm của 1 cơ sở sản xuất
const staticByYearNewProduct = async(req,res) => {
    if (!req.query.id_user) {
      return res.status(BAD_REQUEST).json({ success: 0 });
    }
  
    try {
        const new_product = await newProduct.find({id_user: req.query.id_user});
        new_product.sort(sortFunction);
        let list = new Array;
        let k = 1;
        if (new_product.length == 1) {
            let year = new_product[0].time.getUTCFullYear().toString();
            list.push({year: year,amount: k})
        }
        for (let i = 1; i < new_product.length; i++) {
            if (new_product[i].time.getUTCFullYear() - new_product[i-1].time.getUTCFullYear() == 0) k++; 
            else {
                let year = new_product[i-1].time.getUTCFullYear().toString();
                list.push({year: year,amount: k});
                k = 1;
            }
            if (i == new_product.length - 1) {
                let year = new_product[i].time.getUTCFullYear().toString();
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

//Số lượng sản phẩm cũ trong mỗi tháng (của tất cả các năm) của 1 cơ sở sản xuất
const staticByMonthBackProduct = async(req,res) => {
    if (!req.query.id_user) {
      return res.status(BAD_REQUEST).json({ success: 0 });
    }
  
    try {
        const back_product = await backProduction.find({id_pr: req.query.id_user});
        back_product.sort(sortFunction);
        let list = new Array;
        let k = 1;
        if (back_product.length == 1) {
            let month = (back_product[0].time.getUTCMonth() + 1).toString(); 
            let year = back_product[0].time.getUTCFullYear().toString();
            list.push({month: month,quater: quater, year: year, amount: k});
        }
        for (let i = 1; i < back_product.length; i++) {
            if (back_product[i].time.getUTCMonth() - back_product[i-1].time.getUTCMonth() == 0) k++; 
            else {
                let month = (back_product[i-1].time.getUTCMonth() + 1).toString(); 
                let year = back_product[i-1].time.getUTCFullYear().toString();
                list.push({month: month,year: year, amount: k});
                k = 1;
            }
            if (i == back_product.length - 1) {
                let month = (back_product[i-1].time.getUTCMonth() + 1).toString(); 
                let year = back_product[i-1].time.getUTCFullYear().toString();
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

//Số lượng sản phẩm cũ trong mỗi quý (của tất cả các năm) của 1 cơ sở sản xuất
const staticByQuarterBackProduct = async(req,res) => {
    if (!req.query.id_user) {
      return res.status(BAD_REQUEST).json({ success: 0 });
    }
  
    try {
        const back_product = await backProduction.find({id_pr: req.query.id_user});
        back_product.sort(sortFunction);
        let list = new Array;
        let k = 1;
        if (back_product.length == 1) {
            let quater = sortTime(back_product[0].time.getUTCMonth() + 1); 
            let year = back_product[0].time.getUTCFullYear().toString();
            list.push({quater: quater,year: year, amount: k});
        }
        for (let i = 1; i < back_product.length; i++) {
            if (back_product[i].time.getUTCMonth() - back_product[i-1].time.getUTCMonth() == 0) k++; 
            else {
                let quater = sortTime(back_product[0].time.getUTCMonth() + 1); 
                let year = back_product[0].time.getUTCFullYear().toString();
                list.push({quater: quater,year: year, amount: k});
                k = 1;
            }
            if (i == back_product.length - 1) {
                let quater = sortTime(back_product[0].time.getUTCMonth() + 1); 
                let year = back_product[0].time.getUTCFullYear().toString();
                list.push({quater: quater,year: year, amount: k});
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

//Số lượng sản phẩm cũ trong mỗi năm của 1 cơ sở sản xuất
const staticByYearBackProduct = async(req,res) => {
    if (!req.query.id_user) {
      return res.status(BAD_REQUEST).json({ success: 0 });
    }
  
    try {
        const back_product = await backProduction.find({id_pr: req.query.id_user});
        back_product.sort(sortFunction);
        let list = new Array;
        let k = 1;
        if (back_product.length == 1) {
            let year = back_product[0].time.getUTCFullYear().toString();
            list.push({year: year,amount: k})
        }
        for (let i = 1; i < back_product.length; i++) {
            if (back_product[i].time.getUTCFullYear() - back_product[i-1].time.getUTCFullYear() == 0) k++; 
            else {
                let year = back_product[i-1].time.getUTCFullYear().toString();
                list.push({year: year,amount: k});
                k = 1;
            }
            if (i == back_product.length - 1) {
                let year = back_product[i].time.getUTCFullYear().toString();
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

module.exports = {
    getNewProducts,
    getSendAgentProduct,
    entryBatchProduct,
    sendProductToAgent,
    takeOldProduct,
    takeErrorProduct,
    getErrorOrOldProductNonConfirm,
    getErrorOrOldProductIsConfirm,
    staticByMonthBackProduct,
    staticByMonthNewProduct,
    staticByYearBackProduct,
    staticByYearNewProduct,
    staticByQuarterBackProduct,
    staticByQuarterNewProduct
}