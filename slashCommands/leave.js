const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('czyści kolejkę i wychodzi z kanału głosowego'),

    run: async ({ client, interaction }) => {
        const queue = client.player.getQueue(interaction.guildId);

        if (!queue) return await interaction.editReply('❌ Kolejka jest pusta.');

        clearInterval(global.lastIntervalId);
        queue.destroy();
        await interaction.editReply('👋 Pa!');
    },
}