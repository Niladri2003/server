const mongoose = require("mongoose");

const environmentalDataSchema = new mongoose.Schema({
    humidity: { type: Number, default: 0 },
    temperature: { type: Number, default: 0 },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("TempAndHumidty", environmentalDataSchema);
