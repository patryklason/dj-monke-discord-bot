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
            .setDescription('Szuka utworu po linku')
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
            .setDescription('Szuka playlisty po linku')
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
            .setDescription('Szuka piosenki po wpisanej frazie')
            .addStringOption((option) =>
            option
                .setName('keywords')
                .setDescription('keywords / author / title')
                .setRequired(true)
            )
        ),
    run: async ({client, interaction}) => {

        let errorEmbed = new EmbedBuilder();

        if (!interaction.member.voice.channel) {
            errorEmbed
                .setTitle('❌  Błąd')
                .setDescription('Aby użyć tej komendy, dołącz na kanał głosowy.')
                .setColor(0xe33e32);
            return interaction.editReply({embeds: [errorEmbed,]});
        }


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

            if (result.tracks.length === 0) {
                errorEmbed
                    .setTitle('❌  Brak wyników')
                    .setDescription('Małpka nie znalazła niczego, co pasowało by do twojego wyszukania :(.')
                    .setColor(0xe33e32);
                return interaction.editReply({embeds: [errorEmbed,]});
            }

            const song = result.tracks[0];
            await queue.addTrack(song);

            embed
                .setColor(0xf6ff00)
                .setTitle('🎶  Dodano do kolejki')
                .setDescription(`**[${song.title}]**`)
                .setThumbnail(song.thumbnail)
                .setFooter({text: `Długość: ${song.duration}`});
        }
        else if (interaction.options.getSubcommand() === 'playlist') {
            let url = interaction.options.getString('url');
            const result = await client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QueryType.YOUTUBE_PLAYLIST,
            });

            if (result.tracks.length === 0) {
                errorEmbed
                    .setTitle('❌  Brak wyników')
                    .setDescription('Małpka nie znalazła niczego, co pasowało by do twojego wyszukania :(.')
                    .setColor(0xe33e32);
                return interaction.editReply({embeds: [errorEmbed,]});
            }

            const playlist = result.playlist;
            await queue.addTracks(playlist.tracks);


            embed
                .setColor(0xf6ff00)
                .setTitle('🎶  playlista dodana do kolejki')
                .setDescription(`**${result.tracks.length} songs from [${playlist.title}]**`)
                .setThumbnail(playlist.thumbnail);
        }
        else if (interaction.options.getSubcommand() === 'search') {
            let url = interaction.options.getString('keywords');
            const result = await client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QueryType.YOUTUBE_SEARCH,
            });

            if (result.tracks.length === 0) {
                errorEmbed
                    .setTitle('❌  Brak wyników')
                    .setDescription('Małpka nie znalazła niczego, co pasowało by do twojego wyszukania :(.')
                    .setColor(0xe33e32);
                return interaction.editReply({embeds: [errorEmbed,]});
            }

            const song = result.tracks[0];
            await queue.addTrack(song);

            embed
                .setColor(0xf6ff00)
                .setTitle('🎶  Dodano do kolejki')
                .setDescription(`**[${song.title}]**`)
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