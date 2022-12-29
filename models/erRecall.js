const mongoose = require('./database');
const { Schema } = mongoose;

const erRecallSchema = new Schema({
    id_product: String,
    id_user: String,
    status: String,
    time:{
        type: Date,
        default: Date.now()
    }
})

const erRecall = mongoose.model('er_recall', erRecallSchema);
module.exports = erRecall;