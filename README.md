# Murim Bot

Original idea by AwyrenMMO; improvements, stability fixes, and reorganization by Fracurul.

A Discord bot for managing GvG events and raids.

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
│   └── sheetOperations.js        # Advanced Google Sheets operations
├── handlers/
│   ├── errors.js                 # Global error handling
│   ├── events.js                 # Discord event handlers
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
	- `CLIENT_ID`: Discord application client ID.
	- `GUILD_ID`: Discord server (guild) ID.
	- `GOOGLE_CREDENTIALS`: (Optional) Google credentials.
	- `SPREADSHEET_ID`: (Optional) Google Sheets document ID.

## 🏃 Run

```bash
npm start
```

## 📚 Modules

### Services
- **dataService**: Load/save data.json.
- **eventService**: Pure events logic (without Discord)
- **discordService**: Embeds, buttons, messages.
- **sheetService**: Google Sheets API connection.
- **sheetOperations**: Advanced Google Sheets operations.

### Handlers
- **errors**: Global error handling.
- **events**: Initialization and cleaning.
- **interactions**: Slash commands and buttons.

### Utils
- **helpers**: Formatting, names, emotes.
- **validation**: Permissions, dates, searches.
- **retry**: Automatically retries with exponential backoff.

## 🔧 Adding a new command

1. Create the logic in `eventService.js` or a new service.
2. Add the command definition to `handlers/events.js`.
3. Implement the handler in `handlers/interactions.js`.

## ✅ Benefits of This Structure

- **Modular**: Each file has its own responsibility.
- **Testable**: Services are independent of Discord-specific dependencies.
- **Maintainable**: Easy to find and fix bugs.
- **Scalability**: Adding new features is simple.
- **Clean**: Separation of concerns.
