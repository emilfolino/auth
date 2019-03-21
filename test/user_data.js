/* global it describe before */

process.env.NODE_ENV = 'test';

//Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
const HTMLParser = require('node-html-parser');

const server = require('../app.js');

chai.should();

const db = require("../db/database.js");

chai.use(chaiHttp);

let apiKey = "";
let token = "";

describe('user_data', () => {
    before(() => {
        return new Promise((resolve) => {
            db.run("DELETE FROM apikeys", (err) => {
                if (err) {
                    console.error("Could not empty test DB table orders", err.message);
                }

                db.run("DELETE FROM user_data", (err) => {
                    if (err) {
                        console.error("Could not empty test DB table orders", err.message);
                    }

                    db.run("DELETE FROM users", (err) => {
                        if (err) {
                            console.error("Could not empty test DB table orders", err.message);
                        }

                        resolve();
                    });
                });
            });
        });
    });

    describe('GET /api_key', () => {
        it('200 HAPPY PATH getting form', (done) => {
            chai.request(server)
                .get("/api_key")
                .end((err, res) => {
                    res.should.have.status(200);

                    done();
                });
        });

        it('should get 200 as we get apiKey', (done) => {
            let user = {
                email: "test@auth.com",
                gdpr: "gdpr"
            };

            chai.request(server)
                .post("/api_key/confirmation")
                .send(user)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.text.should.be.a("string");

                    let HTMLResponse = HTMLParser.parse(res.text);
                    let apiKeyElement = HTMLResponse.querySelector('#apikey');

                    apiKeyElement.should.be.an("object");

                    apiKey = apiKeyElement.childNodes[0].rawText;

                    apiKey.length.should.equal(32);

                    done();
                });
        });

        it('should get 200 but no apikey element not a valid email', (done) => {
            let user = {
                email: "test",
                gdpr: "gdpr"
            };

            chai.request(server)
                .post("/api_key/confirmation")
                .send(user)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.text.should.be.a("string");

                    let HTMLResponse = HTMLParser.parse(res.text);
                    let apiKeyElement = HTMLResponse.querySelector('#apikey');

                    (apiKeyElement === null).should.be.true;

                    let messageElement = HTMLResponse.querySelector('#error');

                    messageElement.should.be.an("object");

                    let message = messageElement.childNodes[0].rawText;

                    message.should.equal("A valid email address is required to obtain an API key.");

                    done();
                });
        });

        it('should get 200 but no apikey element no gdpr', (done) => {
            let user = {
                email: "test@auth.com"
            };

            chai.request(server)
                .post("/api_key/confirmation")
                .send(user)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.text.should.be.a("string");

                    let HTMLResponse = HTMLParser.parse(res.text);
                    let apiKeyElement = HTMLResponse.querySelector('#apikey');

                    (apiKeyElement === null).should.be.true;

                    let messageElement = HTMLResponse.querySelector('#error');

                    messageElement.should.be.an("object");

                    let message = messageElement.childNodes[0].rawText;

                    message.should.equal("Approve the terms and conditions.");

                    done();
                });
        });

        it('should get 200 but no apikey element not correct gdpr', (done) => {
            let user = {
                email: "test@auth.com",
                gdpr: "gdprgdpr"
            };

            chai.request(server)
                .post("/api_key/confirmation")
                .send(user)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.text.should.be.a("string");

                    let HTMLResponse = HTMLParser.parse(res.text);
                    let apiKeyElement = HTMLResponse.querySelector('#apikey');

                    (apiKeyElement === null).should.be.true;

                    let messageElement = HTMLResponse.querySelector('#error');

                    messageElement.should.be.an("object");

                    let message = messageElement.childNodes[0].rawText;

                    message.should.equal("Approve the terms and conditions.");

                    done();
                });
        });
    });

    describe('GET /users', () => {
        it('should get 401 as we do not provide valid api_key', (done) => {
            chai.request(server)
                .get("/users")
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.an("object");
                    res.body.errors.status.should.be.equal(401);

                    done();
                });
        });

        it('200 getting users for api key', (done) => {
            chai.request(server)
                .get("/users?api_key=" + apiKey)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property("data");
                    res.body.data.should.be.an("array");
                    res.body.data.length.should.equal(0);

                    done();
                });
        });

        it('should get 201 registering user for apiKey', (done) => {
            let user = {
                email: "test@example.com",
                password: "123test",
                api_key: apiKey
            };

            chai.request(server)
                .post("/register")
                .send(user)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.an("object");
                    res.body.should.have.property("data");
                    res.body.data.should.have.property("message");
                    res.body.data.message.should.equal("User successfully registered.");

                    done();
                });
        });

        it('200 getting users for api key, 1 user', (done) => {
            chai.request(server)
                .get("/users?api_key=" + apiKey)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property("data");
                    res.body.data.should.be.an("array");
                    res.body.data.length.should.equal(1);

                    done();
                });
        });

        it('200 getting user by id 1', (done) => {
            chai.request(server)
                .get("/users/1?api_key=" + apiKey)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property("data");
                    res.body.data.should.be.an("object");
                    res.body.data.should.have.property("email");
                    res.body.data.email.should.equal("test@example.com");

                    done();
                });
        });
    });

    describe('GET /data', () => {
        it('should get 401 as we do not provide valid api_key', (done) => {
            chai.request(server)
                .get("/data")
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.an("object");
                    res.body.errors.status.should.be.equal(401);

                    done();
                });
        });

        it('should get 401 as we do not provide valid token', (done) => {
            chai.request(server)
                .get("/data?api_key=" + apiKey)
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.an("object");
                    res.body.errors.status.should.be.equal(401);

                    done();
                });
        });

        it('should get 200 login user', (done) => {
            let user = {
                email: "test@example.com",
                password: "123test",
                api_key: apiKey
            };

            chai.request(server)
                .post("/login")
                .send(user)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.should.have.property("data");
                    res.body.data.should.have.property("message");
                    res.body.data.message.should.equal("User logged in");

                    res.body.data.should.have.property("user");
                    res.body.data.user.should.have.property("email");
                    res.body.data.user.email.should.equal("test@example.com");

                    res.body.data.should.have.property("token");
                    token = res.body.data.token;

                    done();
                });
        });

        it('should get 200 as we do provide token', (done) => {
            chai.request(server)
                .get("/data?api_key=" + apiKey)
                .set("x-access-token", token)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.data.should.be.an("array");
                    res.body.data.length.should.equal(0);

                    done();
                });
        });
    });
});
