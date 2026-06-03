# Murim Bot

Discord bot for managing events GvG & Raids.

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
│   ├── dataService.js            # Persistency (data.json)
│   ├── eventService.js           # Events logic
│   ├── discordService.js         # Discord functions (embeds, messages)
│   ├── sheetService.js           # Google Sheets API
│   └── sheetOperations.js        # Complex operations Sheets
├── handlers/
│   ├── errors.js                 # Global management for errors
│   ├── events.js                 # Event ClientReady
│   └── interactions.js           # Comands and buttons
└── utils/
    ├── helpers.js                # Aux functions
    ├── validation.js             # Validations
    └── retry.js                  # Retries with backoff
```

## 🚀 Instalación

```bash
npm install
```

## ⚙️ Configuración

1. Copy `.env.example` to `.env`
2. Fullfill enviroments variables:
	- `TOKEN`: Discord bot token.
	- `CLIENT_ID`: Client ID from Discord.
	- `GUILD_ID`: Server ID (Guild)
	- `GOOGLE_CREDENTIALS`: (Optional) Google credentials.
	- `SPREADSHEET_ID`: (Optional) Google sheets ID from google sheets doc.

## 🏃 Execute

```bash
npm start
```

## 📚 Módulos

### Services
- **dataService**: Load/save data.json
- **eventService**: Pure events logic (without Discord)
- **discordService**: Embeds, buttons, messages
- **sheetService**: Google Sheets API connection
- **sheetOperations**: Format complex operations

### Handlers
- **errors**:  Glogbal errors not captured
- **events**: Initialization and cleaning
- **interactions**: Slash commands and buttons

### Utils
- **helpers**: Formatting, names, emotes
- **validation**: Permits, datess, searchs
- **retry**: Automatically retries with exponential backoff

## 🔧 Agregate new command

1. Create logic at `eventService.js` or new service
2. Add the command definiton at `handlers/events.js`
3. Implement the handler at `handlers/interactions.js`

## ✅ Benefit structure

- **Moduleable**: Each archive has it's own responsability
- **Testable**: Services without discord dependencies
- **Maintainable**: Easy to find and fix bugs
- **Scalability**: Add new functionalities is simple
- **Clean**: separation of concerns
