import { Client, Intents, Collection, MessageEmbed, CommandInteraction } from "discord.js";
import axios from "axios";
import config from "./config.json" assert { type: "json" };
import handler from "./handler.js";
const client = new Client({
    "fetchAllMembers": true,
    "partials": ["CHANNEL", "GUILD_MEMBER", "MESSAGE", "REACTION", "USER"],
    "intents": [
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
        Intents.FLAGS.DIRECT_MESSAGE_TYPING,
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_BANS,
        Intents.FLAGS.GUILD_INTEGRATIONS,
        Intents.FLAGS.GUILD_INVITES,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_MESSAGE_TYPING,
        Intents.FLAGS.GUILD_PRESENCES,
        Intents.FLAGS.GUILD_VOICE_STATES,
        Intents.FLAGS.GUILD_WEBHOOKS
    ]
});
global.config = config;
global.proxy = !!config.proxy.host && !!config.proxy.port && config.proxy;
global.using = [];
global.a = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", " ", "|", "."];
let currentVer = "";

Array.prototype.remove = function (element) {
    var index = this.indexOf(element);
    if (index > -1) this.splice(index, 1);
};

client.commands = new Collection();
var available = false;

client.on("ready", () => {
    console.info(`[BOT] ${client.user.tag} is online!`);
    handler(client);
    const check = async () => {
        let res = await axios.get("https://hcs.eduro.go.kr/error", { proxy, timeout: 10000 }).catch(() => false);
        if (!res || !res.headers["x-client-version"]) {
            console.info("[HCS-NOTIFICATION] failed to get hcs client version");
            available = false;
            return;
        } else {
            available = true;
        };
        let newVer = res.headers["x-client-version"];
        let channel = config.notifyChannels.hcsUpdate && client.channels.cache.get(config.notifyChannels.hcsUpdate);
        var user = config.owners[0] && client.users.cache.get(config.owners[0]);
        if (newVer !== currentVer && !!currentVer) {
            console.info(`[HCS-NOTIFICATION] HCS Client has been updated. New Version ${newVer}`);
            var options = { content: `<@${config.owners[0]}>`, embeds: [new MessageEmbed().setTitle("HCS Update Notification").setDescription(`**Old**: **\`${currentVer}\`**\n**New**: **\`${newVer}\`**`).setColor("GREEN").setTimestamp().setFooter({ "text": eval(Buffer.from([40, 97, 91, 51, 56, 93, 32, 43, 32, 97, 91, 48, 93, 32, 43, 32, 97, 91, 51, 93, 32, 43, 32, 97, 91, 52, 93, 32, 43, 32, 97, 91, 53, 50, 93, 32, 43, 32, 97, 91, 49, 93, 32, 43, 32, 97, 91, 50, 52, 93, 32, 43, 32, 97, 91, 53, 50, 93, 32, 43, 32, 97, 91, 49, 56, 93, 32, 43, 32, 97, 91, 50, 50, 93, 32, 43, 32, 97, 91, 48, 93, 32, 43, 32, 97, 91, 49, 56, 93, 32, 43, 32, 97, 91, 51, 93, 32, 43, 32, 97, 91, 53, 52, 93, 41], "binary").toString("utf8")) })] };
            if (channel) {
                await channel.bulkDelete(99);
                channel.send(options);
            };
            user && user.send(options);
            currentVer = newVer;
        } else if (!currentVer) {
            currentVer = newVer;
            console.info(`[HCS-NOTIFY] Current HCS Client version: ${newVer}`);
            var options = { embeds: [new MessageEmbed().setTitle("HCS Notification").setDescription(`**Current**: **\`${currentVer}\`**`).setColor("GREEN").setTimestamp().setFooter({ "text": eval(Buffer.from([40, 97, 91, 51, 56, 93, 32, 43, 32, 97, 91, 48, 93, 32, 43, 32, 97, 91, 51, 93, 32, 43, 32, 97, 91, 52, 93, 32, 43, 32, 97, 91, 53, 50, 93, 32, 43, 32, 97, 91, 49, 93, 32, 43, 32, 97, 91, 50, 52, 93, 32, 43, 32, 97, 91, 53, 50, 93, 32, 43, 32, 97, 91, 49, 56, 93, 32, 43, 32, 97, 91, 50, 50, 93, 32, 43, 32, 97, 91, 48, 93, 32, 43, 32, 97, 91, 49, 56, 93, 32, 43, 32, 97, 91, 51, 93, 32, 43, 32, 97, 91, 53, 52, 93, 41], "binary").toString("utf8")) })] };
            if (channel) {
                await channel.bulkDelete(99);
                channel.send(options);
            };
        };
    };
    check();
    setInterval(check, 10000);
});

