const express = require('express');
const path = require("path");
const app = express()

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
const port = 8080;

app.listen(port,()=>{
    console.log(`listen at port ${port}!`)
})

app.get("/",(req,res)=>{
    res.send("home page");
})