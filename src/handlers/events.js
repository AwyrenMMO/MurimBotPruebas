const	{ Events, REST, Routes, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const	config = require('../config');
const	{ testGoogleSheets } = require('../services/sheetService');
const	{ cleanOldEvents } = require('../services/dataService');

function	setupReadyEvent(client)
{
	client.once(Events.ClientReady, async () => {
		console.log('✅ Bot listo');

	// Clean old events //
	cleanOldEvents();
	setInterval(cleanOldEvents, 24 * 60 * 60 * 1000);

	// Command registration //
	const	commands = [
		new SlashCommandBuilder()
		.setName('gvg')
		.setDescription('Crear evento GvG')
		.addStringOption(o => o.setName('titulo').setDescription('Título').setRequired(true))
		.addStringOption(o => o.setName('descripcion').setDescription('Descripción').setRequired(true))
		.addStringOption(o => o.setName('fecha').setDescription('Formato: 19/03/2026').setRequired(true))
		.addStringOption(o => o.setName('hora').setDescription('Formato: 22:30').setRequired(true))
		.addStringOption(o =>
			o.setName('zona')
			.setDescription('Zona horaria base del evento')
			.setRequired(true)
			.addChoices(
				{ name: 'Canarias', value: 'canarias' },
				{ name: 'Península', value: 'peninsula' }
			)
		)
		.addStringOption(o =>
			o.setName('limite')
			.setDescription('Fecha y hora límite para apuntarse. Formato: 18/03/2026 23:59')
			.setRequired(false)
		),

		new	SlashCommandBuilder()
		.setName('raid10')
		.setDescription('Crear raid de 10')
		.addStringOption(o => o.setName('titulo').setDescription('Título').setRequired(true))
		.addStringOption(o => o.setName('descripcion').setDescription('Descripción').setRequired(true))
		.addStringOption(o => o.setName('fecha').setDescription('Formato: 19/03/2026').setRequired(true))
		.addStringOption(o => o.setName('hora').setDescription('Formato: 22:30').setRequired(true))
		.addStringOption(o =>
			o.setName('zona')
			.setDescription('Zona horaria base del evento')
			.setRequired(true)
			.addChoices(
				{ name: 'Canarias', value: 'canarias' },
				{ name: 'Península', value: 'peninsula' }
			)
		),

		new	SlashCommandBuilder()
		.setName('raid5')
		.setDescription('Crear raid de 5')
		.addStringOption(o => o.setName('titulo').setDescription('Título').setRequired(true))
		.addStringOption(o => o.setName('descripcion').setDescription('Descripción').setRequired(true))
		.addStringOption(o => o.setName('fecha').setDescription('Formato: 19/03/2026').setRequired(true))
		.addStringOption(o => o.setName('hora').setDescription('Formato: 22:30').setRequired(true))
		.addStringOption(o =>
			o.setName('zona')
			.setDescription('Zona horaria base del evento')
			.setRequired(true)
			.addChoices(
				{ name: 'Canarias', value: 'canarias' },
				{ name: 'Península', value: 'peninsula' }
			)
		),

		new	SlashCommandBuilder()
		.setName('editar-evento')
		.setDescription('Editar un evento existente')
		.addStringOption(o => o.setName('mensaje_id').setDescription('ID del mensaje del evento').setRequired(true))
		.addStringOption(o => o.setName('titulo').setDescription('Nuevo título').setRequired(false))
		.addStringOption(o => o.setName('descripcion').setDescription('Nueva descripción').setRequired(false))
		.addStringOption(o => o.setName('fecha').setDescription('Nueva fecha: 19/03/2026').setRequired(false))
		.addStringOption(o => o.setName('hora').setDescription('Nueva hora: 22:30').setRequired(false))
		.addStringOption(o =>
			o.setName('zona')
			.setDescription('Nueva zona horaria')
			.setRequired(false)
			.addChoices(
				{ name: 'Canarias', value: 'canarias' },
				{ name: 'Península', value: 'peninsula' }
			)
		)
	].map(c => c.toJSON());

	const	rest = new REST({ version: '10' }).setToken(config.token);

	await rest.put( Routes.applicationGuildCommands(config.clientId, config.guildId), { body: commands });

	console.log('✅ Comandos registrados correctamente');
	await testGoogleSheets();
	});
}

module.exports = {
	setupReadyEvent
};