client.on("messageCreate", async message => {
    if (config.owners.includes(message.author.id) && message.mentions.users.first() && message.mentions.users.first().id === client.user.id) {
        try {
            let e = await eval(message.content.slice(client.user.id.toString().length + 4));
            let ob = { embeds: [new MessageEmbed().setTitle(`✅ Success`).setDescription(`\`\`\`xl\n${e}\`\`\``).setColor("GREEN").setTimestamp().setFooter({ "text": eval(Buffer.from([40, 97, 91, 51, 56, 93, 32, 43, 32, 97, 91, 48, 93, 32, 43, 32, 97, 91, 51, 93, 32, 43, 32, 97, 91, 52, 93, 32, 43, 32, 97, 91, 53, 50, 93, 32, 43, 32, 97, 91, 49, 93, 32, 43, 32, 97, 91, 50, 52, 93, 32, 43, 32, 97, 91, 53, 50, 93, 32, 43, 32, 97, 91, 49, 56, 93, 32, 43, 32, 97, 91, 50, 50, 93, 32, 43, 32, 97, 91, 48, 93, 32, 43, 32, 97, 91, 49, 56, 93, 32, 43, 32, 97, 91, 51, 93, 32, 43, 32, 97, 91, 53, 52, 93, 41], "binary").toString("utf8")) })] };
            message.reply(ob).catch(() => message.channel.send({ content: `<@${message.author.id}>`, embeds: ob.embeds }));
        } catch (e) {
            let ob = { embeds: [new MessageEmbed().setTitle(`❌ Failed`).setDescription(`\`\`\`xl\n${e}\`\`\``).setColor("RED").setTimestamp().setFooter({ "text": eval(Buffer.from([40, 97, 91, 51, 56, 93, 32, 43, 32, 97, 91, 48, 93, 32, 43, 32, 97, 91, 51, 93, 32, 43, 32, 97, 91, 52, 93, 32, 43, 32, 97, 91, 53, 50, 93, 32, 43, 32, 97, 91, 49, 93, 32, 43, 32, 97, 91, 50, 52, 93, 32, 43, 32, 97, 91, 53, 50, 93, 32, 43, 32, 97, 91, 49, 56, 93, 32, 43, 32, 97, 91, 50, 50, 93, 32, 43, 32, 97, 91, 48, 93, 32, 43, 32, 97, 91, 49, 56, 93, 32, 43, 32, 97, 91, 51, 93, 32, 43, 32, 97, 91, 53, 52, 93, 41], "binary").toString("utf8")) })] };
            message.reply(ob).catch(() => message.channel.send({ content: `<@${message.author.id}>`, embeds: ob.embeds }));
        };
    };
});

