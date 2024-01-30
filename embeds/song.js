const { EmbedBuilder } = require('discord.js');
const EMBED_COLORS = require('./COLORS');

const createSongEmbed = (title, message, thumbnail, footerText) => {
    return new EmbedBuilder()
        .setTitle(title)
        .setDescription(message)
        .setThumbnail(thumbnail)
        .setFooter({text: footerText})
        .setColor(EMBED_COLORS.MAIN_COLOR);
};

module.exports = createSongEmbed;
