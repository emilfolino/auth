const db = require("../db/database.js");

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
    }
};

module.exports = users;
