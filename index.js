const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const databaseConnect =require("./config/databaseConnect");
const stepCount=require("./model/stepCountSchema");
const cors = require("cors");
require("dotenv").config();

// Use bodyParser middleware to parse incoming requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
databaseConnect.connect();
// Endpoint to receive alerts from ESP32 device
app.post('/stepCount',async (req, res) =>{
    const { steps } = req.body;
    console.log("steps",steps);
    try{
       if(steps==1){
           const existingDocument = await stepCount.findOne();
           if (!existingDocument) {
               const data= await stepCount.create({steps:0, lastUpdatedTimestamp: Date.now() });
               console.log("Initial step count document created",data);
           }
            //Update the existing document to increment the step count
           const data=  await stepCount.updateOne({}, { $inc: { steps },lastUpdatedTimestamp: Date.now()  });
           console.log('Step count data updated in the database. New steps:', data);

           return res.status(200).json({
               sucess:true,
               message:"Step Count updated to db succesfully",
           })
       }else{

       }
    }catch (error){
        console.error('Error updating step count data:', err);
        res.status(500).send({ error: 'Error updating step count data.' });
    }

});


//endpoint to fetch the current step count from the database
app.get('/stepsdata', async (req, res) => {
    try {
        const data = await stepCount.findOne(); // Fetch the single document
        res.status(200).json({
            sucess:true,
            data,
            message:"Step count data found",
        })
    } catch (err) {
        console.error('Error fetching step count data:', err);
        res.status(500).send({ error: 'Error fetching step count data.' });
    }
});
// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
app.get("/",(req, res) => {
    res.status(200).send({
        sucess:true,
        message:"Succesfully running server",
    })
})