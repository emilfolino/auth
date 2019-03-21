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

    describe('GET /data', () => {

    });
});