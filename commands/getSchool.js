const { SlashCommandBuilder } = require('@discordjs/builders');
const { CommandInteraction, Client, MessageEmbed } = require('discord.js');
const HCS = require('../hcs.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('getschool')
		.setDescription('No dec')
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
		let region = interaction.options.getString("지역");
		let name = interaction.options.getString("이름");
		let birthday = interaction.options.getString("생년월일");
		let special = interaction.options.getBoolean("특수학교여부");
		await interaction[interaction.replied ? "editReply" : "reply"]({ embeds: [new MessageEmbed().setTitle("🔍 검색 중...").setColor("BLUE").setFooter({ "text": "Made by swasd." })], ephemeral: true });
		let startedTime = Date.now();
		let hcs = new HCS(proxy);
		using.push(interaction.user.id);
		hcs.on("data", async (found, current, pages) => {
			const footerText = `약 ${((Date.now() - startedTime) / 1000).toFixed(0)}초 경과 됨 | 현재 사용자: ${using.length}명 | Made by swasd.`;
			if (found.length >= 1) interaction.editReply({ embeds: [new MessageEmbed().setColor("GREEN").setTitle(`✅ 성공 (페이지 ${current}/${pages})`).setDescription(found.map(res => `**\`${res.region} ${res.orgName}\`**에서 **\`${name}\`**님의 정보를 찾았습니다! (소요된 시간: 약 ${((res.foundAt - startedTime) / 1000).toFixed(1)}초)`).join("\n")).setFooter({ "text": footerText })] });
			else interaction.editReply({ embeds: [new MessageEmbed().setColor("BLUE").setTitle(`🔍 검색 중... (페이지 ${current}/${pages})`).setFooter({ "text": footerText })] });
		});
		hcs.on("end", async (found) => {
			using.remove(interaction.user.id);
			if (found.length < 1) return interaction.editReply({ embeds: [new MessageEmbed().setTitle(`❌ 정보를 다시 확인해 주세요!`).setColor("RED").setFooter({ "text": `총 소요된 시간: 약 ${(((Date.now() - startedTime) / 1000) + 1).toFixed(1)}초 | Made by swasd.` })], ephemeral: true });
			let payload = { embeds: [new MessageEmbed().setColor("GREEN").setTitle("✅ 트래킹 끝").setDescription(`**\`${name}(Bday: ${birthday})\`**님에 대한 학교정보를 ${found.length}개 찾았습니다:\n\n${found.map(x => `• **\`${x.region} ${x.orgName}\`**`).join("\n")}\n`).setFooter({ "text": `총 소요된 시간: 약 ${(((Date.now() - startedTime) / 1000) + 1).toFixed(1)}초 | Made by swasd.` })] };
			await interaction.editReply(payload);
			sendLog(interaction, payload);
		});
		hcs.on("error", (error, found) => {
			using.remove(interaction.user.id);
			interaction[interaction.replied ? "editReply" : "reply"]({ embeds: [new MessageEmbed().setTitle("❌ 오류가 발생했습니다!").setDescription(`내용: \`\`\`xl\n${error.message}\`\`\``).setColor("RED").setFooter({ "text": "Made by swasd." })], ephemeral: true }).catch(() => false);
		});
		hcs.getSchool(name, birthday, region, special, interaction);
	},
};