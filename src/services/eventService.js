const	{ CONFIGS } = require('../constants/events');
const	{ parseEventDate } = require('../utils/validation');
const	{ getZoneLabel } = require('../constants/zones');

function	getEventConfigByType(type) { return CONFIGS[type] || null; }

function	removeAll(event, user)
{
	Object.keys(event.roles).forEach(r => {
		event.roles[r] = event.roles[r].filter(x => x !== user);
	});
}

function	createEvent(interaction, cfg)
{
	if (!cfg) { return ({ error: 'No se encontró la configuración del evento.' }); }

	const	fecha = interaction.options.getString('fecha');
	const	hora = interaction.options.getString('hora');
	const	zona = interaction.options.getString('zona');
	const	limite = cfg.type === 'gvg' ? interaction.options.getString('limite') : null;

	const	dt = parseEventDate(fecha, hora, zona);
	if (!dt) { return ({ error: 'Fecha u hora no válidas. Usa fecha tipo 19/03/2026 y hora tipo 22:30.' }); }

	let	limiteTimestamp = null;
	if(limite)
	{
		const	{ DateTime } = require('luxon');
		const	{ ZONES } = require('../constants/zones');
		const	limitDt = DateTime.fromFormat(
			limite,
			'dd/MM/yyyy HH:mm',
			{ zone: ZONES[zona] }
		);
		if (!limitDt.isValid) { return ({ error: 'Fecha límite no válida. Usa formato: 18/03/2026 23:59.' }); }
		limiteTimestamp = Math.floor(limitDt.toSeconds());
	}

	const	id = Date.now().toString();
	const	{ getName } = require('../utils/helpers');

	return ({
	id,
	event: {
		id,
		type: cfg.type,
		title: interaction.options.getString('titulo'),
		description: interaction.options.getString('descripcion'),
		fecha,
		hora,
		zona,
		timestamp: Math.floor(dt.toSeconds()),
		limite,
		limiteTimestamp,
		creator: getName(interaction),
		creatorId: interaction.user.id,
		channelId: interaction.channelId,
		messageId: null,
		color: cfg.color,
		showMax: cfg.showMax,
		roles: {},
		max: cfg.max,
		labels: cfg.labels,
		order: cfg.order,
		sheetTitle: null
	}
	});
}

function	buildGvgGroupsAndLists(event)
{
	const	tanks = event.roles.tank.map(name => ({ name, role: 'tank' }));
	const	healers = event.roles.healer.map(name => ({ name, role: 'healer' }));
	const	dpsPool = [
		...event.roles.dps.map(name => ({ name, role: 'dps' })),
		...event.roles.ranged.map(name => ({ name, role: 'ranged' }))
	];

	const	groups = Array.from({ length: 6 }, () => []);
	for(let i = 0; i < 6; i++)
		if (healers.length > 0) { groups[i].push(healers.shift()); }

	for(let i = 0; i < 6; i++)
		if (tanks.length > 0) { groups[i].unshift(tanks.shift()); }

	for(let i = 0; i < 6; i++)
		while (groups[i].length < 5 && dpsPool.length > 0) { groups[i].push(dpsPool.shift()); }

	if (healers.length > 0 && groups[0].length < 5) { groups[0].push(healers.shift()); }
	if (healers.length > 0 && groups[1].length < 5) { groups[1].push(healers.shift()); }
	for(let i = 0; i < 6; i++)
		while (groups[i].length < 5 && dpsPool.length > 0) { groups[i].push(dpsPool.shift()); }

	const	mains = [];
	groups.forEach(group => { group.forEach(player => mains.push(player.name)); });

	const	mainsSet = new Set(mains);

	const	generalRows = [];
	const	orderedRoles = ['tank', 'healer', 'dps', 'ranged', 'tentative'];

	for(const roleKey of orderedRoles)
		for(const name of event.roles[roleKey])
		{
			let	status = 'Suplente';
			if (roleKey === 'tentative') { status = 'Pendiente'; }
			else if (mainsSet.has(name)) { status = 'Main'; }
			const	{ getRoleDisplayName } = require('../utils/helpers');
			generalRows.push([name, getRoleDisplayName(roleKey), status, roleKey]);
		}

	const	suplentes = [];
	for(const tank of tanks)
	{
		const	{ getRoleDisplayName } = require('../utils/helpers');
		suplentes.push([tank.name, getRoleDisplayName(tank.role), 'Suplente', tank.role]);
	}
	for(const healer of healers)
	{
		const	{ getRoleDisplayName } = require('../utils/helpers');
		suplentes.push([healer.name, getRoleDisplayName(healer.role), 'Suplente', healer.role]);
	}
	for(const dps of dpsPool)
	{
		const	{ getRoleDisplayName } = require('../utils/helpers');
		suplentes.push([dps.name, getRoleDisplayName(dps.role), 'Suplente', dps.role]);
	}
	for(const name of event.roles.tentative) { suplentes.push([name, 'Pendiente', 'Pendiente', 'tentative']); }

	return ({ groups, generalRows, suplentes });
}

module.exports = {
	getEventConfigByType,
	removeAll,
	createEvent,
	buildGvgGroupsAndLists
};
