const mongoose = require('./database');
const { Schema } = mongoose;

const userType = {
    agent: "ag",
    production_unit: "pu",
    service_center: "sc"
}

const userSchema = new Schema({
    username: String,
    name: String,
    email: String,
    password: String, 
    type_user: String,
    address: String,
    phone: String,
    bio: String,
    verified: Boolean
});

const user = mongoose.model('user', userSchema);

module.exports = { user, userType };