const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const databaseConnect =require("./config/databaseConnect");
const stepCount=require("./model/stepCountSchema");
const EnvironmentalData=require("./model/temperetatureSchema");
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

app.post('/environmentalData', async (req, res) => {
    const {  humidity, temperature } = req.body;
    console.log("Humidity:", humidity);
    console.log("Temperature:", temperature);
    try {
        // Check if steps data is received and handle it accordingly

            if (humidity !== 0) {
                const existingDocument = await EnvironmentalData.findOne();
                if (!existingDocument) {
                    const data = await EnvironmentalData.create({

                        humidity: humidity || 0,
                        temperature: temperature || 0,
                        lastUpdatedTimestamp: Date.now()
                    });
                    console.log("Initial environmental data document created:", data);
                }
                // Update the existing document to increment the step count
                const updatedData = await EnvironmentalData.updateOne({}, {

                    $set: { humidity: humidity || 0, temperature: temperature || 0, lastUpdatedTimestamp: Date.now() }
                });
                console.log(' environmental data updated in the database. New steps:', updatedData.steps);
                return res.status(200).json({
                    success: true,
                    message: "Step count and environmental data updated successfully"
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: "Steps data is missing"
                });
            }

    } catch (error) {
        console.error('Error updating step count and environmental data:', error);
        res.status(500).json({ error: 'Error updating step count and environmental data' });
    }
});

app.post('/humidity', async (req, res) => {
    const { humidity, temperature } = req.body;
    console.log("Humidity:", humidity);
    console.log("Temperature:", temperature);
    try {
        // Create a new document for each data point received
        const data = await EnvironmentalData.create({
            humidity: humidity || 0,
            temperature: temperature || 0,
            lastUpdatedTimestamp: Date.now()
        });
        console.log("Environmental data document created:", data);

        return res.status(200).json({
            success: true,
            message: "Environmental data stored successfully"
        });
    } catch (error) {
        console.error('Error storing environmental data:', error);
        res.status(500).json({ error: 'Error storing environmental data' });
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

app.get('/tempdata',async (req,res)=>{
    try {
        const data = await EnvironmentalData.find().sort({ timestamp: -1 }).limit(10); // Fetch latest 10 records
        res.status(200).json(data);
    }catch (error){
        console.error('Error fetching temp data:', err);
        res.status(500).send({ error: 'Error fetching temp data.' });
    }
})


const { ObjectId } = require('mongodb');

app.get('/data', async (req, res) => {
    try {
        const interval = req.query.interval || 'hour'; // Default interval is 'hour'
        const endDate = new Date(); // Current date and time
        let startDate;

        // Calculate start date based on interval
        switch (interval) {
            case 'hour':
                startDate = new Date(endDate.getTime() - 3600000); // One hour ago
                break;
            case '6hours':
                startDate = new Date(endDate.getTime() - (3600000 * 6)); // Six hours ago
                break;
            case 'day':
                startDate = new Date(endDate.getTime() - (3600000 * 24)); // One day ago
                break;
            case 'week':
                startDate = new Date(endDate.getTime() - (3600000 * 24 * 7)); // One week ago
                break;
            default:
                startDate = new Date(endDate.getTime() - 3600000); // Default to one hour ago
        }

        // Ensure start date is not earlier than available data
        const earliestDataDate = await EnvironmentalData.findOne().sort({ timestamp: 1 }).select('timestamp');
        if (earliestDataDate && startDate < earliestDataDate.timestamp) {
            startDate = earliestDataDate.timestamp;
        }

        // Perform aggregation to group data based on time intervals
        const data = await EnvironmentalData.aggregate([
            {
                $match: {
                    timestamp: { $gte: startDate, $lte: endDate } // Filter records within the specified time range
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: `%Y-%m-%d %H:00:00`, date: '$timestamp' } }, // Group by hour
                    humidity: { $avg: '$humidity' }, // Calculate average humidity for each hour
                    temperature: { $avg: '$temperature' } // Calculate average temperature for each hour
                }
            },
            { $sort: { _id: 1 } } // Sort by timestamp
        ]);

        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching temp data:', error);
        res.status(500).send({ error: 'Error fetching temp data.' });
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