const	{ google } = require('googleapis');
const	{ retryWithBackoff } = require('../utils/retry');
const	{ SHEET_COLORS } = require('../constants/colors');

function	getGoogleCredentials()
{
	const	raw = process.env.GOOGLE_CREDENTIALS;
	if (!raw) { console.log('❌ GOOGLE_CREDENTIALS no existe'); return (null); }

	try {
		const	parsed = JSON.parse(raw);
		if (parsed.private_key)
			parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
		console.log('✅ GOOGLE_CREDENTIALS leído');
		console.log(`✅ client_email: ${parsed.client_email}`);
		return (parsed);
	} catch (error) { console.error('❌ GOOGLE_CREDENTIALS inválido:', error); return (null); }
}

function	getSheetsClient()
{
	const	credentials = getGoogleCredentials();
	const	spreadsheetId = process.env.SPREADSHEET_ID;
	if (!credentials || !spreadsheetId) { return (null); }

	try {
		const	auth = new google.auth.GoogleAuth({
			credentials,
			scopes: ['https://www.googleapis.com/auth/spreadsheets']
		});
		return (google.sheets({ version: 'v4', auth }));
	} catch (error) { console.error('❌ Error creando cliente de Google Sheets:', error.message); return (null); }
}

async function	ensureSheetExists(sheets, spreadsheetId, title)
{
	try {
		const	meta = await retryWithBackoff(() => sheets.spreadsheets.get({ spreadsheetId }));

	const	exists = meta.data.sheets?.some(s => s.properties?.title === title);
	if (!exists)
	{
		await retryWithBackoff(() =>
			sheets.spreadsheets.batchUpdate({
				spreadsheetId,
				requestBody: {
					requests: [
						{
							addSheet: {
								properties: {
									title
								}
							}
						}
					]
				}
			})
		);
	}
	} catch (error) { console.error(`❌ Error asegurando hoja ${title}:`, error.message); }
}

async function	testGoogleSheets()
{
	try {
		console.log('🔍 Iniciando prueba de Google Sheets...');

	const	sheets = getSheetsClient();
	const	spreadsheetId = process.env.SPREADSHEET_ID;
	if (!spreadsheetId) { console.log('❌ SPREADSHEET_ID no existe'); return; }

	console.log(`✅ SPREADSHEET_ID detectado: ${spreadsheetId}`);
	if (!sheets) { console.log('❌ No se pudo crear el cliente de Google Sheets'); return; }

	const	logSheet = 'Bot Logs';
	console.log(`🔍 Comprobando hoja: ${logSheet}`);

	await ensureSheetExists(sheets, spreadsheetId, logSheet);
	console.log('✅ Hoja Bot Logs verificada/creada');

	await sheets.spreadsheets.values.append({
		spreadsheetId,
		range: `${logSheet}!A:B`,
		valueInputOption: 'RAW',
		requestBody: {
			values: [[new Date().toISOString(), 'Bot conectado correctamente']]
		}
	});
	console.log('✅ Google Sheets conectado y escritura realizada');
	} catch (error) { console.error('❌ Error Google Sheets completo:'); console.error(error.message); }
}

module.exports = {
	getGoogleCredentials,
	getSheetsClient,
	ensureSheetExists,
	testGoogleSheets,
	SHEET_COLORS
};
