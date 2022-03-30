const { SlashCommandBuilder } = require('@discordjs/builders');
const { CommandInteraction, Client, MessageEmbed } = require('discord.js');

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
		try {
			if (using.includes(interaction.user.id) && !config.owners.includes(interaction.user.id)) return interaction.reply({ embeds: [new MessageEmbed().setTitle("❌ 해당 계정으로 요청이 이미 진행중입니다.").setColor("RED")], ephemeral: true });
			let region = interaction.options.getString("지역");
			let name = interaction.options.getString("이름");
			let birthday = interaction.options.getString("생년월일");
			let special = interaction.options.getBoolean("특수학교여부");
			await interaction.reply({ embeds: [new MessageEmbed().setTitle("🔍 검색 중... (약 1분 소요)").setColor("BLUE")], ephemeral: true });
			let startedTime = Date.now();
			using.push(interaction.user.id);
			let school = await findSchool(name, birthday, region, special, interaction);
			using.remove(interaction.user.id);
			if (!school.success) return interaction.editReply({ embeds: [new MessageEmbed().setTitle(`❌ ${school.message}`).setColor("RED")], ephemeral: true });
			if (school.schools.length < 1) return interaction.editReply({ embeds: [new MessageEmbed().setTitle(`❌ 정보를 다시 확인해 주세요! (소요된 시간: ${(Date.now() - startedTime) / 1000}초)`).setColor("RED")], ephemeral: true });
			let order = 0;
			await interaction.editReply({ embeds: [new MessageEmbed().setColor("GREEN").setTitle("✅ 트래킹 끝").setDescription(`**\`${name}\`**님의 정보를 ${school.schools.length}개 찾았습니다:\n${school.schools.map(x => `\n${order += 1}. **\`${x.region} ${x.orgName}\`**`).join("\n")}\n\n총 소요된 시간: ${(((Date.now() - startedTime) / 1000) + 1).toFixed(3)}초`)] });
		} catch (e) {
			using.remove(interaction.user.id);
			await interaction.editReply({ embeds: [new MessageEmbed().setTitle("❌ 오류가 발생했습니다!").setDescription(`내용: \`\`\`xl\n${e.message}\`\`\``).setColor("RED")], ephemeral: true });
		}
	},
};