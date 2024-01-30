const { EmbedBuilder } = require('discord.js');
const EMBED_COLORS = require('./COLORS');

const createSuccessEmbed = (title, message, thumbnail) => {
    return new EmbedBuilder()
        .setTitle(title)
        .setDescription(message)
        .setThumbnail(thumbnail)
        .setColor(EMBED_COLORS.MAIN_COLOR);
};

module.exports = createSuccessEmbed;
