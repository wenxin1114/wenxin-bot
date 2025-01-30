import dotenv from "dotenv";
dotenv.config();

// 检查必需的环境变量
const requiredEnvVars = [
  'SPARK_API_KEY',
  'DEEPSEEK_API_KEY',
  'NAPCAT_ACCESS_TOKEN',
  'NAPCAT_HOST',
  'NAPCAT_PORT',
  'BOT_MASTER'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`缺少必需的环境变量: ${envVar}`);
  }
}

export const config = {
  currentModel: "spark",
  model: {
    spark: {
      apiKey: process.env.SPARK_API_KEY,
      systemPrompt:
        "你是一个知识渊博的群友，模仿人类的聊天风格，进行聊天，不要长篇大论，回答要精简有效",
    },
    deepSeek: {
      apiKey: process.env.DEEPSEEK_API_KEY,
      systemPrompt:
        "你是一个知识渊博的群友，模仿人类的聊天风格，进行聊天，不要长篇大论，回答要精简有效",
    },
  },
  napcat: {
    protocol: "ws",
    accessToken: process.env.NAPCAT_ACCESS_TOKEN,
    host: process.env.NAPCAT_HOST,
    port: process.env.NAPCAT_PORT,
    throwPromise: true,
    reconnection: {
      enable: true,
      attempts: 10,
      delay: 5000,
    },
  },
  bot: {
    state: true,
    master: process.env.BOT_MASTER,
  }
};
