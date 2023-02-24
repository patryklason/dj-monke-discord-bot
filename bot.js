const Discord = require('discord.js');
const dotenv = require('dotenv');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
const { Player } = require('discord-player');

// Loading the bot's token from .env
dotenv.config();
const TOKEN = process.env.TOKEN;

// if running for the first time, load and deploy the slash commands
// to run, use 'node bot.js load' command
const LOAD_SLASH = process.argv[2] === 'load';

// application id
const CLIENT_ID = '1056694080136024205';
// discord server id - this should be changed
const GUILD_ID = '941059254742298684';

const client = new Discord.Client({
    intents: [
        'Guilds',
        'GuildVoiceStates',
    ],
});

client.slashCommands = new Discord.Collection();
client.player = new Player(client, {
   ytdlOptions: {
       quality: 'highestaudio',
       highWaterMark: 1 << 25,
   }
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
        console.log('Bot successfully logged in.');
    });

    client.on('interactionCreate', (interaction) => {
        async function handleCommand() {
            if (!interaction.isCommand())
                return;

            const slashCmd = client.slashCommands.get(interaction.commandName);
            if (!slashCmd) interaction.reply('Invalid command!');

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
        client.channels.cache.get(TEXT_CHANNEL_ID).send({content: 'playing now...'});
        console.log('Bot is playing song!');
    });

    client.player.on('trackEnd', () => {
        const queue = client.player.getQueue(QUEUE_GUILD);
        if (!queue.playing) {
            queue.play()
                .catch(e => {
                    console.log(`Error playing next song in the queue: ${e}`);
                });
        }
    });
}

