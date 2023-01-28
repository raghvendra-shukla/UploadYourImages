const express= require("express");
const multer=require("multer");
const path =require("path");
const cors=require("cors");
const fs = require('fs');

const connectToMongo=require("./db");
connectToMongo();// calling db to connect

const Image=require("./Imageschema");

const app=express();
const port=8000;

app.set("view engine","ejs");
app.use(cors());
app.use(express.static(__dirname + '/public'));
app.use('/public', express.static(__dirname + '/public'));

const upload=multer({
    storage:multer.diskStorage({
        // cb is for callback you also write any other thing
        destination:(req,file,cb)=>{
            //uploads is the folder name
            cb(null,"uploads");
        },
        filename:(req,file,cb)=>{
            // jpg is for image you use any extension
            // cb(null,file.fieldname+"-"+Date.now()+".jpg");
            cb(null,file.fieldname + '-' + Date.now());
        }
    })
}).single("testImage");

// creating a route for uploading 
app.post("/",(req,res)=>{
    // res.send("Uploaded Successfully");
    upload(req,res,(err)=>{
        if(err){
            console.log(err);
        }
        else{
            const newImage=new Image({
                name:req.body.name,
                image:{
                    // data:req.file.filename,
                    data:fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
                    contentType:"image/jpg"
                },
            });
            Image.create(newImage, (err, item) => {
                if (err) {
                    console.log(err);
                }
                else {
                    // item.save();
                    res.redirect('/');
                }
            });
            // create an object alod save the image to the database
            // newImage.save()
            // .then(()=>res.send("uploaded succesfully"))
            // .catch(err=>console.log());
        }
    });
})

app.get("/",(req,res)=>{
    // res.render("index");
    Image.find({}, (err, items) => {
        if (err) {
            console.log(err);
            res.status(500).send('An error occurred', err);
        }
        else {
            res.render('index', { items: items });
        }
    });
})

app.listen(port);

