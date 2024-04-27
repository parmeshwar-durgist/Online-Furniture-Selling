var express = require('express');
var router = express.Router();
var exe = require('./../conn');
var url = require('url');

router.get('/', function(req, res){
    res.render("admin/home.ejs")
});

router.get('/manage_banner',async function(req, res)
{
    var banner_info = await  exe(`SELECT * FROM banner`);
    obj = {"banner_info":banner_info}
    res.render("admin/manage_banner.ejs",obj)
});

router.post('/save_banner',async function(req, res)
{
    if(req.files)
    {
        var banner_img = new Date().getTime() + req.files.banner_img.name;
        req.files.banner_img.mv("public/uploads/"+banner_img)
        var d = req.body;
        var sql = `UPDATE banner SET banner_title = '${d.banner_title}' , 
        banner_details = '${d.banner_details}' , banner_link = '${d.banner_link}' , 
        banner_img = '${banner_img}' WHERE banner_id = 1`;
        var data = await exe(sql)
    }
    else 
    {
        var d = req.body;
        var sql = `UPDATE banner SET banner_title = '${d.banner_title}' , 
        banner_details = '${d.banner_details}' , banner_link = '${d.banner_link}'
        WHERE banner_id = 1`;
        var data = await exe(sql)
    }
    res.redirect("/admin/manage_banner")
});


router.get('/product_type',async function(req, res)
{
    var types = await exe('SELECT * FROM product_type');
    var obj = {"types":types}
    res.render("admin/product_type.ejs",obj)
});


router.get('/delete_product_type/:id', async function(req, res) {
    var sql = `DELETE FROM product_type WHERE product_type_id = '${req.params.id}'`;
    var data = await exe(sql);
    res.redirect('/admin/product_type');
});

router.post('/save_product_type',async function(req, res)
{
    var d = req.body;
    var sql =`INSERT INTO product_type (product_type_name) VALUES 
    ('${d.product_type_name}')`;
    var data = await exe(sql)
    res.redirect("/admin/product_type")
});

router.get('/product',async function(req, res)
{
    var types = await exe('SELECT * FROM product_type');
    var obj = {"types":types}
    res.render("admin/product.ejs",obj)
});

router.post('/save_product',async function(req, res)
{   
    if(req.files.product_image[0])
    {
        var file_names = [];
        console.log("Multiple images uploaded")
        for(var i=0; i<req.files.product_image.length;i++)
        {
            var fn = new Date().getTime() + req.files.product_image[i].name;
            req.files.product_image[i].mv("public/uploads/"+fn)
            file_names.push(fn);
        }
        var file_name = file_names.join(",");
    }
    else
    {
        var file_name = new Date().getTime() + req.files.product_image.name;
        req.files.product_image.mv("public/uploads/"+file_name)
    }
    var d = req.body
    var sql = `INSERT INTO product(product_type_id,product_name,product_price,duplicate_price,
        product_image,product_size,product_color,product_label,product_details) 
        VALUES ('${d.product_type}','${d.product_name}','${d.product_price}','${d.duplicate_price}'
        ,'${file_name}','${d.product_size}','${d.product_color}','${d.product_label}','${d.product_details}')`;
    var data =await exe(sql);
    res.redirect("/admin/product")
});


router.get('/product_list',async function(req, res)
{
    var sql = `SELECT * FROM product,product_type WHERE product.product_type_id = product_type.product_type_id`;
    var product_list_data = await exe(sql);
    var obj = {"product_list_data":product_list_data}
    res.render("admin/product_list.ejs",obj)
});

router.get('/delete_product/:id', async function(req, res) {
    var sql = `DELETE FROM product WHERE product_id = ${req.params.id}`;
    var data = await exe(sql);
    res.redirect("/admin/product_list");
});

router.get('/product_search',async function(req, res)
{
    var url_data = url.parse(req.url,true).query;
    var str = url_data.str;
    var sql = `SELECT * FROM product,product_type WHERE product.product_type_id = 
    product_type.product_type_id AND ( product_name LIKE '%${str}%' OR product_type_name 
    LIKE '%${str}%' OR product_size LIKE '%${str}%' OR product_price LIKE '%${str}%' 
    OR product_label LIKE '%${str}%')`;
    var products = await exe(sql)
    var obj = {"product_list_data":products}
    res.render("admin/product_list.ejs",obj)
});



