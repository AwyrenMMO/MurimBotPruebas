const	{ ZONES } = require('../constants/zones');

function	getName(interaction) { return (interaction.member?.displayName || interaction.user.username); }
function	formatList(list) { return (list.length ? list.map(x => `│ ${x}`).join('\n') : '-'); }
function	cleanButtonLabel(label) { return (label.replace(/<.*?>/g, '').trim()); }

function	getRoleDisplayName(roleKey)
{
	const	map = {
		tank: 'Tanque',
		healer: 'Healer',
		dps: 'DPS',
		ranged: 'DPS Rango',
		tentative: 'Pendiente'
	};
	return (map[roleKey] || roleKey);
}

function	getSlotLabel(entry)
{
	if (!entry) { return (''); }
	if (entry.role === 'tank') { return (`🔰 ${entry.name}`); }
	if (entry.role === 'healer') { return (`💚 ${entry.name}`); }
	if (entry.role === 'dps') { return ( `🗡️ ${entry.name}`); }
	if (entry.role === 'ranged') { return (`☂️ ${entry.name}`); }
	return (entry.name);
}

function	colorForRoleKey(roleKey, colors)
{
	if (roleKey === 'tank') { return (colors.tank); }
	if (roleKey === 'healer') { return (colors.healer); }
	if (roleKey === 'dps' || roleKey === 'ranged') { return (colors.dps); }
	if (roleKey === 'tentative') { return (colors.pending); }
	return (colors.neutral);
}

function	colorForStatus(status, colors)
{
	if (status === 'Main') { return (colors.main); }
	if (status === 'Suplente') { return (colors.substitute); }
	if (status === 'Pendiente') { return (colors.pending); }
	return (colors.neutral);
}

module.exports = {
	getName,
	formatList,
	cleanButtonLabel,
	getRoleDisplayName,
	getSlotLabel,
	colorForRoleKey,
	colorForStatus
};
