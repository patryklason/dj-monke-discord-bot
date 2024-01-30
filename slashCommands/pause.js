const { SlashCommandBuilder } = require('@discordjs/builders');
const defaultErrorEmbed = require("../embeds/defaultError");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('pauzuje utwór'),

    run: async ({ client, interaction }) => {
        const queue = client.player.getQueue(interaction.guildId);

        if (!interaction.guild.members.me.voice.channel || !interaction.member.voice.channel || interaction.guild.members.me.voice.channel.id !== interaction.member.voice.channel.id) {
            return interaction.editReply({embeds: [defaultErrorEmbed('Aby wykonać tę akcję musisz być na tym samym kanale głosowym')]});
        }

        if (!queue) return await interaction.editReply({embeds: [defaultErrorEmbed('Kolejka jest pusta')]});

        queue.setPaused(true);
        await interaction.deleteReply();
    },
}