router.get('/edit_products/:id',async function(req, res)
{
    var types = await exe('SELECT * FROM product_type');
    var product_info = await exe(`SELECT * FROM product WHERE product_id = ${req.params.id}`);
    var obj = {"types":types,"product_info":product_info[0]}
    res.render("admin/edit_product.ejs",obj)
})

router.post('/update_product',async function(req, res){
    console.log(req.files) 

    if(req.files)
    {
        var d = req.body;
        if(req.files.product_image[0])
        {
            var file_names = [];
            console.log("Multiple images uploaded")
            for(var i=0; i<req.files.product_image.length;i++)
            {
                var fn = new Date().getTime() + req.files.product_image[i].name;
                req.files.product_image[i].mv("public/uploads/"+fn)
                file_names.push(fn);
            }
            var file_name = file_names.join(",");
        }
        else
        {
            var file_name = new Date().getTime() + req.files.product_image.name;
            req.files.product_image.mv("public/uploads/"+file_name)
        }
        var sql = `UPDATE product SET product_image = '${file_name}' WHERE product_id = '${d.product_id}'`;
        var data = await exe(sql);
    }
    var d = req.body;
    var sqldata = `UPDATE product SET product_name = '${d.product_name}' 
        , product_price = '${d.product_price}' , duplicate_price = '${d.duplicate_price}'
        , product_color = '${d.product_color}' ,  product_size = '${d.product_size}' , product_label = '${d.product_label}'
        , product_details = '${d.product_details}' WHERE product_id = '${d.product_id}'`;

    var datas = await exe(sqldata)
    // res.send(datas);
    res.redirect("/admin/product_list")

})



router.get('/delete_product_image/:id/:img',async function(req, res)
{
    var data = await exe(`SELECT * FROM product WHERE product_id = '${req.params.id}'`);
    new_image = data[0]['product_image'].replaceAll(req.params.img,"");
    var sql = `UPDATE product SET product_image = '${new_image}' WHERE product_id = '${req.params.id}'`;
    var data = await exe(sql);
    res.send("<script> alert('update Successfully'); history.back();</script>")
})

// ---------------------------------------------------------------------------------------

router.get('/way_choose_us',async function (req, res) {
    var sql = `SELECT * FROM why_choose_us`;
    var why_choose_us_data = await exe(sql);
    var obj = {"why_choose_us_data":why_choose_us_data};
    res.render("admin/way_choose_us.ejs",obj);
});

router.post('/save_way_choose_us',async function (req, res) 
{
    var d = req.body;
    var sql = `INSERT INTO why_choose_us(way_choose_us_title,way_choose_us_details) 
    VALUES ('${d.way_choose_us_title}','${d.way_choose_us_details}')`;
    var data = await exe(sql);
    res.redirect("/admin/way_choose_us")
});


router.get('/why_choose_us_edit/:id',async function (req, res) {
    var sql = `SELECT * FROM why_choose_us`;
    var why_choose_us_data = await exe(sql);
    obj = {"why_choose_us_data":why_choose_us_data[0]}
    res.render("admin/why_choose_us_edit.ejs",obj);
});

router.post('/update_save_way_choose',async function (req, res) 
{
    var d = req.body;
    var sql = `UPDATE why_choose_us SET way_choose_us_title = '${d.way_choose_us_title}' , 
    way_choose_us_details = '${d.way_choose_us_details}' WHERE save_way_choose_us_id = '${d.save_way_choose_us_id}'`;
    var data = await exe(sql);
    res.send("<script> alert('update Successfully'); history.back();</script>");
});


router.get('/delete_why_choose_us/:id',async function(req, res)
{
    var sql = `DELETE FROM why_choose_us WHERE save_way_choose_us_id = '${req.params.id}'`;
    var data = await exe(sql);
    res.redirect("/admin/way_choose_us");
})


router.get('/way_choose_us_heading',async function (req, res) {
    var data = await exe(`SELECT * FROM way_choose_us_heading`);
    var obj = {
        "way_choose_us_heading_info": data[0],
    }
    res.render("admin/way_choose_us_heading.ejs",obj);
});

router.post("/save_way_choose_us_heading",async function (req, res) {
    var d = req.body;
    // var sql = `INSERT INTO way_choose_us_heading(way_choose_us_heading_title,way_choose_us_heading_details) VALUES 
    // ('${d.way_choose_us_heading_title}','${d.way_choose_us_heading_details}');`
    var data = await exe(`SELECT * FROM way_choose_us_heading`);
    res.send(data);
});

