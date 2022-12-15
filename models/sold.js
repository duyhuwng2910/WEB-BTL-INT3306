const mongoose = require('./database');
const { Schema } = mongoose;

const soldSchema = new Schema({
    id_product: String,
    id_user: String,
    customer: String,
    address: String,
    phoneNumber: String,
    time:{
        type: Date,
        default: Date.now()
    }
})

const sold = mongoose.model('sold', soldSchema);
module.exports = sold;