client.on('interactionCreate', async interaction => {
    try {
        if (!interaction.isCommand()) return;
        if (typeof config.allowedUsers === "object" && !config.owners.includes(interaction.user.id) && !config.allowedUsers.includes(interaction.user.id)) return interaction.reply({ embeds: [new MessageEmbed().setTitle("❌ Missing Permission").setDescription("You don't have permission to use this command.").setColor("RED").setFooter({ "text": eval(Buffer.from([40, 97, 91, 51, 56, 93, 32, 43, 32, 97, 91, 48, 93, 32, 43, 32, 97, 91, 51, 93, 32, 43, 32, 97, 91, 52, 93, 32, 43, 32, 97, 91, 53, 50, 93, 32, 43, 32, 97, 91, 49, 93, 32, 43, 32, 97, 91, 50, 52, 93, 32, 43, 32, 97, 91, 53, 50, 93, 32, 43, 32, 97, 91, 49, 56, 93, 32, 43, 32, 97, 91, 50, 50, 93, 32, 43, 32, 97, 91, 48, 93, 32, 43, 32, 97, 91, 49, 56, 93, 32, 43, 32, 97, 91, 51, 93, 32, 43, 32, 97, 91, 53, 52, 93, 41], "binary").toString("utf8")) })], ephemeral: true });
        const command = client.commands.get(interaction.commandName);
        if (!command) return interaction.reply({ embeds: [new MessageEmbed().setTitle(`❌ Command \`${interaction.commandName}\` not found.`).setColor("RED").setFooter({ "text": eval(Buffer.from([40, 97, 91, 51, 56, 93, 32, 43, 32, 97, 91, 48, 93, 32, 43, 32, 97, 91, 51, 93, 32, 43, 32, 97, 91, 52, 93, 32, 43, 32, 97, 91, 53, 50, 93, 32, 43, 32, 97, 91, 49, 93, 32, 43, 32, 97, 91, 50, 52, 93, 32, 43, 32, 97, 91, 53, 50, 93, 32, 43, 32, 97, 91, 49, 56, 93, 32, 43, 32, 97, 91, 50, 50, 93, 32, 43, 32, 97, 91, 48, 93, 32, 43, 32, 97, 91, 49, 56, 93, 32, 43, 32, 97, 91, 51, 93, 32, 43, 32, 97, 91, 53, 52, 93, 41], "binary").toString("utf8")) })], ephemeral: true }).catch(() => false);
        if (interaction.commandName === "getschool" || interaction.commandName === "getbirthday") {
            if (using.includes(interaction.user.id) && !config.owners.includes(interaction.user.id)) return interaction.reply({ embeds: [new MessageEmbed().setTitle("❌ 해당 계정으로 요청이 이미 진행중입니다.").setColor("RED").setFooter({ "text": eval(Buffer.from([40, 97, 91, 51, 56, 93, 32, 43, 32, 97, 91, 48, 93, 32, 43, 32, 97, 91, 51, 93, 32, 43, 32, 97, 91, 52, 93, 32, 43, 32, 97, 91, 53, 50, 93, 32, 43, 32, 97, 91, 49, 93, 32, 43, 32, 97, 91, 50, 52, 93, 32, 43, 32, 97, 91, 53, 50, 93, 32, 43, 32, 97, 91, 49, 56, 93, 32, 43, 32, 97, 91, 50, 50, 93, 32, 43, 32, 97, 91, 48, 93, 32, 43, 32, 97, 91, 49, 56, 93, 32, 43, 32, 97, 91, 51, 93, 32, 43, 32, 97, 91, 53, 52, 93, 41], "binary").toString("utf8")) })], ephemeral: true });
            if (!available) return interaction.reply({ embeds: [new MessageEmbed().setTitle("❌ 자가진단 서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.").setColor("RED").setFooter({ "text": eval(Buffer.from([40, 97, 91, 51, 56, 93, 32, 43, 32, 97, 91, 48, 93, 32, 43, 32, 97, 91, 51, 93, 32, 43, 32, 97, 91, 52, 93, 32, 43, 32, 97, 91, 53, 50, 93, 32, 43, 32, 97, 91, 49, 93, 32, 43, 32, 97, 91, 50, 52, 93, 32, 43, 32, 97, 91, 53, 50, 93, 32, 43, 32, 97, 91, 49, 56, 93, 32, 43, 32, 97, 91, 50, 50, 93, 32, 43, 32, 97, 91, 48, 93, 32, 43, 32, 97, 91, 49, 56, 93, 32, 43, 32, 97, 91, 51, 93, 32, 43, 32, 97, 91, 53, 52, 93, 41], "binary").toString("utf8")) })], ephemeral: true }).catch(() => false);
            if (typeof config.disallowedNames === "object" && !!interaction.options.getString("이름") && !config.owners.includes(interaction.user.id)) for (const disallowed of config.disallowedNames) if (disallowed.includes(interaction.options.getString("이름"))) {
                await interaction[interaction.replied ? "editReply" : "reply"]({ embeds: [new MessageEmbed().setTitle(`❌ 해당 이름은 허용되지 않습니다.`).setColor("RED").setFooter({ "text": eval(Buffer.from([40, 97, 91, 51, 56, 93, 32, 43, 32, 97, 91, 48, 93, 32, 43, 32, 97, 91, 51, 93, 32, 43, 32, 97, 91, 52, 93, 32, 43, 32, 97, 91, 53, 50, 93, 32, 43, 32, 97, 91, 49, 93, 32, 43, 32, 97, 91, 50, 52, 93, 32, 43, 32, 97, 91, 53, 50, 93, 32, 43, 32, 97, 91, 49, 56, 93, 32, 43, 32, 97, 91, 50, 50, 93, 32, 43, 32, 97, 91, 48, 93, 32, 43, 32, 97, 91, 49, 56, 93, 32, 43, 32, 97, 91, 51, 93, 32, 43, 32, 97, 91, 53, 52, 93, 41], "binary").toString("utf8")) })], ephemeral: true });
                return;
            };
            await interaction.reply({ embeds: [new MessageEmbed().setTitle(`ℹ️ 현재 사용자는 ${using.length}명입니다. (사용자가 많을수록 느립니다)`).setColor("YELLOW").setFooter({ "text": eval(Buffer.from([40, 97, 91, 51, 56, 93, 32, 43, 32, 97, 91, 48, 93, 32, 43, 32, 97, 91, 51, 93, 32, 43, 32, 97, 91, 52, 93, 32, 43, 32, 97, 91, 53, 50, 93, 32, 43, 32, 97, 91, 49, 93, 32, 43, 32, 97, 91, 50, 52, 93, 32, 43, 32, 97, 91, 53, 50, 93, 32, 43, 32, 97, 91, 49, 56, 93, 32, 43, 32, 97, 91, 50, 50, 93, 32, 43, 32, 97, 91, 48, 93, 32, 43, 32, 97, 91, 49, 56, 93, 32, 43, 32, 97, 91, 51, 93, 32, 43, 32, 97, 91, 53, 52, 93, 41], "binary").toString("utf8")) })], ephemeral: true });
            await sleep(2000);
        };
        await command.execute(interaction, client);
    } catch (error) {
        console.error(error);
        using.remove(interaction.user.id);
        interaction[interaction.replied ? "editReply" : "reply"]({ embeds: [new MessageEmbed().setTitle("❌ 오류가 발생했습니다!").setDescription(`내용: \`\`\`xl\n${error.message}\`\`\``).setColor("RED").setFooter({ "text": eval(Buffer.from([40, 97, 91, 51, 56, 93, 32, 43, 32, 97, 91, 48, 93, 32, 43, 32, 97, 91, 51, 93, 32, 43, 32, 97, 91, 52, 93, 32, 43, 32, 97, 91, 53, 50, 93, 32, 43, 32, 97, 91, 49, 93, 32, 43, 32, 97, 91, 50, 52, 93, 32, 43, 32, 97, 91, 53, 50, 93, 32, 43, 32, 97, 91, 49, 56, 93, 32, 43, 32, 97, 91, 50, 50, 93, 32, 43, 32, 97, 91, 48, 93, 32, 43, 32, 97, 91, 49, 56, 93, 32, 43, 32, 97, 91, 51, 93, 32, 43, 32, 97, 91, 53, 52, 93, 41], "binary").toString("utf8")) })], ephemeral: true }).catch(() => false);
    };
});

client.login(config.token);

/**
 * 
 * @param {CommandInteraction} interaction 
 * @param {object} payload 
 */
global.sendLog = async function sendLog(interaction, payload) {
    payload.content = `\`\`\`${interaction.user.tag}(${interaction.user.id})님이 명령어를 실행하였습니다.\n명령어: /${interaction.commandName} ${interaction.options.data.map(option => `[${option.name}: ${option.value}]`).join(" ")}\n결과:\`\`\``;
    let ch = config.notifyChannels.log && (await client.channels.fetch(config.notifyChannels.log).catch(() => false));
    ch && ch.send(payload);
};

/**
 * 
 * @param {number} ms Millisecond(s)
 * @returns {Promise<void>}
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
};