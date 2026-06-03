const	{ EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const	{ formatList, cleanButtonLabel } = require('../utils/helpers');
const	{ getEventConfigByType } = require('./eventService');
const	{ ASSIST_TEXT } = require('../constants/emojis');

function	formatRoleCount(event, role)
{
	if (event.showMax && event.max[role]) { return (`(${event.roles[role].length}/${event.max[role]})`); }
	return (`(${event.roles[role].length})`);
}

function	createEmbed(event)
{
	const	embed = new EmbedBuilder()
	.setColor(event.color)
	.setTitle(event.title)
	.setDescription(event.description)
	.addFields({
		name: 'Hora',
		value: `<t:${event.timestamp}:F>\n<t:${event.timestamp}:R>`,
		inline: false
	});

	if (event.limiteTimestamp)
	{
		embed.addFields({
			name: '⏳ Límite para apuntarse',
			value: `<t:${event.limiteTimestamp}:F>\n<t:${event.limiteTimestamp}:R>`,
			inline: false
		});
	}

	for(const r of event.order)
	{
		embed.addFields({
			name: `${event.labels[r]} ${formatRoleCount(event, r)}`,
			value: formatList(event.roles[r]),
			inline: true
		});
	}

	if (event.showMax)
	{
		embed.addFields({
			name: 'Asistencia',
			value: ASSIST_TEXT,
			inline: false
		});
	}

	embed.setFooter( { text: `Creado por ${event.creator} • ID: ${event.messageId || 'pendiente'}` } );
	
	return (embed);
}

function	buildRows(cfg, id)
{
	const	buttons = cfg.order.map(r =>
		new	ButtonBuilder()
			.setCustomId(`${r}_${id}`)
			.setLabel(cleanButtonLabel(cfg.labels[r]))
			.setStyle(cfg.styles[r])
	);

	const	rows = [];
	for(let i = 0; i < buttons.length; i += 5)
		rows.push(new ActionRowBuilder().addComponents(buttons.slice(i, i + 5)));

	return (rows);
}

async function	updateStoredEventMessage(client, event)
{
	try {
		const	channel = await client.channels.fetch(event.channelId).catch(() => null);
		if (!channel) { console.warn(`⚠️ Canal ${event.channelId} no encontrado`); return; }

		const	message = await channel.messages.fetch(event.messageId).catch(() => null);
		if (!message) { console.warn(`⚠️ Mensaje ${event.messageId} no encontrado`);  return; }

		const	cfg = getEventConfigByType(event.type);
		if (!cfg) { console.warn(`⚠️ Configuración para tipo ${event.type} no encontrada`); return; }

		await message.edit({
			embeds: [createEmbed(event)],
			components: buildRows(cfg, event.id)
		});
	}
	catch (error) { console.error(`❌ Error actualizando mensaje del evento:`, error.message); }
}

module.exports = {
	createEmbed,
	buildRows,
	formatRoleCount,
	updateStoredEventMessage
};
