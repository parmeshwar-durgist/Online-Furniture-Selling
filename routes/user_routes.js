var express = require('express');
var router = express.Router();
var url = require('url');
var exe = require('./../conn');

function checklogin(req, res, next) 
{
    if(req.session.user_id != undefined)
        next();
    else 
        res.send("<script> alert('Invalid Login');location.href='/login';</script>")        
}

router.get('/',async function(req, res)
{
    console.log(req.session)
    var banner_info = await exe(`SELECT * FROM banner`);
    var why_choose_us_data = await exe(`SELECT * FROM why_choose_us`);
    var way_choose_us_heading_data = await exe(`SELECT * FROM way_choose_us_heading`);
    var modern_lnterior_design_data = await exe(`SELECT * FROM modern_lnterior_design`);
    var product_data = await exe(`SELECT * FROM product LIMIT 3`);
    var testimonialsdata = await exe(`SELECT * FROM testimonials`);
    var blogdata = await exe(`SELECT * FROM blog LIMIT 3`);
    var obj = {
        "banner_info":banner_info[0],
        "why_choose_us_data":why_choose_us_data,
        "way_choose_us_heading_data":way_choose_us_heading_data[0],
        "modern_lnterior_design_data":modern_lnterior_design_data[0],
        "product_data":product_data,
        "testimonialsdata":testimonialsdata,
        "blogdata":blogdata,
        "is_login" : ((req.session.user_id) ? true : false),
    }
    res.render("user/home.ejs",obj)
});

router.get('/shop',async function(req, res){

    var ttl_products = (await exe('SELECT COUNT(product_id) as tt1 FROM product'))[0].tt1;
    var per_page = 3;
    var ttl_page = (parseInt(ttl_products/per_page) < ttl_products/per_page) ? parseInt(ttl_products/per_page)+1 : parseInt(ttl_products/per_page)
    
    var url_data = url.parse(req.url,true).query;
    var page_no = 1;
    if(url_data.page_no)
        page_no = url_data.page_no;
    var start = (page_no*per_page)-per_page;

    var products = await exe(`SELECT * FROM product LIMIT ${start},${per_page}`);

    var obj = {
        "is_login" : ((req.session.user_id) ? true : false),
        "products":products,
        "ttl_page":ttl_page,
        "page_no":page_no,
    }
    res.render("user/shop.ejs",obj)
});

router.get('/about',async function(req, res){
    
    var why_choose_us_data = await exe(`SELECT * FROM why_choose_us`);
    var way_choose_us_heading_data = await exe(`SELECT * FROM way_choose_us_heading`);
    var testimonialsdata = await exe(`SELECT * FROM testimonials`);
    var teamdata = await exe(`SELECT * FROM team`);
    var obj = {
        "why_choose_us_data":why_choose_us_data,
        "way_choose_us_heading_data":way_choose_us_heading_data[0],
        "testimonialsdata":testimonialsdata,
        "teamdata":teamdata,
        "is_login" : ((req.session.user_id) ? true : false),
    }
    res.render("user/about.ejs",obj)
});

router.get('/services',function(req, res)
{
    var obj = {
        "is_login" : ((req.session.user_id) ? true : false),
    }
    res.render("user/services.ejs",obj)
});

router.get('/blog',function(req, res){
    var obj = {
        "is_login" : ((req.session.user_id) ? true : false),
    }
    res.render("user/blog.ejs",obj)
});

router.get('/contact',function(req, res){
    var obj = {
        "is_login" : ((req.session.user_id) ? true : false),
    }
    res.render("user/contact.ejs",obj)
});



router.get('/thankyou',function(req, res){
    var obj = {
        "is_login" : ((req.session.user_id) ? true : false),
    }
    res.render("user/thankyou.ejs",obj)
});
// ----------------------------------------------------------------------------

router.get('/login',function(req, res){
    var obj = {
        "is_login" : ((req.session.user_id) ? true : false),
    }
    res.render("user/login.ejs",obj)
});

router.get('/signup',function(req, res){
    var obj = {
        "is_login" : ((req.session.user_id) ? true : false),
    }
    res.render("user/signup.ejs",obj);
});

router.post('/do_register',async function(req, res){
    var d = req.body;
    var sql =  `INSERT INTO user_tbl (user_name,mobile_number,user_email,password) 
    VALUES ('${d.user_name}', '${d.mobile_number}', '${d.user_email}', '${d.password}')`;
    var data = await exe(sql);
    res.redirect("/login")
});