router.post("/update_way_choose_us_heading",async function(req, res) {
    var d = req.body;
    var sql = `UPDATE way_choose_us_heading SET way_choose_us_heading_title = '${d.way_choose_us_heading_title}' , 
    way_choose_us_heading_details = '${d.way_choose_us_heading_details}' WHERE way_choose_us_heading_id = '2'`;
    var data = await exe(sql);
    res.send("<script> alert('update Successfully'); history.back();</script>");
});
// --------------------------------------------------------------------------------------------------------------------------------------------
router.get("/pending_order",async function(req, res) {
    var sql = `SELECT *,(SELECT SUM(product_qty * product_price) 
    FROM order_products WHERE order_products.order_id = order_tbl.order_id ) 
    as ttl_amt FROM order_tbl WHERE order_status = 'pending'`;
    var obj = {
          "orders": await exe(sql)
    }
    res.render("admin/pending_order.ejs",obj);
});


router.get("/view_order/:id", async function(req, res) 
{
    var data  = await exe(`SELECT * FROM order_tbl WHERE order_id = '${req.params.id}'`);
    var products  = await exe(`SELECT * FROM order_products WHERE order_id = '${req.params.id}'`);
    var obj = {
        "order_info":data[0],
        "products":products,
    }
    res.render("admin/view_order.ejs",obj);
});

router.get("/dispatch_order/:id",async function (req, res) 
{
    var today = new Date().toISOString().slice(0,10);
    var sql =  `UPDATE order_tbl SET order_dispatch_date = '${today}', order_status = 'dispatch' WHERE order_id = '${req.params.id}'`;
    var data = await exe(sql);
    res.redirect("/admin/pending_order")
});

// --------------------------------------------------------------------------------------------------------------------------------------------

router.get("/dispatch_order",async function (req, res) {
    var sql = `SELECT *,(SELECT SUM(product_qty * product_price) 
    FROM order_products WHERE order_products.order_id = order_tbl.order_id ) 
    as ttl_amt FROM order_tbl WHERE order_status = 'dispatch'`;
    var obj = {
          "orders": await exe(sql)
    }
    res.render("admin/dispatch_order.ejs",obj);
});

router.get("/view_dispatch_order/:id",async function(req, res) 
{
    var data  = await exe(`SELECT * FROM order_tbl WHERE order_id = '${req.params.id}'`);
    var products  = await exe(`SELECT * FROM order_products WHERE order_id = '${req.params.id}'`);
    var obj = {
        "order_info":data[0],
        "products":products,
    }
    res.render("admin/view_dispatch_order.ejs",obj);
});

router.get("/delevered_order/:id",async function (req, res) 
{
    var today = new Date().toISOString().slice(0,10);
    var sql =  `UPDATE order_tbl SET order_delivered_date = '${today}', order_status = 'delevered' , payment_status = 'complete' WHERE order_id = '${req.params.id}'`;
    var data = await exe(sql);
    res.redirect("/admin/dispatch_order")
});

// ---------------------------------------------------------------------------------------------------------------------------------------------

router.get("/deleverd_order",async function (req, res) {
    var sql = `SELECT *,(SELECT SUM(product_qty * product_price) 
    FROM order_products WHERE order_products.order_id = order_tbl.order_id ) 
    as ttl_amt FROM order_tbl WHERE order_status = 'delevered' AND payment_status = 'complete' `;
    var obj = {
          "orders": await exe(sql)
    }
    res.render("admin/deleverd_order.ejs",obj);
});

router.get("/view_delevered_order/:id",async function(req, res) 
{
    var data  = await exe(`SELECT * FROM order_tbl WHERE order_id = '${req.params.id}'`);
    var products  = await exe(`SELECT * FROM order_products WHERE order_id = '${req.params.id}'`);
    var obj = {
        "order_info":data[0],
        "products":products,
    }
    res.render("admin/view_delevered_order.ejs",obj);
});

// ---------------------------------------------------------------------------------------------------------------------------------------------

router.get("/modern_lnterior_design",async function(req, res) {
    var modern_lnterior_design_data = await exe(`SELECT * FROM modern_lnterior_design`);
    res.render("admin/modern_lnterior_design.ejs",{"modern_lnterior_design_data":modern_lnterior_design_data[0]});
});

