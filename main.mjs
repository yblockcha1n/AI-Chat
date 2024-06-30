import readline from 'readline';
import axios from 'axios';
import fs from 'fs/promises';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let API_KEY, API_URL, ASSISTANT;
let conversationHistory = [];

const printDivider = () => console.log(chalk.gray('-'.repeat(50)));

const readJsonFile = async (filename) => {
  const file = await fs.readFile(join(__dirname, filename), 'utf8');
  return JSON.parse(file);
};

const initializeApp = async () => {
  try {
    const config = await readJsonFile('settings/config.json');
    const assistantConfig = await readJsonFile('settings/assistant.json');
    
    API_KEY = config.OPENAI_API_KEY;
    API_URL = config.API_URL || 'https://api.openai.com/v1/chat/completions';
    ASSISTANT = assistantConfig;

    conversationHistory.push({ 
      role: 'system', 
      content: `あなたの名前は${ASSISTANT.name}です。 ${ASSISTANT.description}` 
    });

  } catch (error) {
    console.error(chalk.red('初期化エラー:'), error.message);
    process.exit(1);
  }
};

const makeApiRequest = async (message) => {
  conversationHistory.push({ role: 'user', content: message });
  return axios.post(API_URL, {
    model: 'gpt-4o',
    messages: conversationHistory,
    temperature: 0.7,
    stream: true
  }, {
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    responseType: 'stream'
  });
};

const processStreamResponse = async (stream) => {
  let fullResponse = '';
  let buffer = '';

  process.stdout.write(chalk.yellow.bold(`${ASSISTANT.name}: `));

  for await (const chunk of stream) {
    buffer += chunk.toString('utf8');
    let newlineIndex;
    while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
      const line = buffer.slice(0, newlineIndex);
      buffer = buffer.slice(newlineIndex + 1);
      if (line.startsWith('data: ')) {
        const jsonString = line.slice(6);
        if (jsonString === '[DONE]') {
          console.log();
          return fullResponse;
        }
        try {
          const parsed = JSON.parse(jsonString);
          const content = parsed.choices[0]?.delta?.content;
          if (content) {
            process.stdout.write(chalk.yellow(content));
            fullResponse += content;
          }
        } catch (error) {
        }
      }
    }
  }

  console.log();
  return fullResponse;
};

const chatWithAssistant = async (message) => {
  try {
    const response = await makeApiRequest(message);
    const fullResponse = await processStreamResponse(response.data);
    conversationHistory.push({ role: 'assistant', content: fullResponse });
    return fullResponse;
  } catch (error) {
    console.error(chalk.red('エラーが発生しました。もう一度お試しください。'));
    return null;
  }
};

const getUserInput = (rl) => {
  return new Promise((resolve) => {
    rl.question(chalk.green.bold('あなた: '), resolve);
  });
};

const startChat = async () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log(chalk.blue.bold(`${ASSISTANT.name}との会話を開始します。終了するには "exit" と入力してください。`));
  printDivider();

  while (true) {
    const input = await getUserInput(rl);

    if (input.toLowerCase() === 'exit') {
      console.log(chalk.blue.bold('会話を終了します。'));
      rl.close();
      break;
    }

    await chatWithAssistant(input);
    printDivider();
  }
};

(async () => {
  try {
    await initializeApp();
    await startChat();
  } catch (error) {
    console.error(chalk.red('予期せぬエラーが発生しました:'), error);
    process.exit(1);
  }
})();
