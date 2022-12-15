const mongoose = require('./database');
const { Schema } = mongoose;

const regitEmailSchema = new Schema({
    id_product: String,
    id_user: String,
    otp: String
})

const regitEmail = mongoose.model('regit_email', regitEmailSchema);
module.exports = regitEmail;