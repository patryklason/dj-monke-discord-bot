const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('wznawia utwór'),

    run: async ({ client, interaction }) => {
        const queue = client.player.getQueue(interaction.guildId);

        if (!queue) return await interaction.editReply('❌ Kolejka jest pusta.');

        queue.setPaused(false);
        await interaction.editReply('✅ Wznowiono.');
    },
}