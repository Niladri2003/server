const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const databaseConnect =require("./config/databaseConnect");
const TempAndHumidty=require("./model/temperetatureSchema");
const cors = require("cors");



require("dotenv").config();
const PORT = process.env.PORT || 3000;

// import controllers
const esp32routes=require("./router/esp32");

// Use bodyParser middleware to parse incoming requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({
    origin: "*",
    credentials: true
}))

databaseConnect.connect();



// Endpoint to receive temperature and humidity from ESP32 device
app.post('/humidity', async (req, res) => {
    const { humidity, temperature } = req.body;
    console.log("Humidity:", humidity);
    console.log("Temperature:", temperature);
    try {
        // Create a new document for each data point received
        const data = await TempAndHumidty.create({
            humidity: humidity || 0,
            temperature: temperature || 0,
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
app.use("/api/v1/esp32",esp32routes);

// endpoint for frontend to send latest 10 records from db
app.get('/tempdata',async (req,res)=>{
    try {
        const data = await TempAndHumidty.find({}).sort({ timestamp: -1 }).limit(10); // Fetch latest 10 records
        res.status(200).json(data);
    }catch (error){
        console.error('Error fetching temp data:', error);
        res.status(500).send({ error: 'Error fetching temp data.' });
    }
})

// Mongodb Aggregation to calculate the average temperature and humidity and send to frontend
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
        const earliestDataDate = await TempAndHumidty.findOne().sort({ timestamp: 1 }).select('timestamp');
        if (earliestDataDate && startDate < earliestDataDate.timestamp) {
            startDate = earliestDataDate.timestamp;
        }

        // Perform aggregation to group data based on time intervals
        const data = await TempAndHumidty.aggregate([
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
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


app.get("/",(req, res) => {
    res.status(200).send({
        success:true,
        message:"Successfully running server",
    })
})