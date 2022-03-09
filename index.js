const { Client, Intents, Collection, MessageEmbed } = require("discord.js");
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
const { default: axios } = require("axios");
const JSEncrypt = require('JSEncrypt');
const encrypt = new JSEncrypt();
encrypt.setPublicKey("30820122300d06092a864886f70d01010105000382010f003082010a0282010100f357429c22add0d547ee3e4e876f921a0114d1aaa2e6eeac6177a6a2e2565ce9593b78ea0ec1d8335a9f12356f08e99ea0c3455d849774d85f954ee68d63fc8d6526918210f28dc51aa333b0c4cdc6bf9b029d1c50b5aef5e626c9c8c9c16231c41eef530be91143627205bbbf99c2c261791d2df71e69fbc83cdc7e37c1b3df4ae71244a691c6d2a73eab7617c713e9c193484459f45adc6dd0cba1d54f1abef5b2c34dee43fc0c067ce1c140bc4f81b935c94b116cce404c5b438a0395906ff0133f5b1c6e3b2bb423c6c350376eb4939f44461164195acc51ef44a34d4100f6a837e3473e3ce2e16cedbe67ca48da301f64fc4240b878c9cc6b3d30c316b50203010001");
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
	"gwe": "강원도",
	"cbe": "충청북도",
	"cne": "충청남도",
	"jbe": "전라북도",
	"jne": "전라남도",
	"gbe": "경상북도",
	"gne": "경상남도",
	"jje": "제주특별자치도"
};
app.listen(6975, () => console.info("[Server] Listening on port 6975"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.post("/getSchool", async (req, res) => {
    try {
        let { name, birthday, region, special } = req.body;
        if (!name || name.length !== 3 || /[^ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(name)) throw new Error("이름을 다시 확인해 주세요.");
        if (!birthday || birthday.length !== 6 || /[^0-9]/.test(birthday)) throw new Error("생년월일을 다시 확인해 주세요.");
        if (typeof special != "boolean") throw new Error("특수학교 여부를 다시 확인해 주세요.");
        birthday = [birthday.substring(0, 2), birthday.substring(2, 4), birthday.substring(4, 6)];
        if (Number(birthday[0]) < 04 || Number(birthday[0]) > 15) throw new Error("생년월일을 다시 확인해 주세요.");
        let schoolLevel = Number(birthday[0]) <= 15 && Number(birthday[0]) >= 10 ? "초등학교" : Number(birthday[0]) <= 09 && Number(birthday[0]) >= 07 ? "중학교" : "고등학교";
        let list = schools[special ? "기타" : schoolLevel];
        if (!!region) {
            list = list[region];
        } else {
            list = Object.values(list).reduce((a, b) => a.concat(b));
        };
        let school = await findSchool(list, name, birthday);
        if (!school) throw new Error("정보를 다시 확인해 주세요.");
        res.json({
            success: true,
            messsage: "success",
            data: school,
        });
    } catch (e) {
        res.status(500).json({
            success: false,
            message: e.message
        });
    };
});

function getOrgCode(name, level, region = null) {
	return new Promise(async resolve => {
		try {
			if (!region) {
				["01", "02", "03", "04", "05", "06", "07", "08", "10", "11", "12", "13", "14", "15", "16", "17", "18"].forEach(async (region) => {
					let result = await axios.get(`https://hcs.eduro.go.kr/v2/searchSchool?lctnScCode=${region}&schulCrseScCode=${level === "초등학교" ? "2" : level === "중학교" ? "3" : "4"}&orgName=${encodeURIComponent(name)}&loginType=school`).then(res => res.data.schulList).catch(() => false);
					if (result && result[0]) resolve(result[0].orgCode);
				});
			} else {
				let result = await axios.get(`https://hcs.eduro.go.kr/v2/searchSchool?lctnScCode=${region}&schulCrseScCode=${level === "초등학교" ? "2" : level === "중학교" ? "3" : "4"}&orgName=${encodeURIComponent(name)}&loginType=school`).then(res => res.data.schulList).catch(() => false);
				if (result && result[0]) resolve(result[0].orgCode);
			};
		} catch (e) {
			resolve(false);
		};
	});
};

global.findSchool = function findSchool(orgList, name, birthday) {
	return new Promise(async resolve => {
		try {
			let found = false;
			orgList = orgList.reduce((all, one, i) => {
				const ch = Math.floor(i / 100);
				all[ch] = [].concat((all[ch] || []), one);
				return all
			}, []); //chunking
			for (chunk of orgList) await Promise.all(chunk.map(async (orgCode) => {
				// let orgCode = await getOrgCode(school["학교명"], schoolLevel, regionCodes[region]);
				// if (!orgCode) return;
				if (found) return;
				let postData = {
					"orgCode": orgCode.split("|")[0],
					"name": encrypt.encrypt(name),
					"birthday": encrypt.encrypt(birthday.join("")),
					"stdntPNo": null,
					"loginType": "school"
				};
				let result = await axios.post(`https://${orgCode.split("|")[1]}hcs.eduro.go.kr/v2/findUser`, postData, {
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
					}
				}).catch(err => err.response);
				result = !result ? null : result.data;
                if (result) {
					result.orgCode = orgCode.split("|")[0];
					result.scCode = orgCode.split("|")[1];
                    result.region = r[orgCode.split("|")[1]];
                    result.token = "privacy";
				};
				if (!!result && !!result.orgName && !result.isError) {
					found = true;
					resolve(result);
				};
			}));
			resolve(null);
		} catch (e) {
            console.log(e)
            resolve(null);
		};
	});
};

global.config = require('./config.json');

//Array prototype.remove
Array.prototype.remove = function (element) {
    var index = this.indexOf(element);
    if (index > -1) this.splice(index, 1);
};

client.commands = new Collection();

client.on("ready", () => {
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

client.login(config.token);