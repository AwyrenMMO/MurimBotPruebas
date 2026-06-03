const	{ DateTime } = require('luxon');
const	{ getSheetsClient, ensureSheetExists } = require('./sheetService');
const	{ retryWithBackoff } = require('../utils/retry');
const	{ SHEET_COLORS } = require('../constants/colors');
const	{ getZoneLabel, ZONES } = require('../constants/zones');
const	{ buildGvgGroupsAndLists } = require('./eventService');
const	{ colorForRoleKey, colorForStatus } = require('../utils/helpers');

async function	updateGvgEventSheet(event)
{
	try {
		const	sheets = getSheetsClient();
		const	spreadsheetId = process.env.SPREADSHEET_ID;
		if (!sheets || !spreadsheetId || !event.sheetTitle)
		{
			console.log('⚠️ No se pudo actualizar la hoja del evento GvG: configuración ausente');
			return;
		}

		const	{ groups, generalRows, suplentes } = buildGvgGroupsAndLists(event);
		const	maxRows = Math.max(25, generalRows.length + 10, suplentes.length + 16);
		const	matrix = Array.from({ length: maxRows }, () => Array(10).fill(''));
		matrix[0][0] = event.title || 'Sin título';
		matrix[1][0] = `Fecha: ${event.fecha || 'N/A'}`;
		matrix[2][0] = `Hora: ${event.hora || 'N/A'}`;
		matrix[3][0] = `Zona: ${getZoneLabel(event.zona || 'peninsula')}`;
		matrix[4][0] = 'LISTADO GENERAL';
		matrix[5][0] = 'Nombre';
		matrix[5][1] = 'Rol';
		matrix[5][2] = 'Estado';

		generalRows.forEach((row, idx) => {
			matrix[6 + idx][0] = row[0] || '';
			matrix[6 + idx][1] = row[1] || '';
			matrix[6 + idx][2] = row[2] || '';
		});

	matrix[0][4] = 'COMPOSICIÓN GVG';
	for(let g = 0; g < 6; g++) { matrix[1][4 + g] = `Subgrupo ${g + 1}`; }

	const	{ getSlotLabel } = require('../utils/helpers');
	for(let row = 0; row < 5; row++)
		for(let g = 0; g < 6; g++) { matrix[2 + row][4 + g] = getSlotLabel(groups[g][row]) || ''; }

	const	suplStartRow = 9;
	matrix[suplStartRow][4] = 'SUPLENTES';
	matrix[suplStartRow + 1][4] = 'Nombre';
	matrix[suplStartRow + 1][5] = 'Rol';
	matrix[suplStartRow + 1][6] = 'Estado';

	suplentes.forEach((row, idx) => {
		matrix[suplStartRow + 2 + idx][4] = row[0] || '';
		matrix[suplStartRow + 2 + idx][5] = row[1] || '';
		matrix[suplStartRow + 2 + idx][6] = row[2] || '';
	});

	await retryWithBackoff(() =>
		sheets.spreadsheets.values.clear({
			spreadsheetId,
			range: `${event.sheetTitle}!A:Z`
		})
	);

	await retryWithBackoff(() =>
		sheets.spreadsheets.values.update({
			spreadsheetId,
			range: `${event.sheetTitle}!A1`,
			valueInputOption: 'RAW',
			requestBody: { values: matrix }
		})
	);

	await applySheetFormatting(event, groups, generalRows, suplentes);

	console.log(`✅ Hoja GvG actualizada: ${event.sheetTitle}`);
} catch (error) { console.error('❌ Error actualizando la hoja GvG:', error.message); }
}

