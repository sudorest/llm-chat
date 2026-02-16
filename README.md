# LLM Chat App

A modern chat interface for LLM conversations built with React, Palantir Blueprint, and Catppuccin theme.

## Features

- Clean, modern UI using Palantir Blueprint components
- Beautiful Catppuccin Mocha color theme
- Real-time chat with GPT-4o
- Message history tracking
- Auto-scrolling to latest messages
- Keyboard shortcuts (Enter to send, Shift+Enter for new line)
- Clear chat functionality
- Responsive design

## Tech Stack

- **React** + **TypeScript** + **Vite**
- **Palantir Blueprint** - UI component library
- **Catppuccin** - Color theme palette
- Custom CSS for theming

## API Configuration

The app is configured to use:
- **API URL**: `https://llmrouter.k8s.mreow.de/v1/chat/completions`
- **API Key**: `meowmeomwo`
- **Model**: `gpt-4o`

## Installation

```bash
# Navigate to project directory
cd llm-chat-app

# Install dependencies
npm install

# Start development server
npm run dev
```

## Usage

1. Start the app with `npm run dev`
2. Open your browser to `http://localhost:5173`
3. Type a message in the input box at the bottom
4. Press **Enter** to send (or **Shift+Enter** for a new line)
5. View the AI's response in the chat

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Customization

### Changing the Theme

The app uses Catppuccin Mocha theme colors defined in `src/App.css`. You can modify the CSS variables in the `:root` section to customize colors.

### Changing the Model

Edit the `MODEL` constant in `src/App.tsx` to use a different model.

## License

MIT