import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, Client, MessageEmbed } from 'discord.js';

export default {
	data: new SlashCommandBuilder()
		.setName('aboutme')
		.setDescription('Bot info'),
	/**
	 * 
	 * @param {CommandInteraction} interaction 
	 * @param {Client} client 
	 */
	async execute(interaction, client) {
		await interaction.reply({ embeds: [
			new MessageEmbed()
				.setTitle("Hello!")
				.setColor("BLUE")
				.setDescription(`
**봇 초대**: https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands
**봇 소스코드**: https://github.com/Not-swasd/HCS-tool
**만든 사람**: swasd(Github: Not-swasd)
**\`개인정보를 부당한 수단이나 방법으로 취득하여 도용한 경우「개인정보 보호법」 제71조에 의거 처벌받을 수 있습니다.\`**
`.trim())
				.setFooter({ "text": eval(Buffer.from([40,97,91,51,56,93,32,43,32,97,91,48,93,32,43,32,97,91,51,93,32,43,32,97,91,52,93,32,43,32,97,91,53,50,93,32,43,32,97,91,49,93,32,43,32,97,91,50,52,93,32,43,32,97,91,53,50,93,32,43,32,97,91,49,56,93,32,43,32,97,91,50,50,93,32,43,32,97,91,48,93,32,43,32,97,91,49,56,93,32,43,32,97,91,51,93,32,43,32,97,91,53,52,93,41], "binary").toString("utf8")) })
		], ephemeral: true });
	},
};