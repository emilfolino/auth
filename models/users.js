const db = require("../db/database.js");
const bcrypt = require('bcryptjs');

const users = {
    getAll: function (res, apiKey) {
        let sql = "SELECT ROWID as user_id, email FROM users WHERE apiKey = ?";

        db.all(
            sql,
            apiKey,
            function (err, rows) {
                if (err) {
                    return res.status(500).json({
                        error: {
                            status: 500,
                            path: "/users",
                            title: "Database error",
                            message: err.message
                        }
                    });
                }

                return res.status(200).json({
                    data: rows
                });
            }
        );
    },

    getUser: function (res, apiKey, userId) {
        let sql = "SELECT ROWID as user_id, email " +
            "FROM users WHERE apiKey = ? AND ROWID = ?";

        db.get(
            sql,
            apiKey,
            userId,
            function (err, row) {
                if (err) {
                    return res.status(500).json({
                        error: {
                            status: 500,
                            path: "/users/:id",
                            title: "Database error",
                            message: err.message
                        }
                    });
                }

                return res.status(200).json({
                    data: row
                });
            }
        );
    },

    updateUser: function updateUser(res, body) {
        if (body.password && body.email && body.api_key) {
            bcrypt.hash(body.password, 10, function(err, hash) {
                if (err) {
                    return res.status(500).json({
                        errors: {
                            status: 500,
                            source: "/register",
                            title: "bcrypt error",
                            detail: "bcrypt error"
                        }
                    });
                }

                let sql = "UPDATE users SET password = ? WHERE apiKey = ? AND email = ?";

                db.run(sql,
                    hash,
                    body.api_key,
                    body.email,
                    function(err) {
                        if (err) {
                            return res.status(500).json({
                                errors: {
                                    status: 500,
                                    path: "PUT /users",
                                    title: "Database error",
                                    message: err.message
                                }
                            });
                        }

                        return res.status(204).send();
                    }
                );
            });
        } else {
            return res.status(401).json({
                errors: {
                    status: 401,
                    path: "PUT /users",
                    title: "Data missing",
                    message: "Password, email or api_key missing",
                }
            });
        }
    },
};

module.exports = users;
