const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("skip")
        .setDescription("Skipuje aktualny utwór"),

    run: async ({ client, interaction }) => {
        const queue = client.player.getQueue(interaction.guildId);

        let errorEmbed = new EmbedBuilder();

        if (!queue) {
            errorEmbed
                .setTitle('❌  Błąd')
                .setDescription('Brak utworów w kolejce.')
                .setColor(0xe33e32);
            return interaction.editReply({embeds: [errorEmbed,]});
        }

        const currentSong = queue.current;

        queue.skip();

        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle('⏭️  Skipnięto')
                    .setDescription(`${currentSong.title}`)
                    .setThumbnail(currentSong.thumbnail)
                    .setColor(0xf6ff00),
            ]
        });
    },
}