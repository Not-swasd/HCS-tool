import { Client } from "discord.js";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import fs from "fs";

/**
 * @param {Client} client
 */
export default async function (client) {
    try {
        console.log('[BOT] Started refreshing application (/) commands.');

        const commands = [];
        const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const command = (await import(`./commands/${file}`)).default;
            commands.push(command.data.toJSON());
            client.commands.set(command.data.name, command);
        };

        const rest = new REST({ version: '9' }).setToken(client.token);
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });

        console.log('[BOT] Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
};