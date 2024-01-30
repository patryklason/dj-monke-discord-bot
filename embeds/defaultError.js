const { EmbedBuilder } = require('discord.js');
const EMBED_COLORS = require('./COLORS');

const createDefaultErrorEmbed = (message) => {
    return new EmbedBuilder()
        .setTitle('❌  Błąd')
        .setDescription(message)
        .setColor(EMBED_COLORS.ERROR_COLOR);
};

module.exports = createDefaultErrorEmbed;
