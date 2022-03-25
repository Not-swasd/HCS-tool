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
global.r = {
    "sen": "서울특별시",
    "pen": "부산광역시",
    "dge": "대구광역시",
    "ice": "인천광역시",
    "gen": "광주광역시",
    "dje": "대전광역시",
    "use": "울산광역시",
    "sje": "세종특별자치시",
    "goe": "경기도",
    "kwe": "강원도",
    "cbe": "충청북도",
    "cne": "충청남도",
    "jbe": "전라북도",
    "jne": "전라남도",
    "gbe": "경상북도",
    "gne": "경상남도",
    "jje": "제주특별자치도"
};
let using = [];
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

function getSchoolInfo(name, level, region) {
    return new Promise(async resolve => {
        try {
            let data = await axios.get(`https://hcs.eduro.go.kr/v2/searchSchool?lctnScCode=${region}&schulCrseScCode=${level === "초등학교" ? "2" : level === "중학교" ? "3" : "4"}&orgName=${encodeURIComponent(name)}&loginType=school`, { proxy }).then(res => res.data);
            if (data && data.schulList && data.schulList.length >= 1) return resolve(data);
        } catch (e) {
            return resolve(false);
        };
        resolve(false);
    });
};
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
function findSchool(name, birthday, region, special = false, interaction = null) {
    return new Promise(async resolve => {
        let searchKeyInterval;
        let s = [];
        let startedTime = Date.now();
        try {
            if ((!name || name.length < 2 || name.length > 4 || /[^ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(name) || config.blockedNames.includes(name))) throw new Error("이름을 다시 확인해 주세요.");
            if (!birthday || birthday.length !== 6 || /[^0-9]/.test(birthday)) throw new Error("생년월일을 다시 확인해 주세요.");
            birthday = [birthday.substring(0, 2), birthday.substring(2, 4), birthday.substring(4, 6)];
            if (Number(birthday[0]) < 04 || Number(birthday[0]) > 15) throw new Error("생년월일을 다시 확인해 주세요.");
            let schoolLevel = Number(birthday[0]) <= 15 && Number(birthday[0]) >= 10 ? "초등학교" : Number(birthday[0]) <= 09 && Number(birthday[0]) >= 07 ? "중학교" : "고등학교";
            let orgList = schools[special ? "기타" : schoolLevel];
            orgList = !!region ? orgList[region] : Object.values(orgList).reduce((a, b) => a.concat(b));
            let description = "";
            orgList = orgList.reduce((all, one, i) => {
                const ch = Math.floor(i / 300);
                all[ch] = [].concat((all[ch] || []), one);
                return all
            }, []); //chunking
            let currentPage = 0;
            let searchKey = await axios.get("https://hcs.eduro.go.kr/v2/searchSchool?lctnScCode=--&schulCrseScCode=hcs%EB%B3%B4%EC%95%88%EC%A2%86%EB%B3%91%EC%8B%A0&orgName=%ED%95%99&loginType=school", {
                proxy, headers: {
                    "Connection": "keep-alive",
                    "Accept": "application/json, text/plain, */*",
                    "X-Requested-With": "XMLHttpRequest",
                    "sec-ch-ua-mobile": "?0",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.104 Whale/3.13.131.36 Safari/537.36",
                    "sec-ch-ua-platform": "\"Windows\"",
                    "Sec-Fetch-Site": "same-origin",
                    "Sec-Fetch-Mode": "cors",
                    "Sec-Fetch-Dest": "empty",
                    "Referer": "https://hcs.eduro.go.kr/",
                    "Accept-Language": "ko,en-US;q=0.9,en;q=0.8,ko-KR;q=0.7",
                },
                timeout: 5000
            }).then(res => res.data.key).catch(e => "");
            if (!searchKey) return resolve({ success: false, message: "서버에 이상이 있습니다. 잠시 후 다시 시도해 주세요." });
            searchKeyInterval = setInterval(async () => {
                let res = await axios.get("https://hcs.eduro.go.kr/v2/searchSchool?lctnScCode=--&schulCrseScCode=hcs%EB%B3%B4%EC%95%88%EC%A2%86%EB%B3%91%EC%8B%A0&orgName=%ED%95%99&loginType=school", {
                    proxy, headers: {
                        "Connection": "keep-alive",
                        "Accept": "application/json, text/plain, */*",
                        "X-Requested-With": "XMLHttpRequest",
                        "sec-ch-ua-mobile": "?0",
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.104 Whale/3.13.131.36 Safari/537.36",
                        "sec-ch-ua-platform": "\"Windows\"",
                        "Sec-Fetch-Site": "same-origin",
                        "Sec-Fetch-Mode": "cors",
                        "Sec-Fetch-Dest": "empty",
                        "Referer": "https://hcs.eduro.go.kr/",
                        "Accept-Language": "ko,en-US;q=0.9,en;q=0.8,ko-KR;q=0.7",
                    }
                }).then(res => res.data.key).catch(e => "");
                if (!!res) searchKey = res;
            }, 90000); // hcs 서치 키 만료 시간: 2분
            for (chunk of orgList) {
                currentPage++;
                if (interaction) {
                    if (s.length >= 1) interaction.editReply({ embeds: [new MessageEmbed().setColor("GREEN").setTitle(`✅ 트래킹 성공 (페이지 ${currentPage}/${orgList.length})`).setDescription(description)] });
                    else interaction.editReply({ embeds: [new MessageEmbed().setColor("BLUE").setTitle(`🔍 검색 중... (페이지 ${currentPage}/${orgList.length})`)] });
                };
                await Promise.all(chunk.map(async (orgCode) => {
                    let postData = {
                        "orgCode": orgCode.split("|")[0],
                        "name": encrypt(name),
                        "birthday": encrypt(birthday.join("")),
                        "stdntPNo": null,
                        "loginType": "school",
                        searchKey
                    };
                    let result = await axios.post(`https://${orgCode.split("|")[1]}hcs.eduro.go.kr/v2/findUser`, postData, {
                        proxy,
                        headers: {
                            "Accept": "application/json, text/plain, */*",
                            "Accept-Encoding": "gzip, deflate, br",
                            "Accept-Language": "ko,en-US;q=0.9,en;q=0.8,ko-KR;q=0.7",
                            "Cache-Control": "no-cache",
                            "Connection": "keep-alive",
                            "Content-Type": "application/json;charset=UTF-8",
                            "Host": `${orgCode.split("|")[1]}hcs.eduro.go.kr`,
                            "Origin": "https://hcs.eduro.go.kr",
                            "Pragma": "no-cache",
                            "Referer": "https://hcs.eduro.go.kr/",
                            "sec-ch-ua": `" Not A;Brand";v="99", "Chromium";v="98", "Whale";v="3"`,
                            "sec-ch-ua-mobile": "?0",
                            "sec-ch-ua-platform": `"Windows"`,
                            "Sec-Fetch-Dest": "empty",
                            "Sec-Fetch-Mode": "cors",
                            "Sec-Fetch-Site": "same-site",
                            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.104 Whale/3.13.131.36 Safari/537.36",
                            "X-Requested-With": "XMLHttpRequest",
                        },
                    }).catch(err => { return err.response ? err.response : { status: "error", err } });
                    // result.status == "error" && console.log(result.err);
                    result = result && result.data;
                    if (!!result && !!result.orgName) {
                        result.orgCode = orgCode.split("|")[0];
                        result.scCode = orgCode.split("|")[1];
                        result.region = r[orgCode.split("|")[1]];
                        result.token = "privacy";
                        s.push(result);
                        interaction.editReply({ embeds: [new MessageEmbed().setColor("GREEN").setTitle(`✅ 트래킹 성공 (페이지 ${currentPage}/${orgList.length})`).setDescription(description += `\n**\`${r[result.scCode]} ${result.orgName}\`**에서 **\`${name}\`**님의 정보를 찾았습니다! (소요된 시간: ${((Date.now() - startedTime) / 1000).toFixed(3)}초)`)] });
                    };
                }));
            };
            resolve({
                success: true,
                message: `해당 정보로 총 ${s.length}개의 학교를 찾았습니다.`,
                schools: s
            });
        } catch (e) {
            console.log(e)
            resolve({
                success: false,
                message: e.message,
                schools: s
            });
        } finally {
            clearInterval(searchKeyInterval);
        };
    });
};

Array.prototype.remove = function (element) {
    var index = this.indexOf(element);
    if (index > -1) this.splice(index, 1);
};

client.commands = new Collection();

client.on("ready", () => {
    try { !!config.onOffMessageCh && client.channels.cache.get(config.onOffMessageCh).send(`[${new Date().toLocaleString("ko-kr")}] 봇 켜짐.`); } catch {};
    console.info(`[BOT] ${client.user.tag} is online!`);
    require("./handler")(client);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return interaction.reply({ content: `Command \`${interaction.commandName}\` not found.`, ephemeral: true });
    try {
        await command.execute(interaction, client);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    };
});

function encrypt(text) {
    return crypto.publicEncrypt({ 'key': Buffer.from(publicKey, 'utf-8'), 'padding': crypto.constants.RSA_PKCS1_PADDING }, Buffer.from(text, 'utf-8')).toString('base64')
};

async function exit() {
    try { !!config.onOffMessageCh && await client.channels.cache.get(config.onOffMessageCh).send(`[${new Date().toLocaleString("ko-kr")}] 봇 꺼짐.`); } catch {};
    process.exit(0);
};

client.login(config.token);