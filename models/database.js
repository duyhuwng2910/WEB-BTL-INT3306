const mongoose = require('mongoose');

connectToDatabase();

function connectToDatabase() {
  mongoose.connect("mongodb+srv://tuyen:wg9S6QDYC8FnPOgK@cluster0.yxt56w4.mongodb.net/productmove", {})
    .then(() => {
      return console.log('- connected to database');
    })
    .catch((error) => {
      console.log(error);
      setTimeout(() => {
        console.log('- reconnecting to database...');
        connectToDatabase();
      }, 10000);
      return;
    });
}

module.exports = mongoose;
