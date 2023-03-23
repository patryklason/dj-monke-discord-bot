const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const { QueryType } = require('discord-player-play-dl');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Plays the song from YT')
        .addStringOption(option =>
            option
                .setName('url-fraze')
                .setDescription('Fraza lub link do YT/Spotify')
                .setMinLength(1)
                .setRequired(true)
        ),
    run: async ({client, interaction}) => {

        let errorEmbed = new EmbedBuilder();

        if (!interaction.member.voice.channel) {
            errorEmbed
                .setTitle('❌  Błąd')
                .setDescription('Aby użyć tej komendy, dołącz na kanał głosowy.')
                .setColor(global.ERROR_COLOR);
            return interaction.editReply({embeds: [errorEmbed,]});
        }

        const queue = await client.player.createQueue(interaction.guild);
        global.QUEUE_GUILD = queue.guild;

        if (!queue.connection)
            await queue.connect(interaction.member.voice.channel);

        let embed = new EmbedBuilder();

        const ytUrlPattern = /^.*youtube\.com\/watch\?v=.*$/i
        const ytPlaylistPattern = /^.*youtube\.com\/playlist\?list=.*$/i
        const spotifyUrlPattern = /^.*spotify.com\/track\/.*$/i
        const scUrlPattern = /^.*soundcloud.com\/.*$/i

        const searchTerm = interaction.options.getString('url-fraze').trim();



        if (ytUrlPattern.test(searchTerm)) {

            const result = await client.player.search(searchTerm, {
                requestedBy: interaction.user,
                searchEngine: QueryType.YOUTUBE_VIDEO,
            });


            if (result.tracks.length === 0) {
                errorEmbed
                    .setTitle('❌  Brak wyników')
                    .setDescription('Małpka nie znalazła niczego, co pasowało by do twojego wyszukania :(.')
                    .setColor(global.ERROR_COLOR);
                return interaction.editReply({embeds: [errorEmbed,]});
            }

            const song = result.tracks[0];
            await queue.addTrack(song);

            embed
                .setColor(global.MAIN_COLOR)
                .setTitle('🎶  Dodano do kolejki')
                .setDescription(`**${song.title}**\n${song.author}`)
                .setThumbnail(song.thumbnail)
                .setFooter({text: `Długość: ${song.duration}`});
        }
        else if (ytPlaylistPattern.test(searchTerm)) {

            const result = await client.player.search(searchTerm, {
                requestedBy: interaction.user,
                searchEngine: QueryType.YOUTUBE_PLAYLIST,
            });


            if (result.tracks.length === 0) {
                errorEmbed
                    .setTitle('❌  Brak wyników')
                    .setDescription('Małpka nie znalazła niczego, co pasowało by do twojego wyszukania :(.')
                    .setColor(global.ERROR_COLOR);
                return interaction.editReply({embeds: [errorEmbed,]});
            }

            const playlist = result.playlist;
            await queue.addTracks(playlist.tracks);


            embed
                .setColor(global.MAIN_COLOR)
                .setTitle('🎶  playlista dodana do kolejki')
                .setDescription(`**Dodano ${result.tracks.length} utworów z [${playlist.title}]**.`);
        }
        else if (spotifyUrlPattern.test(searchTerm)) {
            const result = await client.player.search(searchTerm, {
                requestedBy: interaction.user,
                searchEngine: QueryType.SPOTIFY_SONG,
            });

            if (result.tracks.length === 0) {
                errorEmbed
                    .setTitle('❌  Brak wyników')
                    .setDescription('Małpka nie znalazła niczego, co pasowało by do twojego wyszukania :(.')
                    .setColor(global.ERROR_COLOR);
                return interaction.editReply({embeds: [errorEmbed,]});
            }

            const song = result.tracks[0];
            await queue.addTrack(song);

            embed
                .setColor(global.MAIN_COLOR)
                .setTitle('🎶  Dodano do kolejki')
                .setDescription(`${song.author} - **${song.title}**`)
                .setThumbnail(song.thumbnail)
                .setFooter({text: `Długość: ${song.duration}`});
        }

        else if (scUrlPattern.test(searchTerm)) {

            errorEmbed
                .setTitle('❌  Soundclound nie jest obsługiwany')
                .setDescription('Małpka jeszcze nie potrafi grać z Soundcloud\'a :(.')
                .setColor(global.ERROR_COLOR);
            return interaction.editReply({embeds: [errorEmbed,]});
        }

        else {
            const result = await client.player.search(searchTerm, {
                requestedBy: interaction.user,
                searchEngine: QueryType.YOUTUBE_SEARCH,
            });


            if (result.tracks.length === 0) {
                errorEmbed
                    .setTitle('❌  Brak wyników')
                    .setDescription('Małpka nie znalazła niczego, co pasowało by do twojego wyszukania :(.')
                    .setColor(global.ERROR_COLOR);
                return interaction.editReply({embeds: [errorEmbed,]});
            }

            const song = result.tracks[0];
            await queue.addTrack(song);

            embed
                .setColor(global.MAIN_COLOR)
                .setTitle('🎶  Dodano do kolejki')
                .setDescription(`**${song.title}**\n${song.author}`)
                .setThumbnail(song.thumbnail)
                .setFooter({text: `Długość: ${song.duration}`});
        }

        if (!queue.playing)
            await queue.play();
        await interaction.editReply({
            embeds: [embed],
        });

    }
}