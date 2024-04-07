const mongoose=require("mongoose")
const stepCountSchema = new mongoose.Schema({
    steps: { type: Number, default: 0 },
    lastUpdatedTimestamp: { type: Date, default: Date.now },
    timestamp: { type: Date, default: Date.now }
});
module.exports=mongoose.model("stepCount",stepCountSchema);