async function	applySheetFormatting(event, groups, generalRows, suplentes)
{
	try {
		const	sheets = getSheetsClient();
		const	spreadsheetId = process.env.SPREADSHEET_ID;
		if (!sheets || !spreadsheetId || !event.sheetTitle) { return; }

		const	meta = await sheets.spreadsheets.get({ spreadsheetId });
		const	sheet = meta.data.sheets.find( s => s.properties.title === event.sheetTitle );

		if (!sheet) { return; }

		const	sheetId = sheet.properties.sheetId;
		const	requests = [
		{
			unmergeCells: {
				range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 3 }
			}
		},
		{
			unmergeCells: {
				range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 4, endColumnIndex: 10 }
			}
		},
		{
			unmergeCells: {
				range: { sheetId, startRowIndex: 4, endRowIndex: 5, startColumnIndex: 0, endColumnIndex: 3 }
			}
		},
		{
			unmergeCells: {
				range: { sheetId, startRowIndex: 9, endRowIndex: 10, startColumnIndex: 4, endColumnIndex: 7 }
			}
		},
		{
			updateSheetProperties: {
				properties: {
					sheetId,
					gridProperties: { frozenRowCount: 2 }
				},
				fields: 'gridProperties.frozenRowCount'
			}
		},
		{
			updateDimensionProperties: {
				range: {
					sheetId,
					dimension: 'ROWS',
					startIndex: 0,
					endIndex: 2
				},
				properties: { pixelSize: 30 },
				fields: 'pixelSize'
			}
		},
		{
			updateDimensionProperties: {
				range: {
					sheetId,
					dimension: 'ROWS',
					startIndex: 2,
					endIndex: 7
				},
				properties: { pixelSize: 34 },
				fields: 'pixelSize'
			}
		},
		{
			updateDimensionProperties: {
				range: {
					sheetId,
					dimension: 'ROWS',
					startIndex: 5,
					endIndex: Math.max(7, 6 + generalRows.length)
				},
				properties: { pixelSize: 26 },
				fields: 'pixelSize'
			}
		},
		{
			updateDimensionProperties: {
				range: {
					sheetId,
					dimension: 'ROWS',
					startIndex: 10,
					endIndex: Math.max(12, 11 + suplentes.length)
				},
				properties: { pixelSize: 26 },
				fields: 'pixelSize'
			}
		},
		{
			updateDimensionProperties: {
				range: {
					sheetId,
					dimension: 'COLUMNS',
					startIndex: 0,
					endIndex: 3
				},
				properties: { pixelSize: 175 },
				fields: 'pixelSize'
			}
		},
		{
			updateDimensionProperties: {
				range: {
					sheetId,
					dimension: 'COLUMNS',
					startIndex: 4,
					endIndex: 10
				},
				properties: { pixelSize: 165 },
				fields: 'pixelSize'
			}
		},
		{
			mergeCells: {
				range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 3 },
				mergeType: 'MERGE_ALL'
			}
		},
		{
			mergeCells: {
				range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 4, endColumnIndex: 10 },
				mergeType: 'MERGE_ALL'
			}
		},
		{
			mergeCells: {
			range: { sheetId, startRowIndex: 4, endRowIndex: 5, startColumnIndex: 0, endColumnIndex: 3 },
			mergeType: 'MERGE_ALL'
			}
		},
		{
			mergeCells: {
				range: { sheetId, startRowIndex: 9, endRowIndex: 10, startColumnIndex: 4, endColumnIndex: 7 },
				mergeType: 'MERGE_ALL'
			}
		},
		{
			repeatCell: {
				range: {
					sheetId,
					startRowIndex: 0,
					endRowIndex: 1,
					startColumnIndex: 0,
					endColumnIndex: 3
				},
				cell: {
					userEnteredFormat: {
						textFormat: { bold: true, fontSize: 13, foregroundColor: SHEET_COLORS.whiteText },
						backgroundColor: SHEET_COLORS.darkHeader,
						horizontalAlignment: 'LEFT',
						verticalAlignment: 'MIDDLE'
					}
				},
				fields: 'userEnteredFormat(textFormat,backgroundColor,horizontalAlignment,verticalAlignment)'
			}
		},
		{
			repeatCell: {
				range: {
					sheetId,
					startRowIndex: 0,
					endRowIndex: 1,
					startColumnIndex: 4,
					endColumnIndex: 10
				},
				cell: {
					userEnteredFormat: {
						textFormat: { bold: true, fontSize: 13, foregroundColor: SHEET_COLORS.whiteText },
						backgroundColor: SHEET_COLORS.darkHeader,
						horizontalAlignment: 'CENTER',
						verticalAlignment: 'MIDDLE'
					}
				},
				fields: 'userEnteredFormat(textFormat,backgroundColor,horizontalAlignment,verticalAlignment)'
			}
		},
		{
			repeatCell: {
			range: {
				sheetId,
				startRowIndex: 4,
				endRowIndex: 5,
				startColumnIndex: 0,
				endColumnIndex: 3
			},
			cell: {
				userEnteredFormat: {
					textFormat: { bold: true },
					backgroundColor: SHEET_COLORS.neutral,
					horizontalAlignment: 'LEFT',
					verticalAlignment: 'MIDDLE'
				}
			},
			fields: 'userEnteredFormat(textFormat,backgroundColor,horizontalAlignment,verticalAlignment)'
			}
		},
		{
			repeatCell: {
				range: {
					sheetId,
					startRowIndex: 5,
					endRowIndex: 6,
					startColumnIndex: 0,
					endColumnIndex: 3
				},
				cell: {
					userEnteredFormat: {
						textFormat: { bold: true, foregroundColor: SHEET_COLORS.whiteText },
						backgroundColor: SHEET_COLORS.midHeader,
						horizontalAlignment: 'CENTER',
						verticalAlignment: 'MIDDLE'
					}
				},
				fields: 'userEnteredFormat(textFormat,backgroundColor,horizontalAlignment,verticalAlignment)'
			}
		},
		{
			repeatCell: {
				range: {
					sheetId,
					startRowIndex: 1,
					endRowIndex: 2,
					startColumnIndex: 4,
					endColumnIndex: 10
				},
				cell: {
					userEnteredFormat: {
						textFormat: { bold: true, foregroundColor: SHEET_COLORS.whiteText },
						horizontalAlignment: 'CENTER',
						verticalAlignment: 'MIDDLE',
						backgroundColor: SHEET_COLORS.midHeader
					}
				},
				fields: 'userEnteredFormat(textFormat,backgroundColor,horizontalAlignment,verticalAlignment)'
			}
		},
		{
			repeatCell: {
				range: {
					sheetId,
					startRowIndex: 2,
					endRowIndex: 7,
					startColumnIndex: 4,
					endColumnIndex: 10
				},
				cell: {
					userEnteredFormat: {
						horizontalAlignment: 'CENTER',
						verticalAlignment: 'MIDDLE',
						wrapStrategy: 'WRAP'
					}
				},
				fields: 'userEnteredFormat(horizontalAlignment,verticalAlignment,wrapStrategy)'
			}
		},
		{
			repeatCell: {
				range: {
					sheetId,
					startRowIndex: 9,
					endRowIndex: 10,
					startColumnIndex: 4,
					endColumnIndex: 7
				},
				cell: {
					userEnteredFormat: {
						textFormat: { bold: true },
						backgroundColor: SHEET_COLORS.neutral,
						horizontalAlignment: 'LEFT',
						verticalAlignment: 'MIDDLE'
					}
				},
				fields: 'userEnteredFormat(textFormat,backgroundColor,horizontalAlignment,verticalAlignment)'
			}
		},
		{
			repeatCell: {
				range: {
					sheetId,
					startRowIndex: 10,
					endRowIndex: 11,
					startColumnIndex: 4,
					endColumnIndex: 7
				},
				cell: {
					userEnteredFormat: {
						textFormat: { bold: true, foregroundColor: SHEET_COLORS.whiteText },
						backgroundColor: SHEET_COLORS.midHeader,
						horizontalAlignment: 'CENTER',
						verticalAlignment: 'MIDDLE'
					}
				},
				fields: 'userEnteredFormat(textFormat,backgroundColor,horizontalAlignment,verticalAlignment)'
			}
		},
		{
			updateBorders: {
				range: {
					sheetId,
					startRowIndex: 5,
					endRowIndex: Math.max(6 + generalRows.length, 7),
					startColumnIndex: 0,
					endColumnIndex: 3
				},
				top: { style: 'SOLID', color: SHEET_COLORS.border },
				bottom: { style: 'SOLID', color: SHEET_COLORS.border },
				left: { style: 'SOLID', color: SHEET_COLORS.border },
				right: { style: 'SOLID', color: SHEET_COLORS.border },
				innerHorizontal: { style: 'SOLID', color: SHEET_COLORS.border },
				innerVertical: { style: 'SOLID', color: SHEET_COLORS.border }
			}
		},
		{
			updateBorders: {
				range: {
					sheetId,
					startRowIndex: 1,
					endRowIndex: 7,
					startColumnIndex: 4,
					endColumnIndex: 10
				},
				top: { style: 'SOLID', color: SHEET_COLORS.border },
				bottom: { style: 'SOLID', color: SHEET_COLORS.border },
				left: { style: 'SOLID', color: SHEET_COLORS.border },
				right: { style: 'SOLID', color: SHEET_COLORS.border },
				innerHorizontal: { style: 'SOLID', color: SHEET_COLORS.border },
				innerVertical: { style: 'SOLID', color: SHEET_COLORS.border }
			}
		},
		{
			updateBorders: {
				range: {
					sheetId,
					startRowIndex: 10,
					endRowIndex: Math.max(11 + suplentes.length, 12),
					startColumnIndex: 4,
					endColumnIndex: 7
				},
				top: { style: 'SOLID', color: SHEET_COLORS.border },
				bottom: { style: 'SOLID', color: SHEET_COLORS.border },
				left: { style: 'SOLID', color: SHEET_COLORS.border },
				right: { style: 'SOLID', color: SHEET_COLORS.border },
				innerHorizontal: { style: 'SOLID', color: SHEET_COLORS.border },
				innerVertical: { style: 'SOLID', color: SHEET_COLORS.border }
			}
		}
	];

	generalRows.forEach((row, idx) => {
		const	sheetRow = 6 + idx;
		const	roleKey = row[3];
		const	status = row[2];

		requests.push({
			repeatCell: {
				range: {
					sheetId,
					startRowIndex: sheetRow,
					endRowIndex: sheetRow + 1,
					startColumnIndex: 0,
					endColumnIndex: 2
				},
				cell: {
					userEnteredFormat: {
						backgroundColor: colorForRoleKey(roleKey, SHEET_COLORS)
					}
				},
				fields: 'userEnteredFormat(backgroundColor)'
			}
		});

		requests.push({
			repeatCell: {
				range: {
					sheetId,
					startRowIndex: sheetRow,
					endRowIndex: sheetRow + 1,
					startColumnIndex: 2,
					endColumnIndex: 3
				},
				cell: {
					userEnteredFormat: {
						backgroundColor: colorForStatus(status, SHEET_COLORS),
						horizontalAlignment: 'CENTER'
					}
				},
				fields: 'userEnteredFormat(backgroundColor,horizontalAlignment)'
			}
		});
	});

	for(let g = 0; g < 6; g++)
		for(let r = 0; r < 5; r++)
		{
			const	entry = groups[g][r];
			if (!entry) { continue; }

			requests.push({
				repeatCell: {
					range: {
						sheetId,
						startRowIndex: 2 + r,
						endRowIndex: 3 + r,
						startColumnIndex: 4 + g,
						endColumnIndex: 5 + g
					},
					cell: {
						userEnteredFormat: {
							backgroundColor: colorForRoleKey(entry.role, SHEET_COLORS),
							horizontalAlignment: 'CENTER',
							verticalAlignment: 'MIDDLE'
						}
					},
					fields: 'userEnteredFormat(backgroundColor,horizontalAlignment,verticalAlignment)'
				}
			});
		}

	suplentes.forEach((row, idx) => {
		const	sheetRow = 11 + idx;
		const	roleKey = row[3];
		const	status = row[2];

		requests.push({
			repeatCell: {
				range: {
					sheetId,
					startRowIndex: sheetRow,
					endRowIndex: sheetRow + 1,
					startColumnIndex: 4,
					endColumnIndex: 6
				},
				cell: {
					userEnteredFormat: {
						backgroundColor: colorForRoleKey(roleKey, SHEET_COLORS)
					}
				},
				fields: 'userEnteredFormat(backgroundColor)'
			}
		});

		requests.push({
			repeatCell: {
				range: {
					sheetId,
					startRowIndex: sheetRow,
					endRowIndex: sheetRow + 1,
					startColumnIndex: 6,
					endColumnIndex: 7
				},
				cell: {
				userEnteredFormat: {
						backgroundColor: colorForStatus(status, SHEET_COLORS),
						horizontalAlignment: 'CENTER'
					}
				},
				fields: 'userEnteredFormat(backgroundColor,horizontalAlignment)'
			}
		});
	});

	await retryWithBackoff(() =>
		sheets.spreadsheets.batchUpdate({
			spreadsheetId,
			requestBody: { requests }
		})
	);

	console.log('🎨 Formato aplicado correctamente');
	} catch (error) { console.error('❌ Error aplicando formato:', error.message); }
}

