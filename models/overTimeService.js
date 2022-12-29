const mongoose = require('./database');
const { Schema } = mongoose;

const overTimeServiceSchema = new Schema({
    id_product: String,
    producer: String,
    time:{
        type: Date,
        default: Date.now()
    }
})

const overTimeService = mongoose.model('overtime_service', overTimeServiceSchema);
module.exports = overTimeService;