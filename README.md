# Murim Bot

Original idea by AwyrenMMO; improvements, stability fixes, and reorganization by Fracurul.

A discord bot for managing GvG events and Raids.

## 📁 Project Structure

```
src/
├── config.js                     # Config and env
├── client.js                     # Discord client
├── constants/
│   ├── emojis.js                 # Emojis and text
│   ├── zones.js                  # Time zones
│   ├── roles.js                  # Allowed roles
│   ├── colors.js                 # Google Sheets colors
│   └── events.js                 # Events config
├── services/
│   ├── dataService.js            # Persistence (data.json)
│   ├── eventService.js           # Events logic
│   ├── discordService.js         # Discord functions (embeds, messages)
│   ├── sheetService.js           # Google Sheets API
│   └── sheetOperations.js        # Complex Google Sheets operations
├── handlers/
│   ├── errors.js                 # Global error handling
│   ├── events.js                 # Event ClientReady
│   └── interactions.js           # Commands and buttons
└── utils/
    ├── helpers.js                # Helper functions
    ├── validation.js             # Validation utilities
    └── retry.js                  # Retries with backoff
```

## 🚀 Installation

```bash
npm install
```

## ⚙️ Configuration

1. Copy `.env.example` to `.env`
2. Fill in the environment variables:
	- `TOKEN`: Discord bot token.
	- `CLIENT_ID`: Client ID from Discord.
	- `GUILD_ID`: Server ID (Guild)
	- `GOOGLE_CREDENTIALS`: (Optional) Google credentials.
	- `SPREADSHEET_ID`: (Optional) Google sheets ID from google sheets doc.

## 🏃 Run

```bash
npm start
```

## 📚 Modules

### Services
- **dataService**: Load/save data.json
- **eventService**: Pure events logic (without Discord)
- **discordService**: Embeds, buttons, messages
- **sheetService**: Google Sheets API connection
- **sheetOperations**: Format complex operations

### Handlers
- **errors**: Global error handling
- **events**: Initialization and cleaning
- **interactions**: Slash commands and buttons

### Utils
- **helpers**: Formatting, names, emotes
- **validation**: Permissions, dates, searches
- **retry**: Automatically retries with exponential backoff

## 🔧 Adding a new command

1. Create logic at `eventService.js` or new service
2. Add the command definition at `handlers/events.js`
3. Implement the handler at `handlers/interactions.js`

## ✅ Benefits of This Structure

- **Modular**: Each file has its own responsibility
- **Testable**: Services are independent of Discord-specific dependencies.
- **Maintainable**: Easy to find and fix bugs
- **Scalability**: Adding new features is simple
- **Clean**: separation of concerns
