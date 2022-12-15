const express = require('express');
const cors = require('cors');
const logger = require('morgan');
const app = express();
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const upload = multer();

const mongoose = require('./models/database');

const managerRouter = require('./routers/manager.routers');
const authRouter = require('./routers/auth.routers');
const agentRouter = require('./routers/agent.routers');
const factoryRouter = require('./routers/factory.routers');
const serviceRouter = require('./routers/service.routers');

const server = app.listen(8000, () => {
    console.log(`Express running → PORT ${server.address().port}`);
});

app.use(express.json());

app.set('view engine', 'ejs');
//app.set('views', path.join(__dirname, 'views'));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/manager', managerRouter);
app.use('/auth', authRouter);
app.use('/agent', agentRouter)
app.use('/factory', factoryRouter);
app.use('/service', serviceRouter);


// // for parsing application/json
// app.use(bodyParser.json()); 

// // for parsing application/xwww-
// app.use(bodyParser.urlencoded({ extended: true })); 
// //form-urlencoded

// // for parsing multipart/form-data
// app.use(upload.array()); 
// app.use(express.static('public'));

app.post('/', function(req, res){
   console.log(req.body);
   res.send("recieved your request!");
});

module.exports = app;