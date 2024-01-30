const { SlashCommandBuilder } = require('@discordjs/builders');
const helpEmbed = require('../embeds/help');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('wyświetla listę komend'),

    run: async ({ client, interaction }) => {
        await interaction.editReply({embeds: [helpEmbed()]});
    },
}