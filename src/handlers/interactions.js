const	{ Events } = require('discord.js');
const	{ getData, saveData } = require('../services/dataService');
const	{ getEventConfigByType, removeAll, createEvent } = require('../services/eventService');
const	{ buildRows, createEmbed, updateStoredEventMessage } = require('../services/discordService');
const	{ canUseGvg, canEditEvent, parseEventDate, findRole } = require('../utils/validation');
const	{ getName } = require('../utils/helpers');

async function	handleGvgCommand(client, interaction)
{
	if (!canUseGvg(interaction))
		return interaction.reply( { content: 'No tienes permisos para usar el comando /gvg.', ephemeral: true } );

	const	cfg = getEventConfigByType('gvg');
	const	result = createEvent(interaction, cfg);

	if (!result || result.error)
		return interaction.reply( { content: result?.error || 'No se pudo crear el evento.', ephemeral: true } );

	const	data = getData();
	const	eventData = result.event;

	// Roles inizialitation
	for(const r of cfg.order)
		eventData.roles[r] = [];

	data[result.id] = eventData;

	await interaction.reply( { embeds: [createEmbed(eventData)], components: buildRows(cfg, result.id) } );

	const	replyMessage = await interaction.fetchReply();
	data[result.id].messageId = replyMessage.id;
	data[result.id].channelId = replyMessage.channelId;
	saveData();

	await replyMessage.edit( { embeds: [createEmbed(data[result.id])], components: buildRows(cfg, result.id)} );

	// Dinamicly importation to prevent circular dependention
	const { createEventSheet } = require('../services/sheetOperations');
	await createEventSheet(data[result.id]);
}

async function	handleRaidCommand(client, interaction, raidType)
{
	const	cfg = getEventConfigByType(raidType);
	const	result = createEvent(interaction, cfg);

	if (!result || result.error)
		return interaction.reply( { content: result?.error || 'No se pudo crear el evento.', ephemeral: true } );

	const	data = getData();
	const	eventData = result.event;

	// Role inizialitation
	for(const r of cfg.order)
		eventData.roles[r] = [];

	data[result.id] = eventData;

	await interaction.reply( { embeds: [createEmbed(eventData)], components: buildRows(cfg, result.id) } );

	const	replyMessage = await interaction.fetchReply();
	data[result.id].messageId = replyMessage.id;
	data[result.id].channelId = replyMessage.channelId;
	saveData();

	await replyMessage.edit( { embeds: [createEmbed(data[result.id])], components: buildRows(cfg, result.id) } );
}

async function	handleEditCommand(client, interaction)
{
	const	data = getData();
	const	mensajeId = interaction.options.getString('mensaje_id');
	const	event = Object.values(data).find(e => e.messageId === mensajeId);

	if (!event)
		return interaction.reply( { content: 'No encontré ningún evento con ese mensaje_id.', ephemeral: true } );


	if (!canEditEvent(interaction, event))
	{
		return (interaction.reply({
			content: 'Solo el creador del evento o alguien con permisos de gestionar servidor puede editarlo.',
			ephemeral: true
		}));
	}

	const	nuevoTitulo = interaction.options.getString('titulo');
	const	nuevaDescripcion = interaction.options.getString('descripcion');
	const	nuevaFecha = interaction.options.getString('fecha');
	const	nuevaHora = interaction.options.getString('hora');
	const	nuevaZona = interaction.options.getString('zona');

	let	changed = false;

	if (nuevoTitulo) { event.title = nuevoTitulo; changed = true; }

	if (nuevaDescripcion) { event.description = nuevaDescripcion; changed = true; }

	const	fechaFinal = nuevaFecha || event.fecha;
	const	horaFinal = nuevaHora || event.hora;
	const	zonaFinal = nuevaZona || event.zona;

	if (nuevaFecha || nuevaHora || nuevaZona)
	{
		const	dt = parseEventDate(fechaFinal, horaFinal, zonaFinal);

		if (!dt)
			return (interaction.reply( { content: 'La nueva fecha/hora/zona no es válida.',  ephemeral: true } ));

		event.fecha = fechaFinal;
		event.hora = horaFinal;
		event.zona = zonaFinal;
		event.timestamp = Math.floor(dt.toSeconds());
		changed = true;
	}

	if (!changed)
		return (interaction.reply( { content: 'No has indicado ningún cambio.', ephemeral: true } ));

	saveData();
	await updateStoredEventMessage(client, event);

	if (event.type === 'gvg' && event.sheetTitle)
	{
		const	{ updateGvgEventSheet } = require('../services/sheetOperations');
		await updateGvgEventSheet(event);
	}

	return (interaction.reply( { content: 'Evento editado correctamente.', ephemeral: true } ));
}

async function	handleButtonPress(client, interaction)
{
	const	data = getData();
	const	[role, id] = interaction.customId.split('_');
	const	event = data[id];

	if (!event)
		return (interaction.reply( { content: 'Este evento ya no existe o no se encontró.', ephemeral: true } ));

	if (event.limiteTimestamp)
	{
		const	now = Math.floor(Date.now() / 1000);
		if (now > event.limiteTimestamp)
		{
			return interaction.reply({
			content: '⛔ El plazo para apuntarse a este evento ha terminado.',
			ephemeral: true });
		}
	}

	const	user = getName(interaction);
	const	current = findRole(event, user);

	if (current === role) { removeAll(event, user); }
	else
	{
		if (event.max[role] && event.roles[role].length >= event.max[role])
		{
			return interaction.reply({
			content: 'Ese rol ya está lleno',
			ephemeral: true });
		}
		removeAll(event, user);
		event.roles[role].push(user);
	}

	saveData();
	const	cfg = getEventConfigByType(event.type);

	if (event.type === 'gvg' && event.sheetTitle)
	{
		const	{ updateGvgEventSheet } = require('../services/sheetOperations');
		await updateGvgEventSheet(event);
	}

	return (interaction.update( { embeds: [createEmbed(event)], components: buildRows(cfg, id) } ));
}

function	setupInteractionHandler(client)
{
	client.on(Events.InteractionCreate, async interaction => {
		try {
			if (interaction.isChatInputCommand())
			{
				if (interaction.commandName === 'gvg')
					await handleGvgCommand(client, interaction);
				else if (['raid10', 'raid5'].includes(interaction.commandName))
					await handleRaidCommand(client, interaction, interaction.commandName);
				else if (interaction.commandName === 'editar-evento')
					await handleEditCommand(client, interaction);
			}
			else if (interaction.isButton())
				await handleButtonPress(client, interaction);
			}
		catch (error) {
			console.error('❌ ERROR EN INTERACTIONCREATE:', error);
			if (interaction.deferred || interaction.replied)
			{
				try {
					await interaction.followUp({
					content: 'Ha ocurrido un error al procesar el comando.',
					ephemeral: true });
				}
				catch {}
			}
			else
			{
				try {
					await interaction.reply({
					content: 'Ha ocurrido un error al procesar el comando.',
					ephemeral: true });
				}
				catch {}
			}
		}
	});
}

module.exports = {
	setupInteractionHandler
};
