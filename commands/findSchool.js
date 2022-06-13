const { SlashCommandBuilder } = require('@discordjs/builders');
const { CommandInteraction, Client, MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('findschool')
		.setDescription('No dec')
		.addStringOption(option => option.setName("학교").setRequired(true).setDescription("학교 이름")),
	/**
	 * 
	 * @param {CommandInteraction} interaction 
	 * @param {Client} client 
	 */
	async execute(interaction, client) {
		try {
			let school = interaction.options.getString("학교");
			let result = schools.filter(x => x.name.includes(school));
			let prefix = `검색어 \`${school}\`에 대한 검색결과를 ${result.length}개 찾았습니다:\n\n`;
			let description = `${prefix} ${result.map(x => `\`${x.code}\` - ${x.region} ${x.name}`).join("\n")}`;
			let i = 0;
			await interaction.reply({ embeds: [new MessageEmbed().setTitle("🔍 검색 중...").setColor("BLUE")], ephemeral: true });
			while (description.length > 3940) {
				i++;
				result.pop();
				description = `${prefix} ${result.map(x => `\`${x.code}\` - ${x.region} ${x.name}`).join("\n")}\n 그리고 ${i}개가 더 남았습니다. (검색결과가 너무 많아 잘라서 출력하였습니다.)`;
			};
			let payload = { embeds: [new MessageEmbed().setTitle("✅ 성공").setDescription(description).setColor("GREEN")], ephemeral: true };
			await interaction.editReply(payload);
			let ch = config.notifyChannels.log && await client.channels.fetch(config.notifyChannels.log).catch(() => false);
			if(ch) {
				payload.content = `\`\`\`${interaction.user.tag}(${interaction.user.id})님이 명령어를 실행하였습니다.\n명령어: /${interaction.commandName} ${interaction.options.data.map(option => `[${option.name}: ${option.value}]`).join(" ")}\n결과:\`\`\``;
				ch.send(payload);
			};
		} catch (e) {
			await interaction.editReply({ embeds: [new MessageEmbed().setTitle("❌ 오류가 발생했습니다!").setDescription(`내용: \`\`\`xl\n${e.message}\`\`\``).setColor("RED")], ephemeral: true });
		}
	},
};