require('dotenv').config();

const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/restful-auth-apis');

const express = require("express");
const app = express();
const Port = process.env.SERVER_PORT || 6000;

app.set('view engine','ejs');
app.set('views','./views');

const userRoute = require('./routes/userRoute');
app.use('/api',userRoute);

const authRoute = require('./routes/auth.Route');
app.use('/',authRoute);


app.listen(Port,()=>{
    console.log(`server Listen on port ${Port}`)
})