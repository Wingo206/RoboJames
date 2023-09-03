const {EmbedBuilder} = require("discord.js");

function createEmbedFromEmail(parsed) {
    let embed = new EmbedBuilder()
        .setColor(0xffef63)
        .setTitle(parsed.subject)
        .setDescription(parsed.from.text)
        .addFields(
            {name: "Date", value: "<t:" + parsed.date.getTime()/1000 + ">"},
            {name:"Contents", value: parsed.text}
        );
    if (parsed.attachments.length > 0) {
        let attachmentFilenameList = "";
        for (let i = 0; i < parsed.attachments.length; i++) {
            let attachment = parsed.attachments[i];
            attachmentFilenameList += "\n" + attachment.filename;
        }
        
        embed.addFields({name: "Attachments (" + parsed.attachments.length + ")", value: attachmentFilenameList});
    }
    return embed;
}

function sendEmailMessage(channel, data) {
    //check if important
    let important = false;
    if (data.attributes["x-gm-labels"].includes("\\Important")) {
        important = true;
    }

    //send important ping
    if (important) {
        // eboard role id
        channel.send("<@&751632136087404605> Email marked as important found!");
    }
    //send message with embed
    channel.send({embeds: [createEmbedFromEmail(data.email)]});
}

module.exports = {
    sendEmailMessage
};
