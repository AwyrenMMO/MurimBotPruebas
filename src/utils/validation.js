const	{ DateTime } = require('luxon');
const	{ PermissionFlagsBits } = require('discord.js');
const	{ ZONES } = require('../constants/zones');
const	{ GVG_ALLOWED_ROLE_IDS } = require('../constants/roles');

function	parseEventDate(fecha, hora, zona)
{
	const	zone = ZONES[zona];
	if(!zone) return (null);

	const dt = DateTime.fromFormat(
		`${fecha} ${hora}`,
		'dd/MM/yyyy HH:mm',
		{ zone }
	);

	return (dt.isValid ? dt : null);
}

function	userHasAnyAllowedRole(interaction, allowedRoleIds)
{
	const	memberRoles = interaction.member?.roles?.cache;
	if (!memberRoles) { return (false); }

	return (allowedRoleIds.some(roleId => memberRoles.has(roleId)));
}

function	canUseGvg(interaction)
{
	const	isManager = interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild);
	if (isManager) { return (true); }

	return (userHasAnyAllowedRole(interaction, GVG_ALLOWED_ROLE_IDS));
}

function	canEditEvent(interaction, event)
{
	const	isCreator = interaction.user.id === event.creatorId;
	const	isManager = interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild);

	return (isCreator || isManager);
}

function	findRole(event, user)
{
	for (const r in event.roles)
		if (event.roles[r].includes(user)) { return (r); }

	return (null);
}

module.exports = {
	parseEventDate,
	userHasAnyAllowedRole,
	canUseGvg,
	canEditEvent,
	findRole
};
