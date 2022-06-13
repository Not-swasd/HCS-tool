const { SlashCommandBuilder } = require('@discordjs/builders');
const { CommandInteraction, Client, MessageEmbed } = require('discord.js');

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
		try {
			if (using.includes(interaction.user.id) && !config.owners.includes(interaction.user.id)) return interaction.reply({ embeds: [new MessageEmbed().setTitle("❌ 해당 계정으로 요청이 이미 진행중입니다.").setColor("RED")], ephemeral: true });
			const name = interaction.options.getString("이름");
			const birthYear = interaction.options.getString("출생연도");
			let school = interaction.options.getString("학교");
			await interaction.reply({ embeds: [new MessageEmbed().setTitle("🔍 검색 중...").setColor("BLUE")], ephemeral: true });
			let startedTime = Date.now();
			using.push(interaction.user.id);
			let result = await getBirthdate(name, birthYear, school, interaction);
			using.remove(interaction.user.id);
			if (!result.success) return interaction.editReply({ embeds: [new MessageEmbed().setTitle(`❌ ${result.message}`).setColor("RED")], ephemeral: true });
			if (result.data.length < 1) return interaction.editReply({ embeds: [new MessageEmbed().setTitle(`❌ 정보를 다시 확인해 주세요! (소요된 시간: ${(Date.now() - startedTime) / 1000}초)`).setColor("RED")], ephemeral: true });
			let order = 0;
			let payload = { embeds: [new MessageEmbed().setColor("GREEN").setTitle("✅ 끝").setDescription(`**\`${name}\`**님에 대한 생일 정보를 ${result.data.length}개 찾았습니다:\n\n${result.data.map(x => `${order += 1}. **\`${x.birthday.text}생\`**`).join("\n")}\n\n총 소요된 시간: ${(((Date.now() - startedTime) / 1000) + 1).toFixed(3)}초`)] };
			await interaction.editReply(payload);
			let ch = config.notifyChannels.log && await client.channels.fetch(config.notifyChannels.log).catch(() => false);
			if(ch) {
				payload.content = `\`\`\`${interaction.user.tag}(${interaction.user.id})님이 명령어를 실행하였습니다.\n명령어: /${interaction.commandName} ${interaction.options.data.map(option => `[${option.name}: ${option.value}]`).join(" ")}\n결과:\`\`\``;
				ch.send(payload);
			};
		} catch (e) {
			using.remove(interaction.user.id);
			await interaction.editReply({ embeds: [new MessageEmbed().setTitle("❌ 오류가 발생했습니다!").setDescription(`내용: \`\`\`xl\n${e.message}\`\`\``).setColor("RED")], ephemeral: true });
		}
	},
};