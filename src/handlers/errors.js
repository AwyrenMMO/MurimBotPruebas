function	setupErrorHandlers(client)
{
	// Global error handler for promises not captured. //
	process.on('unhandledRejection', error => {
		console.error('❌ Unhandled Promise Rejection:', error);
	});

	// Error handler for exceptions not captured. //
	process.on('uncaughtException', error => {
		console.error('❌ Uncaught Exception:', error);
		process.exit(1);
	});

	// Client disconnection. //
	client.on('disconnect', () => {
		console.warn('⚠️ Bot desconectado de Discord');
	});

	// Client error. //
	client.on('error', error => {
		console.error('❌ Client error:', error.message);
	});

	// Client warning. //
	client.on('warn', warning => {
		console.warn('⚠️ Client warning:', warning);
	});
}

module.exports = {
	setupErrorHandlers
};
