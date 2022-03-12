const { SlashCommandBuilder } = require('@discordjs/builders');
const { CommandInteraction, Client, MessageEmbed } = require('discord.js');
const { default: axios } = require("axios");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('track')
		.setDescription('Search schools by name and birthday')
		.addStringOption(option => option.setName("이름").setRequired(true).setDescription("이름"))
		.addStringOption(option => option.setName("생년월일").setRequired(true).setDescription("생년월일 E.g. 070611"))
		.addStringOption(option => option.setName("지역").addChoices([
			["서울특별시", "서울특별시"],
			["부산광역시", "부산광역시"],
			["대구광역시", "대구광역시"],
			["인천광역시", "인천광역시"],
			["광주광역시", "광주광역시"],
			["대전광역시", "대전광역시"],
			["울산광역시", "울산광역시"],
			["세종특별자치시", "세종특별자치시"],
			["경기도", "경기도"],
			["강원도", "강원도"],
			["충청북도", "충청북도"],
			["충청남도", "충청남도"],
			["전라북도", "전라북도"],
			["전라남도", "전라남도"],
			["경상북도", "경상북도"],
			["경상남도", "경상남도"],
			["제주특별자치도", "제주특별자치도"]
		]).setRequired(false).setDescription("지역"))
		.addBooleanOption(option => option.setName("특수학교여부").setRequired(false).setDescription("특수학교 여부")),
	/**
	 * 
	 * @param {CommandInteraction} interaction 
	 * @param {Client} client 
	 */
	async execute(interaction, client) {
		try {
			if (using.includes(interaction.userId)) return interaction.reply({ embeds: [new MessageEmbed().setTitle("❌ 기다리쇼").setColor("RED")] });
			if (!config.owners.includes(interaction.user.id) && !config.allowedUsers.includes(interaction.user.id)) return interaction.reply({ embeds: [new MessageEmbed().setTitle("❌ Missing Permission").setDescription("You don't have permission to use this command.").setColor("RED")], ephemeral: true });
			let startedTime = Date.now();
			let region = interaction.options.getString("지역");
			let name = interaction.options.getString("이름");
			let birthday = interaction.options.getString("생년월일");
			let special = interaction.options.getBoolean("특수학교여부");
			if (!name || name.length !== 3 || /[^ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(name)) return interaction.reply({ embeds: [new MessageEmbed().setTitle("❌ 이름을 다시 확인해 주세요!").setColor("RED")], ephemeral: true });
			if (!birthday || birthday.length !== 6 || /[^0-9]/.test(birthday)) return interaction.reply({ embeds: [new MessageEmbed().setTitle("❌ 생년월일을 다시 확인해 주세요!").setColor("RED")], ephemeral: true });
			await interaction.reply({ embeds: [new MessageEmbed().setTitle("🔍 검색 중... (최대 41초 소요)").setColor("BLUE")], ephemeral: true });
			birthday = [birthday.substring(0, 2), birthday.substring(2, 4), birthday.substring(4, 6)];
			if (Number(birthday[0]) < 04 || Number(birthday[0]) > 15) return interaction.editReply({ embeds: [new MessageEmbed().setTitle("❌ 생년월일을 다시 확인해 주세요!").setColor("RED")], ephemeral: true });
			let schoolLevel = Number(birthday[0]) <= 15 && Number(birthday[0]) >= 10 ? "초등학교" : Number(birthday[0]) <= 09 && Number(birthday[0]) >= 07 ? "중학교" : "고등학교";
			let list = schools[special ? "기타" : schoolLevel];
			if (!!region) {
				list = list[region];
			} else {
				list = Object.values(list).reduce((a, b) => a.concat(b));
			};
			using.push(interaction.user.id);
			let school = await findSchool(list, name, birthday, interaction);
			using.remove(interaction.user.id);
			if (school.length < 1) return interaction.editReply({ embeds: [new MessageEmbed().setTitle(`❌ 정보를 다시 확인해 주세요! (소요된 시간: ${((Date.now() - startedTime) / 1000) + 1}초)`).setColor("RED")], ephemeral: true });
			await interaction.editReply({
				embeds: [new MessageEmbed().setColor("GREEN").setTitle("✅ 트래킹 끝").setDescription(`**\`${name}\`**님의 정보를 ${school.length}개 찾았습니다:\n${school.map(x => `\n**\`${x.orgName}(${r[x.scCode]})\`**`)}\n\n총 소요된 시간: ${(((Date.now() - startedTime) / 1000) + 1).toFixed(3)}초`)]
			});
		} catch (e) {
			using.remove(interaction.user.id);
			await interaction.editReply({ embeds: [new MessageEmbed().setTitle("❌ 오류가 발생했습니다!").setDescription(`내용: \`\`\`xl\n${e.message}\`\`\``).setColor("RED")], ephemeral: true });
		}
	},
};

