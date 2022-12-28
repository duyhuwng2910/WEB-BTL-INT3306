const mongoose = require('./database');
const { Schema } = mongoose;

const passwordRecoverySchema = new Schema({
    email: String,
    id_user: String,
    otp: String,
    time: {
        type: Date,
        default: Date.now()
    }
})

const passwordRecovery = mongoose.model('password_recovery', passwordRecoverySchema);
module.exports = passwordRecovery;