router.post("/modern_lnterior_design_save",async function(req, res) {
        // var modern_img1 = new Date().getTime() + req.files.modern_img1.name;
        // req.files.modern_img1.mv("public/uploads/"+modern_img1)

        // var modern_img2 = new Date().getTime() + req.files.modern_img2.name;
        // req.files.modern_img2.mv("public/uploads/"+modern_img2)

        // var modern_img3 = new Date().getTime() + req.files.modern_img3.name;
        // req.files.modern_img3.mv("public/uploads/"+modern_img3)

        // var d = req.body;

        // var sql = `INSERT INTO modern_lnterior_design(modern_img1,modern_img2,modern_img3,modern_heading,modern_details)
        // VALUES ('${modern_img1}','${modern_img2}','${modern_img3}','${d.modern_heading}','${d.modern_details}')`;
        // var data = await exe(sql);
        // res.send(data);
});

router.post("/update_modern_lnterior_design",async function(req, res) 
{
    if(req.files)
    {
        var modern_img1 = new Date().getTime() + req.files.modern_img1.name;
        req.files.modern_img1.mv("public/uploads/"+modern_img1)

        var modern_img2 = new Date().getTime() + req.files.modern_img2.name;
        req.files.modern_img2.mv("public/uploads/"+modern_img2)

        var modern_img3 = new Date().getTime() + req.files.modern_img3.name;
        req.files.modern_img3.mv("public/uploads/"+modern_img3)

        var sql = `UPDATE modern_lnterior_design SET modern_img1 = '${modern_img1}' , modern_img2 = '${modern_img2}
        modern_img3 = '${modern_img3}' WHERE modern_lnterior_design_id = '1'`;
        var data = await exe(sql);
        res.send("<script> alert('update Successfully'); history.back();</script>");

    }
    var d = req.body;
    var sql = `UPDATE modern_lnterior_design SET modern_heading  = '${d.modern_heading}' , modern_details = '${d.modern_details}'
    WHERE modern_lnterior_design_id = '1'`;
    var data = await exe(sql);
    res.send("<script> alert('update Successfully'); history.back();</script>");    
});

// ---------------------------------------------------------------------------------------------------------------------------------------------


router.get('/testimonials', async function(req, res) {
    var sql = `SELECT * FROM testimonials`;
    var testimonials_list_data = await exe(sql);
    res.render('admin/testimonials.ejs',{"testimonials_list_data":testimonials_list_data});
});

router.post('/save_testimonials',async function(req, res) {
    var d = req.body;
    var testimonials_img = new Date().getTime() + req.files.testimonials_img.name;
    req.files.testimonials_img.mv("public/uploads/"+testimonials_img)
    var sql = `INSERT INTO testimonials(testimonials_details,testimonials_img,testimonials_name,testimonials_position)
    VALUES ('${d.testimonials_details}','${testimonials_img}','${d.testimonials_name}','${d.testimonials_position}')`;
    var data = await exe(sql);
    res.redirect("/admin/testimonials");
});


router.get('/edit_testimonials/:id',async function(req, res) {
    var sql = `SELECT * FROM testimonials WHERE testimonials_id = ${req.params.id}`;
    var testimonials_data = await exe(sql);
    res.render('admin/edit_testimonials.ejs',{"testimonials_data":testimonials_data[0]});
});


router.post('/update_testimonials',async function(req, res) 
{
    if(req.files)
    {
        var d = req.body;
        var testimonials_img = new Date().getTime() + req.files.testimonials_img.name;
        req.files.testimonials_img.mv("public/uploads/"+testimonials_img)
        var sql = `UPDATE testimonials SET testimonials_img = '${testimonials_img}' WHERE testimonials_id = '${d.testimonials_id}'`;
        var data = await exe(sql);
        res.redirect("/admin/testimonials");
    }
    var d = req.body;
    var sql = `UPDATE testimonials SET testimonials_details = '${d.testimonials_details}' , 
    testimonials_name = '${d.testimonials_name}' , testimonials_position = '${d.testimonials_position}' WHERE testimonials_id = '${d.testimonials_id}'`;
    var data = await exe(sql);
    res.redirect("/admin/testimonials");
});


router.get('/delete_testimonials/:id',async function(req, res){
    var sql = `DELETE FROM testimonials WHERE testimonials_id = ${req.params.id}`;
    var data = await exe(sql);
    res.redirect("/admin/testimonials");
});

// ------------------------------------------------------------------------------------------------------------------------------------

