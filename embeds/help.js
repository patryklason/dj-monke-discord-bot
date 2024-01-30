const { EmbedBuilder } = require('discord.js');
const EMBED_COLORS = require('./COLORS');

const createHelpEmbed = () => {
    return new EmbedBuilder()
        .setTitle('Cześć 👋')
        .setDescription('**Lista Komend**\n' +
            '● /play - wyszukuje utwór/playliste z YT lub utwór ze Spotify\n' +
            '● /queue - wyświetla kolejkę\n' +
            '● /queue [nr strony] - wyświetla odpowiednią stronę kolejki\n' +
            '● /pause - pauzuje utwór\n' +
            '● /resume - wznawia utwór\n' +
            '● /skip - skipuje aktualny utwór\n' +
            '● /skipto - skipuje kolejke do utworu o podanym numerze\n' +
            '● /leave - czyści kolejke i opuszcza kanał głosowy\n'
        )
        .setImage('https://img.freepik.com/premium-vector/cute-monkey-holding-banana-icon-illustration-animal-icon-concept-isolated-flat-cartoon-style_138676-1266.jpg?w=2000')
        .setFooter({text: `Wszelkie błędy zgłaszaj do @LmOFF276#3105`})
        .setColor(EMBED_COLORS.MAIN_COLOR);
};

module.exports = createHelpEmbed;
