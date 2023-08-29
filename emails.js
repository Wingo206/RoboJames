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
                    imap.search(["UNSEEN", ["SINCE", new Date(2023, 7, 01)]], (err, results) => {
                        if (results.length == 0) {
                            console.log("no new emails!");
                            imap.end();
                            return;
                        }
                        const f = imap.fetch(results, {bodies: ""});
                        f.on("message", msg => {
                            msg.on("body", stream => {
                                simpleParser(stream, async (err, parsed) => {
                                    // console.log(parsed);
                                    emailResults.push(
                                        {
                                            "from": parsed.from.text, 
                                            "subject": parsed.subject,
                                            "text": parsed.text,
                                            "date": parsed.date,
                                        }
                                    );
                                    // emailResults.push(parsed);
                                

                                });
                            });
                            msg.once("attributes", attrs => {
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
// getEmails().then((results) => {
//     console.log("results");
//     console.log(results[0]);
// }, (err) => {
//     console.log(err);
// });

