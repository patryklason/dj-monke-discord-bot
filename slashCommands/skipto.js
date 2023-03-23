const { SlashCommandBuilder } = require('@discordjs/builders');

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

        if (!queue) return await interaction.editReply('❌ Kolejka jest pusta.');

        const trackNum = interaction.options.getNumber("tracknumber");
        if (trackNum > queue.tracks.length)
            return await interaction.editReply('❌ Błędny numer utworu.');
        queue.skipTo(trackNum - 1);

        await interaction.editReply(`✅ Skipnięto do utworu nr ${trackNum}`);
    },
}