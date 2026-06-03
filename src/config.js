const	fs = require('fs');

let	config = {
	token: process.env.TOKEN || '',
	clientId: process.env.CLIENT_ID || '',
	guildId: process.env.GUILD_ID || ''
};

if (fs.existsSync('./config.json'))
{
	try {
		const	localConfig = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
		config = {
			token: process.env.TOKEN || localConfig.token || '',
			clientId: process.env.CLIENT_ID || localConfig.clientId || '',
			guildId: process.env.GUILD_ID || localConfig.guildId || ''
		};
	} catch (error) { console.log('⚠️ config.json vacío o inválido, usando variables de entorno'); }
}

module.exports = config;
