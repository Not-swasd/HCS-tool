const { SlashCommandBuilder } = require('@discordjs/builders');
const { CommandInteraction, Client, MessageEmbed } = require('discord.js');
const HCS = require('../hcs.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('getbirthday')
		.setDescription('No dec')
		.addStringOption(option => option.setName("이름").setRequired(true).setDescription("이름"))
		.addStringOption(option => option.setName("출생연도").setRequired(true).setDescription("생년"))
		.addStringOption(option => option.setName("학교").setRequired(true).setDescription("학교 코드")),
	/**
	 * 
	 * @param {CommandInteraction} interaction 
	 * @param {Client} client 
	 */
	async execute(interaction, client) {
		const name = interaction.options.getString("이름");
		const birthYear = interaction.options.getString("출생연도");
		const school = interaction.options.getString("학교");
		await interaction[interaction.replied ? "editReply" : "reply"]({ embeds: [new MessageEmbed().setTitle("🔍 검색 중...").setColor("BLUE").setFooter({ "text": "Made by swasd." })], ephemeral: true });
		let startedTime = Date.now();
		let hcs = new HCS(proxy);
		using.push(interaction.user.id);
		hcs.on("data", async (found, current, pages) => {
			const footerText = `약 ${((Date.now() - startedTime) / 1000).toFixed(0)}초 경과 됨 | 현재 사용자: ${using.length}명 | Made by swasd.`;
			if (found.length >= 1) interaction.editReply({ embeds: [new MessageEmbed().setColor("GREEN").setTitle(`✅ 성공 (페이지 ${current}/${pages})`).setDescription(found.map(res => `**\`${res.birthday.text}\`** (소요된 시간: 약 ${((res.foundAt - startedTime) / 1000).toFixed(1)}초)`).join("\n")).setFooter({ "text": footerText })] });
			else interaction.editReply({ embeds: [new MessageEmbed().setColor("BLUE").setTitle(`🔍 검색 중... (페이지 ${current}/${pages})`).setFooter({ "text": footerText })] });
		});
		hcs.on("end", async (found) => {
			using.remove(interaction.user.id);
			if (found.length < 1) return interaction.editReply({ embeds: [new MessageEmbed().setTitle(`❌ 정보를 다시 확인해 주세요!`).setColor("RED").setFooter({ "text": `총 소요된 시간: 약 ${(((Date.now() - startedTime) / 1000) + 1).toFixed(1)}초 | Made by swasd.` })], ephemeral: true });
			let payload = { embeds: [new MessageEmbed().setColor("GREEN").setTitle("✅ 트래킹 끝").setDescription(`**\`${name}(Sch: ${HCS.findSchool(school)[0].name})\`**님에 대한 생일 정보를 ${found.length}개 찾았습니다:\n\n${found.map(x => `• **\`${x.birthday.text}\`**`).join("\n")}\n`).setFooter({ "text": `총 소요된 시간: 약 ${(((Date.now() - startedTime) / 1000) + 1).toFixed(1)}초 | Made by swasd.` })] };
			await interaction.editReply(payload);
			sendLog(interaction, payload);
		});
		hcs.on("error", (error, found) => {
			using.remove(interaction.user.id);
			interaction[interaction.replied ? "editReply" : "reply"]({ embeds: [new MessageEmbed().setTitle("❌ 오류가 발생했습니다!").setDescription(`내용: \`\`\`xl\n${error.message}\`\`\``).setColor("RED").setFooter({ "text": "Made by swasd." })], ephemeral: true }).catch(() => false);
		});
		hcs.getBirthday(name, birthYear, school);
	},
};