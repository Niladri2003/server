const EnvironmentalData=require("../model/temperetatureSchema");

exports.temphumidatareciver= async (req,res)=>{
    const { humidity, temperature } = req.body;
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
}