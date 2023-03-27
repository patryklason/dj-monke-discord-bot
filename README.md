# DJ Monke - Discord music bot
Music Bot for private Discord server, playing songs from YouTube or Spotify.
## Available Commands
- /play - plays a song from YouTube/Spotify or playlist from YouTube
- /queue - displays the queue
- /pause - pauses the current song
- /resume - resumes the current song
- /skip - skips the current song
- /skipto - skips to selected song in the queue
- /leave - clears the queue and leaves

## How to install and run project
1. clone the repository
2. add .env file to the main directory
```
TOKEN=<YOUR_DISCORD_APP_TOKEN>
GUILD_ID=<YOUR_DISCORD_SERVER_ID>
```
3. run:
```
npm install
```
4. to deploy slash commands, run:
```
node bot.js load
```
5. to start the bot, run:
```
node bot.js
```
