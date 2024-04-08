const mongoose = require("mongoose");

const environmentalDataSchema = new mongoose.Schema({
    humidity: { type: Number, default: 0 },
    temperature: { type: Number, default: 0 },
    lastUpdatedTimestamp: { type: Date, default: Date.now },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("EnvironmentalData", environmentalDataSchema);
