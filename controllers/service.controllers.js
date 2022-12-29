const { BAD_REQUEST, UNKNOWN } = require("../config/HttpStatusCodes");
const erBackFactory = require("../models/erBackFactory");
const erBackProduction = require("../models/erBackProduction");
const historicMove = require("../models/historicMove");
const product = require("../models/product");
const svFixed = require("../models/svFixed");
const svFixing = require("../models/svFixing");
const { user } = require("../models/user");
const { sortFunction, sortTime } = require("./auth.controllers");

//Lấy ra tất cả sản phẩm đang được sửa chữa của 1 trung tâm bảo hành ************
const getAllFixingProduct = async (req,res) => {
    if (!req.query.id_user) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }
    
    try {
        let list = await product.find({id_sv: req.query.id_user, status: 'sv_fixing'})
        
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
        await historicMove.updateOne({id_product: req.body.id_product}, 
            {$push : {
                arr: {where: user_.name,time: Date.now(),status:"Lỗi cần trả về CSSX"}}
        });
        return res.json({
            success: 1
        });
    
    } catch (error) {
        console.log(error);
        return res.status(UNKNOWN).json({ success: 0});
    }
}

//Lấy ra tất cả sản phẩm đã sửa chữa xong của 1 trung tâm bảo hành **********
const getFixedProducts = async (req,res) => {
    if (!req.query.id_user) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }
    
    try {
        const fixed_product = await svFixed.find({id_sv: req.query.id_user});
        let list = new Array;
        let agName = new Array;
        let status = new Array;
        for (let i = 0; i < fixed_product.length; i++) {
            const _product = await product.findById(fixed_product[i].id_product);
            list.push(_product);
            if (fixed_product[i].agent_status == 'Đã nhận') status.push('Đã nhận');
            else status.push('Chưa nhận');
            const agent = await user.findById(_product.id_ag);
            agName.push(agent.name);
        }

        return res.json({
            success: 1,
            list: list,
            agName: agName,
            status: status
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
        let prName = new Array;
        let status = new Array;
        let list = new Array;
        const er_back_factory = await erBackFactory.find({id_sv: req.query.id_user});
        const er_back_production = await erBackProduction.find({id_sv: req.query.id_user});
        for (let i = 0; i < er_back_factory.length; i++) {
            const bf = await product.findById(er_back_factory[i].id_product)
            if (bf) {
                const producer = await user.findById(er_back_factory[i].id_pr);
                prName.push(producer.name);
                status.push('Chưa nhận');
                list.push(bf);
            }
        }
        for (let i = 0; i < er_back_production.length; i++) {
            const bp = await product.findById(er_back_production[i].id_product)
            if (bp) {
                const producer = await user.findById(er_back_production[i].id_pr);
                prName.push(producer.name);
                status.push('Đã nhận');
                list.push(bp);
            }
        }
        return res.json({
            success: 1,
            list: list,
            prName: prName,
            status: status
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
        let listAgentName = new Array;
        for (let i = 0; i < product_service.length; i++) {
            const agent_name = await user.findById(product_service[i].id_ag);
            listAgentName.push({ag_name: agent_name.name});
        }

        return res.json({
            success: 1,
            list: product_service,
            listAgentName: listAgentName
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
        if (fixed_product.length == 1) {
            let month = (fixed_product[0].time.getUTCMonth() + 1).toString(); 
            let year = fixed_product[0].time.getUTCFullYear().toString();
            list.push({month: month, year: year, amount: k});
        }
        for (let i = 1; i < fixed_product.length; i++) {
            if (fixed_product[i].time.getUTCMonth() - fixed_product[i-1].time.getUTCMonth() == 0) k++; 
            else {
                let month = (fixed_product[i-1].time.getUTCMonth() + 1).toString(); 
                let year = fixed_product[i-1].time.getUTCFullYear().toString();
                list.push({month: month,year: year, amount: k});
                k = 1;
            }
            if (i == fixed_product.length - 1) {
                let month = (fixed_product[i].time.getUTCMonth() + 1).toString(); 
                let year = fixed_product[i].time.getUTCFullYear().toString();
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

//Số lượng sản phẩm bảo hành thành công trong mỗi quý (của tất cả các năm) của 1 trung tâm bảo hành
const staticByQuarterFixedProduct = async(req,res) => {
    if (!req.query.id_user) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }
  
    try {
        const fixed_product = await svFixed.find({id_sv: req.query.id_user});
        fixed_product.sort(sortFunction);
        let list = new Array;
        let k = 1;
        if (fixed_product.length == 1) {
            let quarter = sortTime(fixed_product[0].time.getUTCMonth() + 1); 
            let year = fixed_product[0].time.getUTCFullYear().toString();
            list.push({quarter: quarter,year: year, amount: k});
        }
        for (let i = 1; i < fixed_product.length; i++) {
            let year = fixed_product[i - 1].time.getUTCFullYear();
            let quarter = sortTime(fixed_product[i-1].time.getUTCMonth() + 1);
            if (year == fixed_product[i].time.getUTCFullYear()) {
                if (quarter == sortTime(fixed_product[i].time.getUTCMonth() + 1)) k++;
                else {
                    list.push({quarter: quarter, year: year.toString(), amount: k});
                    k = 1;
                }
            } else {
                list.push({quarter: quarter, year: year.toString(), amount: k});
                k = 1;
            }
            if ( i == fixed_product.length - 1) {
                let lastQuarter = sortTime(fixed_product[i].time.getUTCMonth() + 1);
                let lastYear = fixed_product[i].time.getUTCFullYear().toString();
                list.push({quarter: lastQuarter, year: lastYear, amount: k});
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
        if (fixed_product.length == 1) {
            let year = fixed_product[0].time.getUTCFullYear().toString();
            list.push({year: year,amount: k})
        }
        for (let i = 1; i < fixed_product.length; i++) {
            if (fixed_product[i].time.getUTCFullYear() - fixed_product[i-1].time.getUTCFullYear() == 0) k++; 
            else {
                let year = fixed_product[i-1].time.getUTCFullYear().toString();
                list.push({year: year,amount: k});
                k = 1;
            }
            if (i == fixed_product.length - 1) {
                let year = fixed_product[i].time.getUTCFullYear().toString();
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

//Số lượng sản phẩm bảo hành không thành công trong mỗi tháng (của tất cả các năm) của 1 trung tâm bảo hành
const staticByMonthFailProduct = async(req,res) => {
    if (!req.query.id_user) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }
  
    try {
        const fail1 = await erBackFactory.find({id_sv: req.query.id_user});
        const fail2 = await erBackProduction.find({id_sv: req.query.id_user});
        var fail = fail1.concat(fail2);
        fail.sort(sortFunction);
        let list = new Array;
        let k = 1;
        if (fail.length == 1) {
            let month = (fail[0].time.getUTCMonth() + 1).toString(); 
            let year = fail[0].time.getUTCFullYear().toString();
            list.push({month: month, year: year, amount: k});
        }
        for (let i = 1; i < fail.length; i++) {
            if (fail[i].time.getUTCMonth() - fail[i-1].time.getUTCMonth() == 0) k++; 
            else {
                let month = (fail[i-1].time.getUTCMonth() + 1).toString(); 
                let year = fail[i-1].time.getUTCFullYear().toString();
                list.push({month: month,year: year, amount: k});
                k = 1;
            }
            if (i == fail.length - 1) {
                let month = (fail[i].time.getUTCMonth() + 1).toString(); 
                let year = fail[i].time.getUTCFullYear().toString();
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

//Số lượng sản phẩm bảo hành không thành công trong mỗi quý (của tất cả các năm) của 1 trung tâm bảo hành
const staticByQuarterFailProduct = async(req,res) => {
    if (!req.query.id_user) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }
  
    try {
        const fail1 = await erBackFactory.find({id_sv: req.query.id_user});
        const fail2 = await erBackProduction.find({id_sv: req.query.id_user});
        var fail = fail1.concat(fail2);
        fail.sort(sortFunction);
        let list = new Array;
        let k = 1;
        if (fail.length == 1) {
            let quarter = sortTime(fail[0].time.getUTCMonth() + 1); 
            let year = fail[0].time.getUTCFullYear().toString();
            list.push({quarter: quarter,year: year, amount: k});
        }
        for (let i = 1; i < fail.length; i++) {
            let year = fail[i - 1].time.getUTCFullYear();
            let quarter = sortTime(fail[i-1].time.getUTCMonth() + 1);
            if (year == fail[i].time.getUTCFullYear()) {
                if (quarter == sortTime(fail[i].time.getUTCMonth() + 1)) k++;
                else {
                    list.push({quarter: quarter, year: year.toString(), amount: k});
                    k = 1;
                }
            } else {
                list.push({quarter: quarter, year: year.toString(), amount: k});
                k = 1;
            }
            if ( i == fail.length - 1) {
                let lastQuarter = sortTime(fail[i].time.getUTCMonth() + 1);
                let lastYear = fail[i].time.getUTCFullYear().toString();
                list.push({quarter: lastQuarter, year: lastYear, amount: k});
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

//Số lượng sản phẩm bảo hành không thành công trong mỗi năm của 1 trung tâm bảo hành
const staticByYearFailProduct = async(req,res) => {
    if (!req.query.id_user) {
        return res.status(BAD_REQUEST).json({ success: 0 });
    }
  
    try {
        const fail1 = await erBackFactory.find({id_sv: req.query.id_user});
        const fail2 = await erBackProduction.find({id_sv: req.query.id_user});
        var fail = fail1.concat(fail2);
        fail.sort(sortFunction);
        let list = new Array;
        let k = 1;
        if (fail.length == 1) {
            let year = fail[0].time.getUTCFullYear().toString();
            list.push({year: year,amount: k})
        }
        for (let i = 1; i < fail.length; i++) {
            if (fail[i].time.getUTCFullYear() - fail[i-1].time.getUTCFullYear() == 0) k++; 
            else {
                let year = fail[i-1].time.getUTCFullYear().toString();
                list.push({year: year,amount: k});
                k = 1;
            }
            if (i == fail.length - 1) {
                let year = fail[i].time.getUTCFullYear().toString();
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
    getAllFixingProduct,
    getFixedProducts,
    letBackProductToAgent,
    letBackProductToFactory,
    getErrorProducts,
    takeServiceProduct,
    getServiceProducts,
    staticByMonthFixedProduct,
    staticByYearFixedProduct,
    staticByQuarterFixedProduct,
    staticByMonthFailProduct,
    staticByQuarterFailProduct,
    staticByYearFailProduct
}