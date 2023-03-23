const Discord = require('discord.js');
const dotenv = require('dotenv');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
const { Player } = require('discord-player-play-dl');
const {EmbedBuilder} = require("discord.js");

// Loading the bot's token from .env
dotenv.config();
const TOKEN = process.env.TOKEN;
const GUILD_ID = process.env.GUILD_ID

// when running for the first time, load and deploy the slash commands
// to run, use 'node bot.js load' in terminal
const LOAD_SLASH = process.argv[2] === 'load';

// colors for embeds
global.MAIN_COLOR = 0xffd553;
global.ERROR_COLOR = 0xe33e32;

// variables for 'now playing' embed editing
let lastSong;
let lastIntervalId;
let lastMessage;

// application id
const CLIENT_ID = '1056694080136024205';
// discord server id - this should be changed

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
            activities: [{ name: 'Użyj /help !', type: Discord.ActivityType.Listening }],
            status: 'online',
        });
        console.log('Bot successfully logged in.');
    });


    client.on('interactionCreate', (interaction) => {
        async function handleCommand() {
            if (!interaction.isCommand())
                return;

            const slashCmd = client.slashCommands.get(interaction.commandName);
            if (!slashCmd) interaction.reply('❌ Błędna komenda!');

            // gives more time for bot to respond (discord gives 3 seconds by default)
            await interaction.deferReply();
            await slashCmd.run({client, interaction});

            global.TEXT_CHANNEL_ID = interaction.channel.id;
        }
        handleCommand();
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
                .setColor(global.MAIN_COLOR)
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
                .setColor(global.MAIN_COLOR)
                .setTitle('🎶  Teraz gra...')
                .setDescription(`**${song.title}**\n\n0:00  ${bar}  ${song.duration}`)
                .setThumbnail(song.thumbnail);
        }


        client.channels.cache.get(TEXT_CHANNEL_ID).send({embeds: [embed]})
            .then(message => {
                lastMessage = message;
                if (isSpotifySong)
                    return;

                global.lastIntervalId = lastIntervalId = setInterval(() => {

                    if (!queue.playing)
                        return;

                    bar = bar = queue.createProgressBar({
                        queue: false,
                        length: 22,
                    });

                    embed.setDescription(`**${song.title}**\n${song.author}\n\n0:00  ${bar}  ${song.duration}`);

                    message.edit({embeds: [embed]});
                }, 9000);
            })
            .catch(e => console.log(e));

        console.log('Bot is playing song!');
    });

    client.player.on('trackEnd', () => {
        try{
            clearInterval(lastIntervalId);
        } catch (e) {
            console.log(e);
        }

        lastMessage.delete();
    });

    client.on('error', (e) => {
        console.log(e);
    });

    client.on('connectionError', (e) => {
        console.log(e);
    });

}

