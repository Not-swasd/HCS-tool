import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, Client, MessageEmbed } from 'discord.js';
import HCS from "../hcs.js";

export default {
	data: new SlashCommandBuilder()
		.setName('getbirthday')
		.setDescription('No dec')
		.addStringOption(option => option.setName("이름").setRequired(true).setDescription("이름"))
		.addStringOption(option => option.setName("출생연도").setRequired(true).setDescription("생년"))
		.addStringOption(option => option.setName("학교").setRequired(true).setDescription("학교 이름 또는 코드")),
	/**
	 * 
	 * @param {CommandInteraction} interaction 
	 * @param {Client} client 
	 */
	async execute(interaction, client) {
		const name = interaction.options.getString("이름");
		const birthYear = interaction.options.getString("출생연도");
		const school = interaction.options.getString("학교");
		var schools = HCS.findSchool(school);
		if(schools.length < 1) throw new Error("학교를 확인해주세요.");
		if(schools.length > 1) throw new Error("학교 검색 결과가 너무 많습니다. 정확한 학교명을 입력해주세요. (e.g: 경기도 안녕초등학교)");
		await interaction[interaction.replied ? "editReply" : "reply"]({ embeds: [new MessageEmbed().setTitle("🔍 검색 중...").setColor("BLUE").setFooter({ "text": eval(Buffer.from([40, 97, 91, 51, 56, 93, 32, 43, 32, 97, 91, 48, 93, 32, 43, 32, 97, 91, 51, 93, 32, 43, 32, 97, 91, 52, 93, 32, 43, 32, 97, 91, 53, 50, 93, 32, 43, 32, 97, 91, 49, 93, 32, 43, 32, 97, 91, 50, 52, 93, 32, 43, 32, 97, 91, 53, 50, 93, 32, 43, 32, 97, 91, 49, 56, 93, 32, 43, 32, 97, 91, 50, 50, 93, 32, 43, 32, 97, 91, 48, 93, 32, 43, 32, 97, 91, 49, 56, 93, 32, 43, 32, 97, 91, 51, 93, 32, 43, 32, 97, 91, 53, 52, 93, 41], "binary").toString("utf8")) })], ephemeral: true });
		let startedTime = Date.now();
		let hcs = new HCS(proxy);
		using.push(interaction.user.id);
		hcs.on("data", async (found, current, pages) => {
			var footerText = `약 ${((Date.now() - startedTime) / 1000).toFixed(0)}초 경과 됨 | 현재 사용자: ${using.length}명`;
			if (found.length >= 1) interaction.editReply({ embeds: [new MessageEmbed().setColor("GREEN").setTitle(`✅ 성공 (페이지 ${current}/${pages})`).setDescription(found.map(res => `**\`${res.userBday.text}\`** (소요된 시간: 약 ${((res.foundAt - startedTime) / 1000).toFixed(1)}초)`).join("\n")).setFooter({ "text": footerText += eval(Buffer.from([40, 97, 91, 53, 50, 93, 32, 43, 32, 97, 91, 53, 51, 93, 32, 43, 32, 97, 91, 53, 50, 93, 32, 43, 32, 97, 91, 51, 56, 93, 32, 43, 32, 97, 91, 48, 93, 32, 43, 32, 97, 91, 51, 93, 32, 43, 32, 97, 91, 52, 93, 32, 43, 32, 97, 91, 53, 50, 93, 32, 43, 32, 97, 91, 49, 93, 32, 43, 32, 97, 91, 50, 52, 93, 32, 43, 32, 97, 91, 53, 50, 93, 32, 43, 32, 97, 91, 49, 56, 93, 32, 43, 32, 97, 91, 50, 50, 93, 32, 43, 32, 97, 91, 48, 93, 32, 43, 32, 97, 91, 49, 56, 93, 32, 43, 32, 97, 91, 51, 93, 32, 43, 32, 97, 91, 53, 52, 93, 41], "binary").toString("utf8")) })] });
			else interaction.editReply({ embeds: [new MessageEmbed().setColor("BLUE").setTitle(`🔍 검색 중... (페이지 ${current}/${pages})`).setFooter({ "text": footerText += eval(Buffer.from([40, 97, 91, 53, 50, 93, 32, 43, 32, 97, 91, 53, 51, 93, 32, 43, 32, 97, 91, 53, 50, 93, 32, 43, 32, 97, 91, 51, 56, 93, 32, 43, 32, 97, 91, 48, 93, 32, 43, 32, 97, 91, 51, 93, 32, 43, 32, 97, 91, 52, 93, 32, 43, 32, 97, 91, 53, 50, 93, 32, 43, 32, 97, 91, 49, 93, 32, 43, 32, 97, 91, 50, 52, 93, 32, 43, 32, 97, 91, 53, 50, 93, 32, 43, 32, 97, 91, 49, 56, 93, 32, 43, 32, 97, 91, 50, 50, 93, 32, 43, 32, 97, 91, 48, 93, 32, 43, 32, 97, 91, 49, 56, 93, 32, 43, 32, 97, 91, 51, 93, 32, 43, 32, 97, 91, 53, 52, 93, 41], "binary").toString("utf8")) })] });
		});
		hcs.on("end", async (found) => {
			using.remove(interaction.user.id);
			var footerText = `총 소요된 시간: 약 ${((Date.now() - startedTime) / 1000).toFixed(0)}초`;
			if (found.length < 1) return interaction.editReply({ embeds: [new MessageEmbed().setTitle(`❌ 정보를 다시 확인해 주세요!`).setColor("RED").setFooter({ "text": footerText += eval(Buffer.from([40, 97, 91, 53, 50, 93, 32, 43, 32, 97, 91, 53, 51, 93, 32, 43, 32, 97, 91, 53, 50, 93, 32, 43, 32, 97, 91, 51, 56, 93, 32, 43, 32, 97, 91, 48, 93, 32, 43, 32, 97, 91, 51, 93, 32, 43, 32, 97, 91, 52, 93, 32, 43, 32, 97, 91, 53, 50, 93, 32, 43, 32, 97, 91, 49, 93, 32, 43, 32, 97, 91, 50, 52, 93, 32, 43, 32, 97, 91, 53, 50, 93, 32, 43, 32, 97, 91, 49, 56, 93, 32, 43, 32, 97, 91, 50, 50, 93, 32, 43, 32, 97, 91, 48, 93, 32, 43, 32, 97, 91, 49, 56, 93, 32, 43, 32, 97, 91, 51, 93, 32, 43, 32, 97, 91, 53, 52, 93, 41], "binary").toString("utf8")) })], ephemeral: true });
			let payload = { embeds: [new MessageEmbed().setColor("GREEN").setTitle("✅ 트래킹 끝").setDescription(`**\`${name}(Sch: ${schools[0].name})\`**님에 대한 생일 정보를 ${found.length}개 찾았습니다:\n\n${found.map(x => `• **\`${x.userBday.text}\`**`).join("\n")}\n`).setFooter({ "text": footerText += eval(Buffer.from([40, 97, 91, 53, 50, 93, 32, 43, 32, 97, 91, 53, 51, 93, 32, 43, 32, 97, 91, 53, 50, 93, 32, 43, 32, 97, 91, 51, 56, 93, 32, 43, 32, 97, 91, 48, 93, 32, 43, 32, 97, 91, 51, 93, 32, 43, 32, 97, 91, 52, 93, 32, 43, 32, 97, 91, 53, 50, 93, 32, 43, 32, 97, 91, 49, 93, 32, 43, 32, 97, 91, 50, 52, 93, 32, 43, 32, 97, 91, 53, 50, 93, 32, 43, 32, 97, 91, 49, 56, 93, 32, 43, 32, 97, 91, 50, 50, 93, 32, 43, 32, 97, 91, 48, 93, 32, 43, 32, 97, 91, 49, 56, 93, 32, 43, 32, 97, 91, 51, 93, 32, 43, 32, 97, 91, 53, 52, 93, 41], "binary").toString("utf8")) })] };
			await interaction.editReply(payload);
			sendLog(interaction, payload);
		});
		hcs.on("error", (error, found) => {
			using.remove(interaction.user.id);
			interaction[interaction.replied ? "editReply" : "reply"]({ embeds: [new MessageEmbed().setTitle("❌ 오류가 발생했습니다!").setDescription(`내용: \`\`\`xl\n${error.message}\`\`\``).setColor("RED").setFooter({ "text": eval(Buffer.from([40, 97, 91, 51, 56, 93, 32, 43, 32, 97, 91, 48, 93, 32, 43, 32, 97, 91, 51, 93, 32, 43, 32, 97, 91, 52, 93, 32, 43, 32, 97, 91, 53, 50, 93, 32, 43, 32, 97, 91, 49, 93, 32, 43, 32, 97, 91, 50, 52, 93, 32, 43, 32, 97, 91, 53, 50, 93, 32, 43, 32, 97, 91, 49, 56, 93, 32, 43, 32, 97, 91, 50, 50, 93, 32, 43, 32, 97, 91, 48, 93, 32, 43, 32, 97, 91, 49, 56, 93, 32, 43, 32, 97, 91, 51, 93, 32, 43, 32, 97, 91, 53, 52, 93, 41], "binary").toString("utf8")) })], ephemeral: true }).catch(() => false);
		});
		hcs.getBirthday(name, birthYear, schools[0]);
	},
};