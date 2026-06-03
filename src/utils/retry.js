async function	retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000)
{
	for (let attempt = 0; attempt < maxRetries; attempt++)
	{
		try {
			return await fn();
		} catch (error) {
			if (attempt === maxRetries - 1) { throw error; }
			const	delay = baseDelay * Math.pow(2, attempt);
			console.warn(`⏳ Reintentando en ${delay}ms... (intento ${attempt + 1}/${maxRetries})`);
			await new Promise(resolve => setTimeout(resolve, delay));
		}
	}
}

module.exports = {
	retryWithBackoff
};
