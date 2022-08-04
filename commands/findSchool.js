const { SlashCommandBuilder } = require('@discordjs/builders');
const { CommandInteraction, Client, MessageEmbed } = require('discord.js');
const HCS = require('../hcs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('findschool')
		.setDescription('No dec')
		.addStringOption(option => option.setName("학교").setRequired(true).setDescription("학교 이름"))
		.addNumberOption(option => option.setName("limit").setRequired(false).setDescription(".")),
	/**
	 * 
	 * @param {CommandInteraction} interaction 
	 * @param {Client} client 
	 */
	async execute(interaction, client) {
		const name = interaction.options.getString("학교");
		const limit = interaction.options.getNumber("limit") || 0;
		await interaction.reply({ embeds: [new MessageEmbed().setTitle("🔍 검색 중...").setColor("BLUE").setFooter({ "text": "Made by swasd." })], ephemeral: true });
		let result = HCS.findSchool(name);
		let description = `검색어 \`${name}\`에 대한 검색결과를 ${result.length}개 찾았습니다:\n\n`;
		let length = result.length;
		limit > 0 && (result = result.splice(0, limit));
		while (description.length < 3940 && result.length > 0) {
			let x = result.shift();
			description += `• ${x.region} ${x.name} - \`${x.code}\`\n`;
		};
		if(description.length > 3940) description += `\n그리고 ${length - (length - result.length)}개가 더 있습니다.`;
		let payload = { embeds: [new MessageEmbed().setTitle("✅ 성공").setDescription(description).setColor("GREEN").setFooter({ "text": "Made by swasd." })], ephemeral: true };
		await interaction.editReply(payload);
		sendLog(interaction, payload);
	},
};