/*
const schools = JSON.parse(fs.readFileSync("./전국학교학구도연계정보표준데이터.json", "utf8")).records;
let s = {
	초등학교: {
		"서울특별시": [],
		"부산광역시": [],
		"대구광역시": [],
		"인천광역시": [],
		"광주광역시": [],
		"대전광역시": [],
		"울산광역시": [],
		"세종특별자치시": [],
		"경기도": [],
		"강원도": [],
		"충청북도": [],
		"충청남도": [],
		"전라북도": [],
		"전라남도": [],
		"경상북도": [],
		"경상남도": [],
		"제주특별자치도": []
	},
	중학교: {
		"서울특별시": [],
		"부산광역시": [],
		"대구광역시": [],
		"인천광역시": [],
		"광주광역시": [],
		"대전광역시": [],
		"울산광역시": [],
		"세종특별자치시": [],
		"경기도": [],
		"강원도": [],
		"충청북도": [],
		"충청남도": [],
		"전라북도": [],
		"전라남도": [],
		"경상북도": [],
		"경상남도": [],
		"제주특별자치도": []
	},
	고등학교: {
		"서울특별시": [],
		"부산광역시": [],
		"대구광역시": [],
		"인천광역시": [],
		"광주광역시": [],
		"대전광역시": [],
		"울산광역시": [],
		"세종특별자치시": [],
		"경기도": [],
		"강원도": [],
		"충청북도": [],
		"충청남도": [],
		"전라북도": [],
		"전라남도": [],
		"경상북도": [],
		"경상남도": [],
		"제주특별자치도": []
	},
};
schools.forEach(x => {
	x["학교ID"] = await getOrgCode(x["학교명"], x["학교급"], regionCodes[x.시도교육청명.replace("교육청", "")])
	s[x["학교급구분"]][x.시도교육청명.replace("교육청", "")].push(x)
});
fs.writeFileSync("./전국학교학구도연계정보표준데이터_edited.json", JSON.stringify(s));
*/

/*
let schools = fs.readFileSync("./schools.txt", "utf8").replace(/\r/g, "").split("\n");
let s = {
	초등학교: {
		"서울특별시": [],
		"부산광역시": [],
		"대구광역시": [],
		"인천광역시": [],
		"광주광역시": [],
		"대전광역시": [],
		"울산광역시": [],
		"세종특별자치시": [],
		"경기도": [],
		"강원도": [],
		"충청북도": [],
		"충청남도": [],
		"전라북도": [],
		"전라남도": [],
		"경상북도": [],
		"경상남도": [],
		"제주특별자치도": []
	},
	중학교: {
		"서울특별시": [],
		"부산광역시": [],
		"대구광역시": [],
		"인천광역시": [],
		"광주광역시": [],
		"대전광역시": [],
		"울산광역시": [],
		"세종특별자치시": [],
		"경기도": [],
		"강원도": [],
		"충청북도": [],
		"충청남도": [],
		"전라북도": [],
		"전라남도": [],
		"경상북도": [],
		"경상남도": [],
		"제주특별자치도": []
	},
	고등학교: {
		"서울특별시": [],
		"부산광역시": [],
		"대구광역시": [],
		"인천광역시": [],
		"광주광역시": [],
		"대전광역시": [],
		"울산광역시": [],
		"세종특별자치시": [],
		"경기도": [],
		"강원도": [],
		"충청북도": [],
		"충청남도": [],
		"전라북도": [],
		"전라남도": [],
		"경상북도": [],
		"경상남도": [],
		"제주특별자치도": []
	},
	기타: {
		"서울특별시": [],
		"부산광역시": [],
		"대구광역시": [],
		"인천광역시": [],
		"광주광역시": [],
		"대전광역시": [],
		"울산광역시": [],
		"세종특별자치시": [],
		"경기도": [],
		"강원도": [],
		"충청북도": [],
		"충청남도": [],
		"전라북도": [],
		"전라남도": [],
		"경상북도": [],
		"경상남도": [],
		"제주특별자치도": []
	}
};

schools.forEach(x => {
	let name = x.split(",")[0];
	let region = x.split(",")[1].split(" ")[0];
	let orgCode = x.split(",")[2];
	if (region.includes("강원")) region = "강원도";
	if (region.includes("경기")) region = "경기도";
	if (region.includes("경남")) region = "경상남도";
	if (region.includes("경북")) region = "경상북도";
	if (region.includes("광주")) region = "광주광역시";
	if (region.includes("대구")) region = "대구광역시";
	if (region.includes("대전")) region = "대전광역시";
	if (region.includes("부산")) region = "부산광역시";
	if (region.includes("서울")) region = "서울특별시";
	if (region.includes("세종")) region = "세종특별자치시";
	if (region.includes("울산")) region = "울산광역시";
	if (region.includes("인천")) region = "인천광역시";
	if (region.includes("전남")) region = "전라남도";
	if (region.includes("전북")) region = "전라북도";
	if (region.includes("제주")) region = "제주특별자치도";
	if (region.includes("충남")) region = "충청남도";
	if (region.includes("충북")) region = "충청북도";
	let regionC = {
		"서울특별시": "sen",
		"부산광역시": "pen",
		"대구광역시": "dge",
		"인천광역시": "ice",
		"광주광역시": "gen",
		"대전광역시": "dje",
		"울산광역시": "use",
		"세종특별자치시": "sje",
		"경기도": "goe",
		"강원도": "gwe",
		"충청북도": "cbe",
		"충청남도": "cne",
		"전라북도": "jbe",
		"전라남도": "jne",
		"경상북도": "gbe",
		"경상남도": "gne",
		"제주특별자치도": "jje"
	};
	orgCode = orgCode + "|" + regionC[region];
	if (name.includes("초등학교") || name.includes("(초)")) {
		s["초등학교"][region].push(orgCode);
	} else if (name.includes("중학교") || name.includes("(중)")) {
		s["중학교"][region].push(orgCode);
	} else if (name.includes("고등학교") || name.includes("(고)")) {
		s["고등학교"][region].push(orgCode);
	} else {
		s["기타"][region].push(orgCode);
	};
});
// console.log(s);
fs.writeFileSync("./schools.json", JSON.stringify(s));
*/