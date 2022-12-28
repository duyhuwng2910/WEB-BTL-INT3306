const mongoose = require('./database');
const { Schema } = mongoose;

const regitEmailSchema = new Schema({
    email: String,
    id_user: String,
    otp: String,
    time: {
        type: Date,
        default: Date.now()
    }
})

const regitEmail = mongoose.model('regit_email', regitEmailSchema);
module.exports = regitEmail;