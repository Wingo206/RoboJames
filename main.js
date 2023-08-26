// Require the necessary discord.js classes
const { REST, Routes, Client, Events, GatewayIntentBits, Collection } = require("discord.js");
const { clientId, guildIds, token } = require("./keys.json");
const fs = require("node:fs");
const path = require("node:path");

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Create command collections
client.commands = new Collection();
const commandsJSON = [];

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ("data" in command && "execute" in command) {
        client.commands.set(command.data.name, command);    
        commandsJSON.push(command.data.toJSON());
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// and deploy your commands!
(async () => {
    try {
        console.log(`Started refreshing ${commandsJSON.length} application (/) commands.`);

        // The put method is used to fully refresh all commandsJSON in the guild with the current set
        for (let i = 0; i < guildIds.length; i++) {
            let guildId = guildIds[i];
            console.log(guildId);
            const data = await rest.put(
                Routes.applicationGuildCommands(clientId, guildId),
                { body: commandsJSON },
            );

            console.log(`Successfully reloaded ${data.length} application (/) commands.`);
        }
    } catch (error) {
        // And of course, make sure you catch and log any errors!
        console.error(error);
    }
})();

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
    let interval = setInterval(() => {
        let testChannel = client.channels.cache.get("1037611661802086430");
        testChannel.send("booga");
    }, 5000);
});

// Log in to Discord with your client's token
client.login(token);

client.on(Events.InteractionCreate, async interaction => {
    const command = interaction.client.commands.get(interaction.commandName);

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({content: "Brog!", ephemeral: true});
    }
});
