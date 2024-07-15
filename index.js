import express from "express";
import bodyParser from "body-parser";
import nodemailer from "nodemailer";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import dotenv from 'dotenv';
dotenv.config();
import products from "./data/Products.json" assert { type: 'json' };


const app=express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(express.static("public"));
const __dirname=path.dirname(fileURLToPath(import.meta.url));

const port=3000;

app.get('/',(req,res)=>
{
    res.render('Home.ejs',{product:products});
});

app.get('/home/view/:id', (req, res) => {
    const productId = parseInt(req.params.id, 10); // Extract productId from request parameter
    const product = products.find(p => p.id === productId); // Find product in your data

    if (!product) {
        return res.status(404).send('Product not found'); // Handle case where product is not found
    }

    res.render('product.ejs', { product:product }); // Render product.ejs with the found product
});



app.get('/about',(req,res)=>
{
    res.render('AboutUs.ejs');
});

app.get('/contact',(req,res)=>
{
    res.render('ContactUs.ejs');
});

app.get('/products',(req,res)=>
{
    res.render('Products.ejs');
});


app.get('/products/view/:id',(req,res)=>
{
    const productId=parseInt(req.params.id,10);
    const product = products.find(p => p.id === productId);
    res.render('product.ejs',{product:product});
});


// Brevo SMTP transporter setup
const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false, 
    auth: {
        user: process.env.SMTP_USER, 
        pass: process.env.SMTP_PASS 
    }
});

// Route to handle form submission
app.post('/products/quote/:id', async (req, res) => {
    const productId = parseInt(req.params.id);

    const product = products.find(p => p.id === productId);

    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }

    const { name, email, mobile, quantity, comments, quantityType } = req.body;
    console.log("Form Data Received:");
    console.log("Product ID:", productId);
    console.log("Name:", name);
    console.log("Email:", email);
    console.log("Mobile:", mobile);
    console.log("Quantity:", quantity," ",quantityType);
    console.log("Comments:", comments);

    const mailOptions = {
        from: 'priyankadhinakar@gmail.com', 
        to: 'swathienterpriseschennai@gmail.com', 
        subject: `Quote Request for ${product.name}`,
        text: `Name: ${name}\nEmail: ${email}\nMobile: ${mobile}\nQuantity: ${quantity} ${quantityType}\nComments: ${comments}\nProduct ID: ${productId}`
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        res.redirect(`/products/view/${productId}`);
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to send email' });
    }
});

app.post('/contact/submit', async (req, res) => {
    const { name, number, email, comments } = req.body;

    const mailOptions = {
        from: email, 
        to: 'swathienterpriseschennai@gmail.com', 
        subject: `${email} wants to contact you.`,
        text: `Name: ${name}\nNumber:${number} \nEmail: ${email} \nComment:${comments}`
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        res.redirect('/contact');
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to send email' });
    }
});


app.listen(port,()=>
{
    console.log(`Server is listening to the port ${port}`);
});
