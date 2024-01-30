const { EmbedBuilder } = require('discord.js');
const EMBED_COLORS = require('./COLORS');

const createSongErrorEmbed = () => {
    return new EmbedBuilder()
        .setTitle('❌  Brak wyników')
        .setDescription('Małpka naprawdę się starała, ale nie znalazła niczego co pasowałoby do twojego wyszukiwania:(')
        .setColor(EMBED_COLORS.ERROR_COLOR);
};

module.exports = createSongErrorEmbed;
