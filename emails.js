const Imap = require("imap");
const {simpleParser} = require("mailparser");
const {email, emailPassword} = require("./config.json");

const imapConfig = {
    user: email,
    password: emailPassword,
    host: "imap.gmail.com",
    port: 993,
    tls: true,
    tlsOptions: {rejectUnauthorized: false},
};

const getEmails = () => {
    return new Promise((resolve, reject) => {
        try {
            let emailResults = [];
            const imap = new Imap(imapConfig);
            imap.once("ready", () => {
                imap.openBox("INBOX", (err, results) => {
                    imap.search(["UNSEEN", ["SINCE", new Date(2023, 2, 01)]], (err, results) => {
                        if (results.length == 0) {
                            console.log("no new emails!");
                            imap.end();
                            return;
                        }
                        const f = imap.fetch(results, {bodies: ""});
                        let index = 0;
                        f.on("message", msg => {
                            let localIndex = index;
                            index++;
                            emailResults[localIndex] = {};
                            msg.on("body", stream => {
                                simpleParser(stream, async (err, parsed) => {
                                    emailResults[localIndex].email = parsed;
                                });
                            });
                            msg.once("attributes", attrs => {
                                emailResults[localIndex].attributes = attrs;
                                const {uid} = attrs;
                                imap.addFlags(uid, ["\\Seen"], () => {
                                    console.log("Marked as read!");
                                });
                            });
                        });
                        f.once("error", e => {
                            return Promise.reject(e);
                        });
                        f.once("end", () => {
                            console.log("Done fetching all messages!");
                            imap.end();
                        });
                    });
                });
            });
            imap.once("error", e => {
                console.error(e);
            });
            imap.once("end", () => {
                resolve(emailResults);
                console.log("Connection ended");
            });
            imap.connect();
        } catch (e) {
            console.error(e);
            reject(e);
        }
    });
};

module.exports = {
    getEmails
};