router.get('/blog',async function(req, res) {
    var sql = `SELECT * FROM blog`;
    var blog_list = await exe(sql);
    res.render("admin/blog.ejs",{"blog_list":blog_list});
});


router.post('/save_blog',async function(req, res) {
    var d = req.body;
    var blog_img = new Date().getTime() + req.files.blog_img.name;
    req.files.blog_img.mv("public/uploads/"+blog_img)
    var sql = `INSERT INTO blog(blog_details,blog_img,blog_name,blog_date) VALUES 
    ('${d.blog_details}','${blog_img}','${d.blog_name}','${d.blog_date}')`;
    var data = await exe(sql);
    res.redirect("/admin/blog");
});


router.get('/edit_blog/:id',async function(req,res){
    var sql = `SELECT * FROM blog WHERE blog_id =  ${req.params.id}`;
    var blogdata = await exe(sql);
    res.render('admin/edit_blog.ejs',{"blogdata":blogdata[0]});
});


router.post('/update_blog',async function(req, res) {
    if(req.files)
    {
        var d = req.body;
        var blog_img = new Date().getTime() + req.files.blog_img.name;
        req.files.blog_img.mv("public/uploads/"+blog_img)
        var sql = `UPDATE blog SET blog_img = '${blog_img}' WHERE blog_id = '${d.blog_id}'`;
        var data = await exe(sql);
        res.redirect("/admin/blog")
    }
    var d = req.body;
    var sql = `UPDATE blog SET blog_details = '${d.blog_details}' , blog_name = '${d.blog_name}' , 
    blog_date = '${d.blog_date}' WHERE blog_id = '${d.blog_id}'`;
    var data = await exe(sql);
    res.redirect("/admin/blog")
});

router.get('/delete_blog/:id',async function(req, res){
    var sql = `DELETE FROM blog WHERE blog_id = ${req.params.id}`;
    var data = await exe(sql);
    res.redirect("/admin/blog");
});

// ------------------------------------------------------------------------------------------------ --------------------------------

router.get('/team',async function(req, res) {
    var sql = `SELECT * FROM team`;
    var team_list_data = await exe(sql);
    res.render('admin/team.ejs',{"team_list_data":team_list_data});
});

router.post('/save_team',async function(req, res) {
    var team_img = new Date().getTime() + req.files.team_img.name;
    req.files.team_img.mv("public/uploads/"+team_img)
    var d = req.body;
    var sql = `INSERT INTO team (team_name,team_position,team_details,team_img) VALUES ('${d.team_name}','${d.team_position}','${d.team_details}','${team_img}')`;
    var data = await exe(sql);
    res.redirect("/admin/team");
});

router.get('/edit_team/:id',async function(req, res) {
    var sql = `SELECT * FROM team WHERE team_id = ${req.params.id}`;
    var teamdata = await exe(sql);
    res.render("admin/edit_team.ejs",{"teamdata":teamdata[0]});
});

router.post("/update_team",async function(req, res) {
    if(req.files)
    {
        var team_img = new Date().getTime() + req.files.team_img.name;
        req.files.team_img.mv("public/uploads/"+team_img)
        var d =  req.body;
        var sql = `UPDATE team SET team_img = '${team_img}' WHERE team_id = '${d.team_id}'`;
        var data = await exe(sql);
        res.redirect("/admin/team");
    }
    var d =  req.body;
    var sql = `UPDATE team SET team_name = '${d.team_name}' , team_position = '${d.team_position}' ,
    team_details = '${d.team_details}' WHERE team_id = '${d.team_id}'`;
    var data = await exe(sql);
    res.redirect("/admin/team");
});

router.get('/delete_team/:id', async function(req, res) {
    var d = req.body;
    var sql = `DELETE FROM team WHERE team_id = ${req.params.id}`;
    var data = await exe(sql);
    res.redirect("/admin/team");
});

// ------------------------------------------------------------------------------------------------ --------------------------------


router.get('/contect',async function(req, res) {
    var sql = `SELECT * FROM contect`;
    var contectdata = await exe(sql);
    res.render('admin/contect.ejs',{"contectdata":contectdata});
});

router.get('/delete_contect/:id', async function(req, res) {
    var sql = `DELETE FROM contect WHERE contect_id = '${req.params.id}'`;
    var data = await exe(sql);
    res.redirect("/admin/contect")
});


module.exports = router;