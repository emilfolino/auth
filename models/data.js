const db = require("../db/database.js");

const data = {
    getAllDataForUser: function (res, req) {
        // req contains user object set in checkToken middleware

        let sql = "SELECT u.email, d.artefact " +
            "FROM users u " +
            "INNER JOIN user_data d " +
            "ON u.ROWID = d.userId AND u.apiKey = d.apiKey " +
            "WHERE u.email = ? AND u.apiKey = ?";

        db.all(
            sql,
            req.user.email,
            req.user.apiKey,
            function (err, rows) {
                if (err) {
                    return res.status(500).json({
                        errors: {
                            status: 500,
                            path: "/data",
                            title: "Database error",
                            message: err.message
                        }
                    });
                }

                return res.json({ data: rows });
            });
    }
};

module.exports = data;
