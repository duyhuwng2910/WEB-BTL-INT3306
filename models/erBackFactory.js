const mongoose = require('./database');
const { Schema } = mongoose;

const erBackFactorySchema = new Schema({
    id_product: String,
    id_ag: String,
    id_sv: String,
    id_pr: String,
    time:{
        type: Date,
        default: Date.now()
    }
})

const erBackFactory = mongoose.model('er_back_factory', erBackFactorySchema);
module.exports = erBackFactory;