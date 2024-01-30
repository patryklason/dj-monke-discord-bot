const { SlashCommandBuilder } = require('@discordjs/builders');
const defaultErrorEmbed = require('../embeds/defaultError');
const successEmbed = require('../embeds/success');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("skip")
        .setDescription("Skipuje aktualny utwór"),

    run: async ({ client, interaction }) => {
        const queue = client.player.getQueue(interaction.guildId);

        if (!interaction.guild.members.me.voice.channel || !interaction.member.voice.channel || interaction.guild.members.me.voice.channel.id !== interaction.member.voice.channel.id) {
            return interaction.editReply({embeds: [defaultErrorEmbed('Aby wykonać tę akcję musisz być na tym samym kanale głosowym')]});
        }

        if (!queue) {
            return interaction.editReply({embeds: [defaultErrorEmbed('Brak utworów w kolejce')]});
        }

        const currentSong = queue.current;
        queue.skip();

        await interaction.editReply({
            embeds: [successEmbed('⏭️  Pominięto', `${currentSong.title}, przez ${interaction.user}`, currentSong.thumbnail)]
        });
    },
};