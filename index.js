const { Client } = require('discord.js');
const { TOKEN, PREFIX} = require('./config');
const ytdl = require('ytdl-core');

const client = new Client({ disableEveryone: true });

client.on('warn', console.warn);

client.on('error', console.error);

client.on('ready', () => console.log(`Logged in as ${client.user.tag}!`));

client.on('disconnect', () => console.log('I just disconnected, making sure you know, I will reconnect soon...'));

client.on('reconnecting', () => console.log('I am reconnecting now!'));

client.on('message', async msg => {
    if (msg.author.bot) return undefined;
    if (!msg.content.startsWith(PREFIX)) return undefined;
    const args = msg.content.split(' ');

    if (msg.content.startsWith(`${PREFIX}play`)) {
        const voiceChannel = msg.member.voiceChannel;
        if (!voiceChannel) return msg.channel.send('I\'m sorry but you need to be in a voice channel to play music!');
        const permissions = voiceChannel.permissionsFor(msg.client.user);
        if (!permissions.has(`CONNECT`)) {
            return msg.channel.send('I cannot connect to the voice channel, make sure I have the proper permissions');
        }
        if (!permissions.has(`SPEAK`)) {
            return msg.channel.send('I cannot speak in this voice channel, make sure I have the proper permissions');
        }
        
        try {
            var connection = await voiceChannel.join();
        } catch (error) {
            console.error(`I could not join the voice channel: ${error}`);
            return msg.channel.send(`I could not join the voice channel: ${error}`);
        }

        const dispatcher = connection.playStream(ytdl(args[1]))
            .on('end', () => {
                console.log('song ended!');
                voiceChannel.leave();
            })
            .on('error', error => {
                console.error('error');
            });
        dispatcher.setVolumeLogarithmic(5 / 5);
    } else if (msg.content.startsWith(`${PREFIX}stop`)) {
        if (!msg.member.voiceChannel) return msg.channel.send('You are not in a voice channel!');
        msg.member.voiceChannel.leave();
        return undefined;
    }
});

client.login(TOKEN);