const ZONES	= {
	canarias: 'Atlantic/Canary',
	peninsula: 'Europe/Madrid'
};

function getZoneLabel(zoneKey) {
	return (zoneKey === 'canarias' ? 'Canarias' : 'Península');
}

module.exports = {
	ZONES,
	getZoneLabel
};
