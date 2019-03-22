const db = require("../db/database.js");

const data = {
    getAllDataForUser: function (res, req) {
        // req contains user object set in checkToken middleware

        let sql = "SELECT d.ROWID as id, u.email, d.artefact " +
            "FROM users u " +
            "INNER JOIN user_data d " +
            "ON u.ROWID = d.userId AND u.apiKey = d.apiKey " +
            "WHERE u.email = ? AND u.apiKey = ?";

        db.all(
            sql,
            req.user.email,
            req.user.api_key,
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
    },

    getData: function(res, dataId, status=200) {
        let sql = "SELECT ROWID as id, artefact FROM user_data " +
            "WHERE ROWID = ?";

        db.get(
            sql,
            dataId,
            function (err, row) {
                if (err) {
                    return res.status(500).json({
                        error: {
                            status: 500,
                            path: "GET /data/:id",
                            title: "Database error",
                            message: err.message
                        }
                    });
                }

                return res.status(status).json({ data: row });
            });
    },

    createData: function(res, req) {
        // req contains user object set in checkToken middleware

        let sql = "SELECT ROWID as id FROM users " +
            "WHERE email = ? and apiKey = ?";

        db.get(
            sql,
            req.user.email,
            req.user.api_key,
            function (err, row) {
                if (err) {
                    return res.status(500).json({
                        error: {
                            status: 500,
                            path: "POST /data SELECT userId",
                            title: "Database error",
                            message: err.message
                        }
                    });
                }

                let sql = "INSERT INTO user_data (artefact, userId, apiKey) " +
                    "VALUES (?, ?, ?)";

                db.run(
                    sql,
                    req.body.artefact,
                    row.id,
                    req.user.api_key,
                    function (err) {
                        if (err) {
                            return res.status(500).json({
                                error: {
                                    status: 500,
                                    path: "POST /data INSERT",
                                    title: "Database error",
                                    message: err.message
                                }
                            });
                        }

                        return data.getData(res, this.lastID, 201);
                    });
            });
    }
};

module.exports = data;
