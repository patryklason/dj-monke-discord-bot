const { SlashCommandBuilder } = require('@discordjs/builders');
const defaultErrorEmbed = require("../embeds/defaultError");

module.exports = {
    data: new SlashCommandBuilder().setName('skipto')
        .setDescription("skipuje do utworu o podanym numerze")
        .addNumberOption((option) =>
            option.setName('tracknumber')
                .setDescription('numer utworu')
                .setMinValue(1)
                .setRequired(true)),

    run: async ({ client, interaction }) => {
        const queue = client.player.getQueue(interaction.guildId);

        if (!interaction.guild.members.me.voice.channel || !interaction.member.voice.channel || interaction.guild.members.me.voice.channel.id !== interaction.member.voice.channel.id) {
            return interaction.editReply({embeds: [defaultErrorEmbed('Aby wykonać tę akcję musisz być na tym samym kanale głosowym')]});
        }

        if (!queue) return await interaction.editReply({embeds: [defaultErrorEmbed('Kolejka jest pusta')]});

        const trackNum = interaction.options.getNumber("tracknumber");
        if (trackNum > queue.tracks.length)
            return await interaction.editReply({embeds: [defaultErrorEmbed('Błędny numer utworu')]});
        queue.skipTo(trackNum - 1);

        await interaction.editReply(`✅ Skipnięto do utworu nr ${trackNum}`);
    },
}