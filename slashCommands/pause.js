const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('pauzuje utwór'),

    run: async ({ client, interaction }) => {
        const queue = client.player.getQueue(interaction.guildId);

        if (!queue) return await interaction.editReply('❌ Kolejka jest pusta.');

        queue.setPaused(true);
        await interaction.editReply('✅ Zapauzowano.');
    },
}