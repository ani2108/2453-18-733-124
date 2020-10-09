const express = require("express")
const app = express();

let server =require('./server');
let middleware = require('./middleware');

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

const MongoClient = require("mongodb").MongoClient;

const url = "mongodb://localhost:27017/";
const dbName = 'Ventilators';
let db

MongoClient.connect(url,{ useUnifiedTopology: true },(err,client)=>{
    if(err) return console.log(err);
    db = client.db(dbName);
    console.log(`Connected MongoDB: ${url}`)
    console.log(`Database: ${dbName}`);
})

const newLocal = '/HospitalDetails';
app.get(newLocal, middleware.checkToken,function(req,res){
    console.log("connecting to Hospital Collection");
    
    var data = db.collection('Hospital').find({}).toArray().then(result => res.json(result)); 
});

app.get("/VentilatorDetails",middleware.checkToken,(req,res) => {
    console.log("connecting to Ventilator Collection");
    var data = db.collection("Ventilators").find().toArray().then(result => res.json(result));
});
app.post("/searchVbystatus",middleware.checkToken,(req,res) => {
    var status = req.body.status;
    console.log(status);
    var Vent = db.collection('Ventilators').find({'status': status}).toArray().then(result => res.json(result));
    console.log(Vent)
});    
app.post("/searchVbyhosname",middleware.checkToken,(req,res) => {
    var name = req.query.name;
    console.log(name);
    var Vent = db.collection('Ventilators').find({'name':new RegExp(name, 'i')}).toArray().then(result => res.json(result));

});
app.post("/searchhospital",middleware.checkToken,(req,res) => {
    var name = req.query.name;
    console.log(name);
    var Hos = db.collection('Hospital').find({'name':new RegExp(name, 'i')}).toArray().then(result => res.json(result));

});
app.put("/updateV",middleware.checkToken,(req,res) => {
    var ventid = { ventilatorld: req.body.ventilatorld };
    console.log(ventid);
    var newvalues={ $set: { status: req.body.status } };
    db.collection('Ventilators').updateOne(ventid , newvalues, function(err, result){
        res.json("1 document udated");
        if(err) throw err;
    });

});
app.post("/addVbyuser",middleware.checkToken,(req,res) => {
    var hid = req.query.hid;
    var ventid = req.query.ventid;
    var status = req.query.status;
    var name=req.query.name;
    var item=
    {
        hld:hid, ventid:ventid , status:status, name: name
    };
    db.collection('Ventilators').insertOne(item, function (err, result){
        res.json('Item inserted');
    });

});
app.delete("/deleteV",middleware.checkToken,(req,res) => {
    var myquery = req.query.ventilatorld;
    console.log(myquery);

    var myquery1={ ventilatorld: myquery };
    db.collection('Ventilators').deleteOne(myquery1, function(err,obj){
        if(err) throw err;
        res.json("! document deleeted");
    });

});
app.listen(3000);