router.post('/do_login',async function(req, res)
{
    var d = req.body;
    var sql = `SELECT * FROM user_tbl WHERE mobile_number = '${d.mobile_number}' 
    AND password = '${d.password}'`;
    var data = await exe(sql);
    if(data.length > 0)
    {
        req.session.user_id = data[0].user_id;
        res.redirect("/")
        // res.send("<script>alert('Login Successful'); history.back();</script>")
    }
    else 
    {
        res.send("<script> alert('Invalid Details'); history.back();</script>")
    }
});


router.get('/product_info/:product_id',async function(req, res){
    var product_id = req.params.product_id;
    var product_det = await exe(` SELECT * FROM product,product_type WHERE product_type.product_type_id  = 
        product.product_type_id AND product_id = '${product_id}' `)

    var user_id = req.session.user_id;
    var checkcard = await  exe(`SELECT * FROM user_card WHERE user_id ='${user_id}' AND product_id ='${product_id}'`);
    console.log(checkcard);

    var obj = {
        "is_login" : ((req.session.user_id) ? true : false),
        "product_det":product_det[0],
        "in_cart" : (checkcard.length > 0) ? true :false ,
    }
    res.render("user/product_info.ejs",obj)
});


router.get('/add_to_cart/:product_id',async function(req, res){
    user_id = req.session.user_id;
    product_id = req.params.product_id;
    qty = 1 ;
    if(user_id == undefined)
        res.send(`<script> alert('Invalid User, Login Now... '); location.href ='/login'; </script>`)
    else 
    {
        var sql = `SELECT * FROM user_card WHERE user_id ='${user_id}' AND product_id ='${product_id}'`;
        var check = await exe(sql);
        if(check.length == 0)
        {
            var sql2 = `INSERT INTO user_card(user_id,product_id,qty) VALUES ('${user_id}','${product_id}','${qty}')`;
            var data = await exe(sql2);
        }
        res.redirect("/product_info/"+product_id)
        // res.send(data)
        // console.log(data);
    }
});


router.get('/cart',checklogin,async function(req, res)
{
    var user_id = req.session.user_id;
    var sql = `SELECT * FROM user_card,product WHERE product.product_id 
    = user_card.product_id AND user_id = '${user_id}'`;
    var cart_product = await exe(sql);
    console.log(cart_product);
    var obj = {
        "is_login" : ((req.session.user_id) ? true : false),
        "products":cart_product,
    }
    res.render("user/cart.ejs",obj);
});


router.get('/decrease_qty/:user_card_id',async function(req, res) 
{
    var user_card_id = req.params.user_card_id;
    var sql = `SELECT * FROM user_card , product WHERE product.product_id = user_card.product_id AND
      user_card_id = '${user_card_id}' `;
    var data = await exe(sql);
    
    var new_qty = data[0].qty - 1;
    var price = data[0].product_price;  
    if(new_qty > 0) 
    {
        var total = new_qty*price;
        sql = `UPDATE user_card SET qty = '${new_qty}' WHERE user_card_id = '${user_card_id}'`;
        var data = await exe(sql);
        res.send({"new_qty":new_qty,"total":total});
    }
    else 
    {
        var total = data[0].qty*price;
        res.send({"new_qty":data[0].qty,"total":total});        
    }
});

// increase_qty

router.get('/increase_qty/:user_card_id',async function(req, res){
    sql = `UPDATE user_card SET qty = qty+1 WHERE user_card_id = '${req.params.user_card_id}'`;
    var data = await exe(sql);

    var sql = `SELECT * FROM user_card,product WHERE user_card.product_id = product.product_id AND user_card_id = '${req.params.user_card_id}'`;
    var data = await exe(sql);
    var new_qty = data[0].qty;
    var price = data[0].product_price;
    var total = new_qty * price; 
    res.send({"new_qty":new_qty,"total":total});
}) ;


router.get('/delete_from_card/:id',async function(req, res){
    var sql = `DELETE FROM user_card WHERE user_card_id = '${req.params.id}'`;
    var data = await exe(sql);
    res.redirect("/cart");
}); 



router.get('/checkout',function(req, res)
{
    var obj = {
        "is_login" : ((req.session.user_id) ? true : false),
    }
    res.render("user/checkout.ejs",obj)
});


