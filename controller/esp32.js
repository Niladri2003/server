const TempAndHumidty=require("../model/temperetatureSchema");
require('dotenv').config();

const twilio=require('twilio')


const accountSid = process.env.YOUR_TWILIO_ACCOUNT_SID;
const authToken = process.env.YOUR_TWILIO_AUTH_TOKEN;
console.log('Account SID:', accountSid);
console.log('Auth Token:', authToken);
const client = twilio(accountSid, authToken);

exports.temphumidatareciver= async (req,res)=>{
    const { humidity, temperature } = req.body;
    try {
        // Create a new document for each data point received
        const data = await TempAndHumidty.create({
            humidity: humidity || 0,
            temperature: temperature || 0,
            lastUpdatedTimestamp: Date.now()
        });
        // if(temperature > 40){
        //     client.messages
        //         .create({
        //             body: `Temperature increased from ${temperature}!`,
        //             from: '+13203136922',
        //             to: '+919874122331'
        //         })
        //         .then(message => {
        //             console.log('Message sent:', message.sid);
        //
        //         })
        //         .catch(error => {
        //             console.error('Error sending message:', error);
        //
        //         });
        // }
        console.log("Environmental data document created:", data);

        return res.status(200).json({
            success: true,
            message: "Environmental data stored successfully"
        });
    } catch (error) {
        console.error('Error storing environmental data:', error);
        res.status(500).json({ error: 'Error storing environmental data' });
    }
}