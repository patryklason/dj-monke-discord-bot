const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Wyświetla kolejkę')
        .addNumberOption((option) =>
        option
            .setName('page')
            .setDescription('strona kolejki')
            .setMinValue(1)
        ),

    run: async ({client, interaction}) => {
        const queue = client.player.getQueue(interaction.guildId);

        if (!queue || !queue.playing)
            return await interaction.editReply('❌ Kolejka jest pusta.');

        const totalPages = Math.ceil(queue.tracks.length / 10) || 1;
        const page = (interaction.options.getNumber('page') || 1) - 1;

        if (page > totalPages)
            return await interaction.editReply(`❌ Błędna strona. Jest tylko ${totalPages} stron.`);

        const queueString = queue.tracks.slice(page * 10, page * 10 + 10).map((song, i) => {
            if (song.duration.includes("NaN"))
                return `**${page * 10 + i + 1}.** ${song.author} - ${song.title} -- <@${song.requestedBy.id}>`;
            return `**${page * 10 + i + 1}.** \`[${song.duration}]\` ${song.title} -- <@${song.requestedBy.id}>`;
        }).join('\n');

        const currentSong = queue.current;

        let embedDescription;
        if (currentSong.duration.includes("NaN"))
            embedDescription = `${currentSong.author} - ${currentSong.title} -- <@${currentSong.requestedBy.id}>`;
        else
            embedDescription = `\`[${currentSong.duration}]\` ${currentSong.title} -- <@${currentSong.requestedBy.id}>`;

        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(global.MAIN_COLOR)
                    .setDescription(`**Teraz gra...**\n` +
                        (currentSong ? embedDescription : 'Nic') +
                        `\n\n**Kolejka**\n${queueString}`
                    )
                    .setFooter({
                        text: `Strona ${page + 1} / ${totalPages}`
                    })
                    .setThumbnail(currentSong.thumbnail),
            ],
        });
    }
}