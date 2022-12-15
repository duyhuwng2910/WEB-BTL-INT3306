const mongoose = require('./database');
const { Schema } = mongoose;

const productSchema = new Schema({
    name: String,
    id_ag: String,
    id_sv: String,
    id_pr: String,
    batch: Number,
    color: String,
    namespace: String,
    status: String,
    bio: String
})

const product = mongoose.model('product', productSchema);
module.exports = product;