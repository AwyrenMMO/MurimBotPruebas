require('dotenv').config();

const	config = require('./config');
const	{ createClient } = require('./client');
const	{ loadData } = require('./services/dataService');
const	{ setupErrorHandlers } = require('./handlers/errors');
const	{ setupReadyEvent } = require('./handlers/events');
const	{ setupInteractionHandler } = require('./handlers/interactions');

const client = createClient();

// Load data //
loadData();

// Configuration for error handlers //
setupErrorHandlers(client);

// Configuration for ready event //
setupReadyEvent(client);

// Configuration for intereaction handlers //
setupInteractionHandler(client);

// Login //
client.login(config.token);

console.log('🚀 Bot iniciando...');
