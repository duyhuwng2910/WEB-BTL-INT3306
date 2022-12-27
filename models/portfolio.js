const mongoose = require('./database');
const { Schema } = mongoose;

const portfolioSchema = new Schema({
    name: String,
    model:[]
})

const portfolio = mongoose.model('portfolio', portfolioSchema);
module.exports = portfolio;