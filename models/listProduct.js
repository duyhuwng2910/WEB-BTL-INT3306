const mongoose = require('./database');
const { Schema } = mongoose;

const listproductSchema = new Schema({
    name: String,
    any: Number,
    namespace: String,
    status: String
})

const listProduct = mongoose.model('listproduct', listproductSchema);
module.exports = listProduct;