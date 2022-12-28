const mongoose = require('./database');
const { Schema } = mongoose;

const svReturnSchema = new Schema({
    id_product: String,
    id_user: String,
    customer: String,
    time:{
        type: Date,
        default: Date.now()
    }
})

const svReturn = mongoose.model('sv_return', svReturnSchema);
module.exports = svReturn;