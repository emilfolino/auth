const express = require('express');
const router = express.Router();

const data = require("../models/data.js");
const auth = require("../models/auth.js");

router.get('/',
    (req, res, next) => auth.checkToken(req, res, next),
    (req, res) => data.getAllDataForUser(res, req)
);

module.exports = router;