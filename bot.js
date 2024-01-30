const Discord = require('discord.js');
const dotenv = require('dotenv');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
const { Player } = require('discord-player-play-dl');
const {EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder} = require("discord.js");
const {MAIN_COLOR} = require("./embeds/COLORS");

// Loading the bot's token from .env
dotenv.config();
let TOKEN = process.env.TOKEN;
let GUILD_ID = process.env.GUILD_ID;
let CLIENT_ID = process.env.CLIENT_ID;

// when running for the first time, load and deploy the slash commands
// to run, use 'node bot.js load' in terminal
const LOAD_SLASH = process.argv[2] === 'load';

// start testing instance or deploy commands for testing instance
const TEST_ENVIRONMENT = process.argv[2] === 'test' || process.argv[3] === 'test';
if (TEST_ENVIRONMENT) {
    TOKEN = process.env.TEST_TOKEN;
    GUILD_ID = process.env.TEST_GUILD_ID;
    CLIENT_ID = process.env.TEST_CLIENT_ID;
}


// variables for 'now playing' embed editing
let lastSong;
let lastIntervalId;
let lastMessage;


const client = new Discord.Client({
    intents: [
        'Guilds',
        'GuildVoiceStates',
    ],
});


client.slashCommands = new Discord.Collection();
client.player = new Player(client, {
   connectionTimeout: 30,
});

// load slash commands from files
let commands = [];

const slashFiles = fs.readdirSync('./slashCommands').filter(file => file.endsWith('.js'));

for (const file of slashFiles) {
    const slashCmd = require(`./slashCommands/${file}`);
    client.slashCommands.set(slashCmd.data.name, slashCmd);

    if (LOAD_SLASH)
        commands.push(slashCmd.data.toJSON())
}

if (LOAD_SLASH) {
    const rest = new REST({version: '9'}).setToken(TOKEN);
    console.log('Deploying slash commands...');
    rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {body: commands})
        .then(() => {
            console.log('Slash commands successfully deployed.');
        })
        .catch((e) => {
            console.log(`Error deploying slash commands: ${e}`);
            process.exit(1);
        });
}
else {
    client.on('ready', () => {
        client.user.setPresence({
            activities: [{ name: 'Use /help !', type: Discord.ActivityType.Listening }],
            status: 'online'
        });
        console.log('Bot successfully logged in.');
    });




    client.on('interactionCreate', (interaction) => {
        async function handleCommand() {
            if (interaction.isButton()) {
                const slashCmd = client.slashCommands.get(interaction.customId);
                if (!slashCmd) interaction.reply('❌ Błędna komenda!');
                await interaction.deferReply();
                await slashCmd.run({client, interaction});
                return;
            }

            if (!interaction.isCommand())
                return;

            const slashCmd = client.slashCommands.get(interaction.commandName);
            if (!slashCmd) interaction.reply('❌ Błędna komenda!');

            // gives more time for bot to respond (discord gives 3 seconds by default)
            await interaction.deferReply();
            await slashCmd.run({client, interaction});

            global.TEXT_CHANNEL_ID = interaction.channel.id;
        }

        handleCommand().catch(e => {
            console.log(e)
        });
    });
    client.login(TOKEN)
        .catch(e => {
            console.log(`Error logging in the client: ${e}`);
        })



    client.player.on('trackStart', () => {

        const queue = client.player.getQueue(GUILD_ID);
        const song = queue.current;

        if (song === lastSong)
            return;

        lastSong = song;
        let embed = new EmbedBuilder;

        const isSpotifySong = song.duration.includes("NaN");

        if (isSpotifySong) {
            embed
                .setColor(MAIN_COLOR)
                .setTitle('🎶  Teraz gra...')
                .setDescription(`${song.author} - **${song.title}**`)
                .setThumbnail(song.thumbnail);
        }
        else {
            let bar = queue.createProgressBar({
                queue: false,
                length: 22,
            });

            embed
                .setColor(MAIN_COLOR)
                .setTitle('🎶  Teraz gra...')
                .setDescription(`**${song.title}**\n${song.author}\n\n  ${bar}  ${song.duration}`)
                .setThumbnail(song.thumbnail);
        }

        const previous = new ButtonBuilder()
            .setCustomId('previous')
            .setLabel('⏮️')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true);

        const pause = new ButtonBuilder()
            .setCustomId('pause')
            .setLabel('⏸️')
            .setStyle(ButtonStyle.Secondary);

        const resume = new ButtonBuilder()
            .setCustomId('resume')
            .setLabel('▶️')
            .setStyle(ButtonStyle.Secondary);

        const next = new ButtonBuilder()
            .setCustomId('skip')
            .setLabel('⏭️')
            .setStyle(ButtonStyle.Secondary);




        client.channels.cache.get(TEXT_CHANNEL_ID).send({embeds: [embed]})
            .then(message => {
                lastMessage = message;
                if (isSpotifySong)
                    return;

                const intervalTime = 1000;
                lastIntervalId = setInterval(() => {

                    if (!queue.playing)
                        return;

                    const bar = queue.createProgressBar({
                        queue: false,
                        length: 22,
                    });

                    const currentTimestamp = queue.getPlayerTimestamp().current

                    embed.setDescription(`**${song.title}**\n${song.author}\n\n${currentTimestamp}  ${bar}  ${song.duration}`);

                    let row;
                    if (!queue.connection.paused) {
                        row = new ActionRowBuilder()
                            .addComponents(previous, pause, next);
                    } else {
                        row = new ActionRowBuilder()
                            .addComponents(previous, resume, next);
                    }


                    message.edit({embeds: [embed], components: [row]});

                }, intervalTime);
            })
            .catch(e => console.log(e));

        console.log('Bot is playing song!');
    });

    client.player.on('trackEnd', () => {
        try{
            console.log('Bot stopped playing a song');
            clearInterval(lastIntervalId);
            lastIntervalId = null;
            console.log(lastMessage);
            lastMessage.delete();
            lastMessage = null;
        } catch (e) {
            console.log(e);
        }

    });

    client.player.on('error', (queue, e) => {
        console.log(e);
    });


    client.on('error', (e) => {
        console.log(e);
    });

    client.on('connectionError', (e) => {
        console.log(e);
    });

    client.player.on('connectionError', (e) => {
        console.log(e);
    });
}

