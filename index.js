var express = require('express');
var user_routes = require('./routes/user_routes')
var admin_routes = require('./routes/admin_routes')
var session = require('express-session');
var bodyparser = require('body-parser');
var upload = require('express-fileupload');
var cors = require("cors");
var exe = require('./conn');
const { render } = require('ejs');

var app = express();
app.use(session({
    secret:"Param Durgist",
    saveUninitialized : true,
    resave : true,
}));
app.use(bodyparser.urlencoded({extended:true}));
app.use(upload());
app.use(express.static("public/"))
app.use(cors());
app.use(bodyparser.json());

app.use("/",user_routes)
app.use("/admin",admin_routes)

app.listen(1000);