const express = require('express');
const router = express.Router();

const users = require("../models/users.js");
const auth = require("../models/auth.js");

router.get('/', (req, res) => users.getAll(res, req.query.api_key));
router.get('/:id', (req, res) => users.getUser(
    res,
    req.query.api_key,
    req.params.id
));

router.put('/',
    (req, res, next) => auth.checkToken(req, res, next),
    (req, res) => users.updateUser(res, req.body),
);

module.exports = router;
