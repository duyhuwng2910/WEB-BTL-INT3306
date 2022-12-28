const mongoose = require('./database');
const { Schema } = mongoose;

const listproductSchema = new Schema({
    namespace: String,
    amount: Number,
    name: String,
    status: String,
    where: String
    
})

const listProduct = mongoose.model('listproduct', listproductSchema);
module.exports = listProduct;