async function	createEventSheet(event)
{
	try {
		const	sheets = getSheetsClient();
		const	spreadsheetId = process.env.SPREADSHEET_ID;

		if (!sheets || !spreadsheetId)
		{
			console.log('⚠️ No se pudo crear la hoja del evento: cliente o spreadsheet ausente');
			return;
		}

		const	date = DateTime.fromSeconds(event.timestamp)
			.setZone(ZONES[event.zona] || 'Europe/Madrid')
			.toFormat('dd-MM-yyyy');
		let	baseTitle = `GVG-${date}`;
		let	sheetTitle = baseTitle;
		const	meta = await retryWithBackoff(() => sheets.spreadsheets.get({ spreadsheetId }));
		const	existingTitles = meta.data.sheets?.map(s => s.properties?.title) || [];

		if (existingTitles.includes(sheetTitle))
		{
			let	counter = 2;
			while (existingTitles.includes(`${baseTitle}-${counter}`)) { counter++; }
			sheetTitle = `${baseTitle}-${counter}`;
		}

		await ensureSheetExists(sheets, spreadsheetId, sheetTitle);

		event.sheetTitle = sheetTitle;
		const	{ saveData } = require('./dataService');
		saveData();

		await updateGvgEventSheet(event);

		console.log(`📄 Hoja creada: ${sheetTitle}`);
	} catch (error) { console.error('❌ Error creando hoja del evento:', error.message); }
}

module.exports = {
	updateGvgEventSheet,
	applySheetFormatting,
	createEventSheet
};
