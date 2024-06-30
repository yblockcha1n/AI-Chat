# AI-Chat

https://github.com/yblockcha1n/AI-Chat/assets/144770048/35995643-b616-44de-ad20-b3f9c0c741f3

## Requirements

- Node.js v21
- npm v10.5
- Git
- OPENAI API key

## Setup

**1. Clone the repository**

```
git clone https://github.com/yblockcha1n/AI-Chat
cd AI-Chat
```

**2. Install dependencies**

```
npm init -y
npm install axios chalk
```

**3. Create a `config.json` & `assistant.json` file**

`config.json`

```json
{
    "OPENAI_API_KEY": "YOUR_OPENAI_API_KEY",
    "API_URL": "https://api.openai.com/v1/chat/completions"
}
```

`assistant.json`
```json
{
    "name": "XXXXX",
    "description": "XXXXXXXXXXX"
}
```

## Running the Application

**1. Run the application**

```
node main.mjs
```
