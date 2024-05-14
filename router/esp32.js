const express = require("express")
const router = express.Router()
const {temphumidatareciver} = require("../controller/esp32");

router.post("/reciver", temphumidatareciver);

module.exports = router