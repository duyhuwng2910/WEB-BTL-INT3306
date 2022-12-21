const mongoose = require('mongoose');

connectToDatabase();

function connectToDatabase() {
  mongoose.connect(process.env.MONGO_URI, {})
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
