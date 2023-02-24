const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const { QueryType } = require('discord-player');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Plays the song from YT')
        .addSubcommand((subcommand) => 
        subcommand
            .setName('url')
            .setDescription('Plays a song from a url')
            .addStringOption((option) =>
                option
                    .setName('url')
                    .setDescription("Song's url")
                    .setRequired(true)
            )
        )
        .addSubcommand((subcommand) =>
        subcommand
            .setName('playlist')
            .setDescription('Plays a playlist from a url')
            .addStringOption((option) =>
                option
                    .setName('url')
                    .setDescription("Playlist's url")
                    .setRequired(true)
            )
        )
        .addSubcommand((subcommand) =>
        subcommand
            .setName('search')
            .setDescription('Searches a song')
            .addStringOption((option) =>
            option
                .setName('keywords')
                .setDescription('keywords / author / title')
                .setRequired(true)
            )
        ),
    run: async ({client, interaction}) => {

        if (!interaction.member.voice.channel)
            return interaction.editReply('❌ | you need to join the voice channel to use this command.');

        const queue = await client.player.createQueue(interaction.guild);
        global.QUEUE_GUILD = queue.guild;
        if (!queue.connection)
            await queue.connect(interaction.member.voice.channel);

        let embed = new EmbedBuilder();

        if (interaction.options.getSubcommand() === 'url') {
            let url = interaction.options.getString('url');
            const result = await client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QueryType.YOUTUBE_VIDEO,
            });

            if (result.tracks.length === 0)
                return interaction.editReply('❌ | no results');

            const song = result.tracks[0];
            await queue.addTrack(song);

            embed
                .setColor(0xf6ff00)
                .setTitle('🎶 | song added to queue')
                .setDescription(`**[${song.title}]**`)
                .setThumbnail(song.thumbnail)
                .setFooter({text: `Duration: ${song.duration}`});
        }
        else if (interaction.options.getSubcommand() === 'playlist') {
            let url = interaction.options.getString('url');
            const result = await client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QueryType.YOUTUBE_PLAYLIST,
            });

            if (result.tracks.length === 0)
                return interaction.editReply('❌ | no results');

            const playlist = result.playlist;
            await queue.addTracks(result.tracks);


            embed
                .setColor(0xf6ff00)
                .setTitle('🎶 | playlist added to queue')
                .setDescription(`**${result.tracks.length} songs from [${playlist.title}]**`)
                .setThumbnail(playlist.thumbnail);
        }
        else if (interaction.options.getSubcommand() === 'search') {
            let url = interaction.options.getString('keywords');
            const result = await client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QueryType.YOUTUBE_SEARCH,
            });

            if (result.tracks.length === 0)
                return interaction.editReply('❌ | no results');

            const song = result.tracks[0];
            await queue.addTrack(song);

            embed
                .setColor(0xf6ff00)
                .setTitle('🎶 | song added to queue')
                .setDescription(`**[${song.title}]**`)
                .setThumbnail(song.thumbnail)
                .setFooter({text: `Duration: ${song.duration}`});
        }

        if (!queue.playing)
            await queue.play();
        await interaction.editReply({
            embeds: [embed],
        });
    }
}