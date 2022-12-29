const mongoose = require('./database');
const { Schema } = mongoose;

const historicMoveSchema = new Schema({
    id_product: String,
    arr: [
        {
            status: String,
            time:{
                type: Date,
                default: Date.now()
            },
            where: String
        }
    ]
})

const historicMove = mongoose.model('history', historicMoveSchema);
module.exports = historicMove;