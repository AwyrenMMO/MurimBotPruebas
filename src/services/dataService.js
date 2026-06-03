const	fs = require('fs');

let	data = {};

function	loadData()
{
	if (fs.existsSync('./data.json'))
	{
		try {
			data = JSON.parse(fs.readFileSync('./data.json', 'utf8'));
			console.log('📂 Data.json cargado correctamente');
		}
		catch (error) {
			console.error('❌ Error cargando data.json:', error.message);
			data = {};
		}
	}
}

function	getData() { return (data); }

function	saveData()
{
	try {
		const tempFile = './data.json.tmp';
		fs.writeFileSync(tempFile, JSON.stringify(data, null, 2));
		fs.renameSync(tempFile, './data.json');
	}
	catch (error) { console.error('❌ Error guardando data.json:', error.message); }
}

function	cleanOldEvents()
{
	const	now = Math.floor(Date.now() / 1000);
	const	HOURS_TO_KEEP = 24 * 7;
	const	cutoffTime = now - (HOURS_TO_KEEP * 3600);

	let	cleaned = 0;
	for(const id in data)
		if (data[id].timestamp < cutoffTime) { delete data[id]; cleaned++; }

	if (cleaned > 0) { saveData(); console.log(`🧹 Se eliminaron ${cleaned} eventos antiguos`); }
}

module.exports = {
	loadData,
	getData,
	saveData,
	cleanOldEvents
};
