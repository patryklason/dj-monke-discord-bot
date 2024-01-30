const { SlashCommandBuilder } = require('@discordjs/builders');
const { QueryType } = require('discord-player-play-dl');
const defaultErrorEmbed = require("../embeds/defaultError");
const songErrorEmbed = require("../embeds/errorSongNotFound");
const songAddedEmbed = require('../embeds/song');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Plays the song from YT')
        .addStringOption(option =>
            option
                .setName('search-term')
                .setDescription('Fraza lub link do YT/Spotify')
                .setMinLength(1)
                .setRequired(true)
        ),
    run: async ({client, interaction}) => {

        if (!interaction.member.voice.channel) {
            return interaction.editReply({embeds: [defaultErrorEmbed('Aby użyć tej komendy, dołącz na kanał głosowy.')]});
        }


        const queue = await client.player.createQueue(interaction.guild);
        global.QUEUE_GUILD = queue.guild;

        if (!queue.connection)
            await queue.connect(interaction.member.voice.channel);

        const embedContent = {
            title: '🎶  Dodano do kolejki',
            description: '',
            thumbnail: null,
            footer: ''
        };

        const ytUrlPattern = /https?:\/\/(?:www\.|music\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-_]*)(&(amp;)?[\w?=]*)?/;
        const ytPlaylistPattern = /^.*youtube\.com\/playlist\?list=.*$/i
        const spotifyUrlPattern = /^.*spotify.com\/track\/.*$/i
        const scUrlPattern = /^.*soundcloud.com\/.*$/i

        const searchTerm = interaction.options.getString('search-term').trim();


        if (ytUrlPattern.test(searchTerm)) {

            const result = await client.player.search(searchTerm, {
                requestedBy: interaction.user,
                searchEngine: QueryType.YOUTUBE_VIDEO,
            });


            if (result.tracks.length === 0) {
                return interaction.editReply({embeds: [songErrorEmbed()]});
            }

            const song = result.tracks[0];
            await queue.addTrack(song);

            embedContent.title = '🎶  Dodano do kolejki';
            embedContent.description = `**${song.title}**\n${song.author}`;
            embedContent.thumbnail = song.thumbnail;
            embedContent.footer = `Długość: ${song.duration}`;
        }
        else if (ytPlaylistPattern.test(searchTerm)) {

            const result = await client.player.search(searchTerm, {
                requestedBy: interaction.user,
                searchEngine: QueryType.YOUTUBE_PLAYLIST,
            });


            if (result.tracks.length === 0) {
                return interaction.editReply({embeds: [songErrorEmbed()]});
            }

            const playlist = result.playlist;
            await queue.addTracks(playlist.tracks);
            embedContent.description = `**Dodano ${result.tracks.length} utworów z [${playlist.title}]**.`;
        }
        else if (spotifyUrlPattern.test(searchTerm)) {
            const result = await client.player.search(searchTerm, {
                requestedBy: interaction.user,
                searchEngine: QueryType.SPOTIFY_SONG,
            });

            if (result.tracks.length === 0) {
                return interaction.editReply({embeds: [songErrorEmbed()]});
            }

            const song = result.tracks[0];
            await queue.addTrack(song);

            embedContent.description = `${song.author} - **${song.title}**`;
            embedContent.thumbnail = song.thumbnail;
        }

        else if (scUrlPattern.test(searchTerm)) {
            return interaction.editReply({embeds: [defaultErrorEmbed('Soundcloud nie jest obsługiwany. Małpka za głupia na takie rzeczy:(')]});
        }

        else {
            const result = await client.player.search(searchTerm, {
                requestedBy: interaction.user,
                searchEngine: QueryType.YOUTUBE_SEARCH,
            });


            if (result.tracks.length === 0) {
                return interaction.editReply({embeds: [songErrorEmbed()]});
            }

            const song = result.tracks[0];
            await queue.addTrack(song);

            embedContent.description = `**${song.title}**\n${song.author}`;
            embedContent.thumbnail = song.thumbnail;
            embedContent.footer = `Długość: ${song.duration}`;
        }

        if (!queue.playing)
            await queue.play();
        await interaction.editReply({
            embeds: [songAddedEmbed(embedContent.title, embedContent.description, embedContent.thumbnail, embedContent.footer)],
        });

    }
}