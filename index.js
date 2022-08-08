const { Client, Intents, Collection, MessageEmbed, CommandInteraction } = require("discord.js");
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
const axios = require("axios-https-proxy-fix").default;
global.config = require('./config.json');
global.proxy = !!config.proxy.host && !!config.proxy.port && config.proxy;
global.using = [];
let currentVer = "";

Array.prototype.remove = function (element) {
    var index = this.indexOf(element);
    if (index > -1) this.splice(index, 1);
};

client.commands = new Collection();
var available = false;

client.on("ready", () => {
    console.info(`[BOT] ${client.user.tag} is online!`);
    require("./handler")(client);
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
        if (newVer !== currentVer && !!currentVer) {
            currentVer = newVer;
            console.info(`[HCS-NOTIFICATION] HCS Client has been updated. New Version ${currentVer}`);
            let channel = client.channels.cache.get(config.notifyChannels.hcsUpdate);
            if (channel) {
                await channel.bulkDelete(99);
                channel.send({ content: `<@${config.owners[0]}>`, embeds: [new MessageEmbed().setTitle("HCS Update Notification").setDescription(`**New version**: **\`${currentVer}\`**`).setColor("GREEN").setTimestamp().setFooter({ "text": "Made by swasd." })] });
            };
        } else if (!currentVer) {
            currentVer = newVer;
            console.info(`[HCS-NOTIFY] Current HCS Client version: ${newVer}`)
        };
    };
    check();
    setInterval(check, 10000);
});

client.on("messageCreate", async message => {
    if (config.owners.includes(message.author.id) && message.mentions.users.first() && message.mentions.users.first().id === client.user.id) {
        try {
            let e = await eval(message.content.slice(client.user.id.toString().length + 4));
            let ob = { embeds: [new MessageEmbed().setTitle(`✅ Success`).setDescription(`\`\`\`xl\n${e}\`\`\``).setColor("GREEN").setTimestamp().setFooter({ "text": "Made by swasd." })] };
            message.reply(ob).catch(() => message.channel.send({ content: `<@${message.author.id}>`, embeds: ob.embeds }));
        } catch (e) {
            let ob = { embeds: [new MessageEmbed().setTitle(`❌ Failed`).setDescription(`\`\`\`xl\n${e}\`\`\``).setColor("RED").setTimestamp().setFooter({ "text": "Made by swasd." })] };
            message.reply(ob).catch(() => message.channel.send({ content: `<@${message.author.id}>`, embeds: ob.embeds }));
        };
    };
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    if (!available) return interaction.reply("자가진단 서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.");
    const command = client.commands.get(interaction.commandName);
    if (!command) return interaction.reply({ content: `Command \`${interaction.commandName}\` not found.`, ephemeral: true });
    try {
        if (typeof config.allowedUsers === "object" && !config.owners.includes(interaction.user.id) && !config.allowedUsers.includes(interaction.user.id)) return interaction.reply({ embeds: [new MessageEmbed().setTitle("❌ Missing Permission").setDescription("You don't have permission to use this command.").setColor("RED").setFooter({ "text": "Made by swasd." })], ephemeral: true });
        await command.execute(interaction, client);
    } catch (error) {
        console.error(error);
        using.remove(interaction.user.id);
        interaction[interaction.replied ? "editReply" : "reply"]({ embeds: [new MessageEmbed().setTitle("❌ 오류가 발생했습니다!").setDescription(`내용: \`\`\`xl\n${error.message}\`\`\``).setColor("RED").setFooter({ "text": "Made by swasd." })], ephemeral: true }).catch(() => false);
    };
});

client.login(config.token);

global.sendLog = async function sendLog(interaction, payload) {
    payload.content = `\`\`\`${interaction.user.tag}(${interaction.user.id})님이 명령어를 실행하였습니다.\n명령어: /${interaction.commandName} ${interaction.options.data.map(option => `[${option.name}: ${option.value}]`).join(" ")}\n결과:\`\`\``;
    let ch = config.notifyChannels.log && (await client.channels.fetch(config.notifyChannels.log).catch(() => false));
    ch && ch.send(payload);
};