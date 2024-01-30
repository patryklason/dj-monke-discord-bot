const { SlashCommandBuilder } = require('@discordjs/builders');
const defaultErrorEmbed = require("../embeds/defaultError");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('czyści kolejkę i wychodzi z kanału głosowego'),

    run: async ({ client, interaction }) => {
        const queue = client.player.getQueue(interaction.guildId);

        if (!interaction.guild.members.me.voice.channel || !interaction.member.voice.channel || interaction.guild.members.me.voice.channel.id !== interaction.member.voice.channel.id) {
            return interaction.editReply({embeds: [defaultErrorEmbed('Aby wykonać tę akcję musisz być na tym samym kanale głosowym')]});
        }

        if (!queue) return await interaction.editReply({embeds: [defaultErrorEmbed('Kolejka jest pusta')]});

        queue.destroy();
        await interaction.editReply('👋 Pa!');
    },
}