router.post('/place_order',checklogin,async function(req, res)
{
    req.body.order_data = String(new Date().toISOString()).slice(0,10);

    var d = req.body;
    var order_status ="pending";
    if(d.payment_mode == 'online')
        order_status = 'payment_pending';

    var sql = `INSERT INTO order_tbl
    (user_id,country,c_fname,c_lname,c_address,c_area,c_state,c_postal_zip,c_email_address,c_phone,payment_mode,order_data,order_status
    ,payment_status) VALUES('${req.session.user_id}','${d.country}','${d.c_fname}','${d.c_lname}','${d.c_address}','${d.c_area}','${d.c_state}',
    '${d.c_postal_zip}', '${d.c_email_address}','${d.c_phone}','${d.payment_mode}','${d.order_data}','${order_status}', 'pending')`;

    var data = await exe(sql);
    // res.send(data);

    var cart_products = await exe(`SELECT * FROM user_card,product WHERE product.product_id = user_card.product_id 
    AND user_id = '${req.session.user_id}'`);

    for(var i=0; i<cart_products.length; i++)
    {
        order_id = data.insertId;
        user_id = req.session.user_id;
        product_id = cart_products[i].product_id;
        product_qty = cart_products[i].qty;
        product_price = cart_products[i].product_price;
        product_name = cart_products[i].product_name;
        product_details = cart_products[i].product_details;

        sql = `INSERT INTO order_products(order_id,user_id, product_id,product_qty,product_price,product_name,product_details)
        VALUES ('${order_id}','${user_id}','${product_id}','${product_qty}','${product_price}','${product_name}','${product_details}')`;

        record = await exe(sql);
        console.log(record);
    }
    var sql = `DELETE FROM user_card WHERE user_id = '${req.params.user_id}'`;
    await exe(sql);
    if(order_status == 'payment_pending')
        res.redirect('/pay_payment/'+data.insertId)
    else 
        res.redirect('/my_orders')
});

router.get('/pay_payment/:order_id',checklogin,async function(req, res)
{
    obj = {
        "order_id":order_id
    }
    res.render('user/pay_payment.ejs',obj);
});

router.post('/payment_success/:order_id',async function(req, res)
{
    var order_id = req.params.order_id;
    var transaction_id = req.body.razorpay_payment_id;
    var today = new Date().toISOString().slice(0,10);

    var sql = `UPDATE order_tbl SET order_status = 'pending', payment_status='complete',
    transaction_id = '${transaction_id}', payment_date = '${today}' WHERE order_id = '${order_id}'`;
    var data = await exe(sql);
    res.redirect('/my_orders')
});


router.get('/my_orders',async function(req, res)
{
    var sql = ` SELECT *,(SELECT SUM(product_qty * product_price) FROM order_products 
                WHERE order_products.order_id = order_tbl.order_id) 
                as total_amt FROM order_tbl WHERE user_id = '${req.session.user_id}' AND  order_status != 'payment_pending'`;
    var orders = await exe(sql);
    var obj = {
        "orders":orders,
        "is_login" : ((req.session.user_id) ? true : false),
    }
    res.render('user/my_orders.ejs',obj);
});



/*
My Order :
    SELECT *,(SELECT SUM(product_qty*product_price) FROM order_products 
    WHERE order_products.order_id = order_tbl.order_id) 
    as total_amt FROM order_tbl 
    
*/


router.get("/print_order/:id",async function(req,res)
{
  var data = await exe(`SELECT * FROM order_tbl WHERE order_id ='${req.params.id}'`);
  var products = await exe(`SELECT * FROM order_products WHERE order_id ='${req.params.id}'`);

 
  var obj = {       
      "is_login":((req.session.user_id) ? true:false), 
      "order_info":data[0],
      "products":products,
  };
  res.render("user/print_order.ejs",obj);
});


router.post('/user_contect',async function(req, res) {
    var d = req.body;
    var sql = `INSERT INTO contect(fname,lname,email,message)  
    VALUES ('${d.fname}','${d.lname}','${d.email}','${d.message}')`;
    var data = await exe(sql);
    res.redirect("/contact");
});


router.get("/profile",async function(req,res)
{
    var user_id = req.session.user_id;
    var user_info = await exe(`SELECT * FROM  user_tbl WHERE user_id ='${user_id}'`);
    obj = {       
        "is_login":((req.session.user_id) ? true:false), 
        "user_info":user_info[0],
    };
    res.render("user/profile.ejs",obj);
});


router.get('/logout',  function (req, res, next)  {
    if (req.session) {
      req.session.destroy(function (err) {
        if (err) {
          return next(err);
        } else {
          return res.redirect('/');
        }
      });
    }
  });



module.exports = router;