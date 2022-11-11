import { Client, Collection, GatewayIntentBits, Partials } from "discord.js";
import path from "path/posix";
import fs from "node:fs";

export interface CommandCollectionClient extends Client {
    commands?: Collection<any, any>;
}

const client: CommandCollectionClient = new Client({
    intents: [GatewayIntentBits.GuildMessages, GatewayIntentBits.Guilds],
    partials: [Partials.Channel, Partials.Message]
});

client.commands = new Collection();

const eventsPath = path.join(__dirname, "events");
const eventFiles = fs
    .readdirSync(eventsPath)
    .filter((file) => file.endsWith(".ts"));
for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const { default: event } = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

(async () => await client.login(process.env.PPBOT_CLIENT_TOKEN))();
console.log("Logged in");
