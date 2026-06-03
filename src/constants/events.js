const	{ ButtonStyle } = require('discord.js');
const	{ EMOJIS } = require('./emojis');

module.exports = {
	CONFIGS: {
		gvg: {
			type: 'gvg',
			color: 0xB21D1D,
			showMax: false,
			order: ['tank', 'healer', 'dps', 'ranged', 'tentative'],
			max: {},
			labels: {
				tank: `${EMOJIS.tank} Tanque`,
				healer: `${EMOJIS.healer} Healer`,
				dps: `${EMOJIS.dps} DPS`,
				ranged: `${EMOJIS.dps} DPS Rango`,
				tentative: '🕓 Pendiente'
			},
		styles: {
			tank: ButtonStyle.Danger,
			healer: ButtonStyle.Success,
			dps: ButtonStyle.Primary,
			ranged: ButtonStyle.Primary,
			tentative: ButtonStyle.Secondary
		}
	},

	raid10: {
		type: 'raid10',
		color: 0x56C4B4,
		showMax: true,
		order: ['tank', 'dps', 'healer', 'atank', 'adps', 'ahealer'],
		max: { tank: 1, dps: 7, healer: 2 },
		labels: {
			tank: `${EMOJIS.tank} Tanque`,
			dps: `${EMOJIS.dps} DPS`,
			healer: `${EMOJIS.healer} Healer`,
			atank: '🆘 A.Tanque',
			adps: '🆘 A.DPS',
			ahealer: '🆘 A.Healer'
		},
		styles: {
			tank: ButtonStyle.Danger,
			dps: ButtonStyle.Primary,
			healer: ButtonStyle.Success,
			atank: ButtonStyle.Secondary,
			adps: ButtonStyle.Secondary,
			ahealer: ButtonStyle.Secondary
		}
	},

	raid5: {
		type: 'raid5',
		color: 0xC49356,
		showMax: true,
		order: ['tank', 'dps', 'healer', 'atank', 'adps', 'ahealer'],
		max: { tank: 1, dps: 3, healer: 1 },
		labels: {
			tank: `${EMOJIS.tank} Tanque`,
			dps: `${EMOJIS.dps} DPS`,
			healer: `${EMOJIS.healer} Healer`,
			atank: '🆘 A.Tanque',
			adps: '🆘 A.DPS',
			ahealer: '🆘 A.Healer'
		},
		styles: {
			tank: ButtonStyle.Danger,
			dps: ButtonStyle.Primary,
			healer: ButtonStyle.Success,
			atank: ButtonStyle.Secondary,
			adps: ButtonStyle.Secondary,
			ahealer: ButtonStyle.Secondary
		}
	}
	}
};
