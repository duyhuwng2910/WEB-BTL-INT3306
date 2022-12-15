const mongoose = require('./database');
const { Schema } = mongoose;

const backAgentSchema = new Schema({
    id_product: String,
    id_user: String,
    agent_status: String,
    time:{
        type: Date,
        default: Date.now()
    }
})

const backAgent = mongoose.model('back_agent', backAgentSchema);

module.exports = backAgent;