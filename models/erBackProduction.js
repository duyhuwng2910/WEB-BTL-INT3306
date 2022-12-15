const mongoose = require('./database');
const { Schema } = mongoose;

const erBackProductionSchema = new Schema({
    id_product: String,
    id_pr: String,
    id_ag: String,
    id_sv: String,
    time:{
        type: Date,
        default: Date.now()
    }
})

const erBackProduction = mongoose.model('er_back_production', erBackProductionSchema);
module.exports = erBackProduction;