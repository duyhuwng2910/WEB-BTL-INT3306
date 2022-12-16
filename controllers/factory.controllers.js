const { UNKNOWN, BAD_REQUEST } = require("../config/HttpStatusCodes");
const backAgent = require("../models/backAgent");
const backProduction = require("../models/backProduction");
const erBackFactory = require("../models/erBackFactory");
const erBackProduction = require("../models/erBackProduction");
const newProduct = require("../models/newProduct");
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
            const _product = await product.findById(new_product[i].id_product);
            list.push(_product);
        }
        
        console.log(list);
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
        const agent_product = await product.findByIdAndUpdate({_id: req.body.id_product},{status:"back_agent", id_ag: agent._id});
        if (agent_product) {
            await new backAgent({
                id_product: req.body.id_product,
                id_ag: agent._id,
                id_pr: agent_product.id_pr,
                agent_status: "Chưa nhận"
            }).save();

            await newProduct.deleteOne({id_product: req.body.id_product});

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
    if (!req.body.id_user || !req.body.batch || !req.body.name || !req.body.color || !req.body.amount) {
        return res.status(BAD_REQUEST).json({ success: 0 });
      }
    
    try {
        let k = req.body.amount;
        for (let i = 0; i < k; i++) {
            const new_product = await new product({
                id_pr: req.body.id_user,
                id_ag: "",
                id_sv: "",
                batch: req.body.batch,
                status: "new_product",
                name: req.body.name,
                color: req.body.color,
                bio: "",
                namespace: "Cơ sở sản xuất"
            }).save();
            await new newProduct({
                id_product: new_product._id,
                id_user: new_product.id_pr
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
/********************************************************************************************/
//Nhận sản phẩm cũ 
const takeOldProduct = async (req,res) => {
    if (!req.body.id_product) {
        return res.status(BAD_REQUEST).json({ success: 0 });
      }
    
    try {
        const back_production = await backProduction.findOne({id_product: req.body.id_product});
        await backProduction.findByIdAndUpdate({_id: back_production._id},{status: "Đã nhận"});

        return res.json({
          success: 1
        });
    } catch (error) {
        console.log(error);
        return res.status(UNKNOWN).json({ success: 0});
    }
}

//Nhận sản phẩm lỗi
const takeErrorProduct = async (req,res) => {
    if (!req.body.id_product) {
        return res.status(BAD_REQUEST).json({ success: 0 });
      }
    
    try {
        const error_product = await erBackFactory.find({id_product: req.body.id_product})
        await new erBackProduction({
            id_product: error_product.id_product,
            id_ag: error_product.id_ag,
            id_pr: error_product.id_pr,
            id_sv: error_product.id_sv
        }).save();
        
        return res.json({
          success: 1
        });
    } catch (error) {
        console.log(error);
        return res.status(UNKNOWN).json({ success: 0});
    }
}

//Lấy ra danh sách sản phẩm lỗi - cũ mà cơ sở chưa nhận được
const getErrorOrOldProductNonConfirm = async (req,res) => {
    if (!req.query.id_user) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }

    try {
        let list = new Array;
        const er_back_factory = await erBackFactory.find({id_pr: req.query.id_user});
        const back_production = await backProduction.find({id_user: req.query.id_user, status: "Chưa nhận"});
        for (let i = 0; i < er_back_factory.length; i++) {
            list.push(await product.findById(er_back_factory[i].id_product));
        }
        for (let i = 0; i < back_production.length; i++) {
            list.push(await product.findById(back_production[i].id_product));
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

//Lấy ra danh sách sản phẩm lỗi - cũ mà cơ sở sản xuất đã nhận
const getErrorOrOldProductIsConfirm = async (req,res) => {
    if (!req.query.id_user) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }

    try {
        let list = new Array;
        const er_back_production = await erBackProduction.find({id_pr: req.query.id_user});
        const back_production = await backProduction.find({id_user: req.query.id_user, status: "Đã nhận"});
        for (let i = 0; i < er_back_production.length; i++) {
            list.push(await product.findById(er_back_production[i].id_product));
        }
        for (let i = 0; i < back_production.length; i++) {
            list.push(await product.findById(back_production[i].id_product));
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
        for (let i = 1; i < new_product.length; i++) {
            if (new_product[i].time.getUTCMonth() - new_product[i-1].time.getUTCMonth() == 0) k++; 
            else {
                let time = new_product[i-1].time.getUTCMonth().toString() + "/" + new_product[i-1].time.getUTCFullYear().toString();
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
        for (let i = 1; i < new_product.length; i++) {
            if (new_product[i].time.getUTCFullYear() - new_product[i-1].time.getUTCFullYear() == 0) k++; 
            else {
                let time = new_product[i-1].time.getUTCFullYear().toString();
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

//Số lượng sản phẩm cũ trong mỗi tháng (của tất cả các năm) của 1 cơ sở sản xuất
const staticByMonthBackProduct = async(req,res) => {
    if (!req.query.id_user) {
      return res.status(BAD_REQUEST).json({ success: 0 });
    }
  
    try {
        const back_product = await backProduction.find({id_user: req.query.id_user});
        back_product.sort(sortFunction);
        let list = new Array;
        let k = 1;
        for (let i = 1; i < back_product.length; i++) {
            if (back_product[i].time.getUTCMonth() - back_product[i-1].time.getUTCMonth() == 0) k++; 
            else {
                let time = back_product[i-1].time.getUTCMonth().toString() + "/" + back_product[i-1].time.getUTCFullYear().toString();
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

//Số lượng sản phẩm cũ trong mỗi năm của 1 cơ sở sản xuất
const staticByYearBackProduct = async(req,res) => {
    if (!req.query.id_user) {
      return res.status(BAD_REQUEST).json({ success: 0 });
    }
  
    try {
        const back_product = await backProduction.find({id_user: req.query.id_user});
        back_product.sort(sortFunction);
        let list = new Array;
        let k = 1;
        for (let i = 1; i < back_product.length; i++) {
            if (back_product[i].time.getUTCFullYear() - back_product[i-1].time.getUTCFullYear() == 0) k++; 
            else {
                let time = back_product[i-1].time.getUTCFullYear().toString();
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
    staticByYearNewProduct
}