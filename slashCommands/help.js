const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('wyświetla listę komend'),

    run: async ({ client, interaction }) => {

        const ownerId = 317365622558162947;
        let embed = new EmbedBuilder();
        embed
            .setColor(global.MAIN_COLOR)
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
            .setFooter({text: `Wszelkie błędy zgłaszaj do @LmOFF276#3105`});

        await interaction.editReply({embeds: [embed]});
    },
}