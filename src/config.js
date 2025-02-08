const defaultConfig = {
  mode: 'online', // 'online' or 'local'
  baseUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
  localUrl: 'http://localhost:11434/api/chat', // Ollama default URL
  apiKey: '',
  vl_apiKey: '',
  suggestionsCount: 3,
  model: 'glm-4-flash',
  modelOptions: [
    'glm-4-flash',
    'deepseek-chat',
    'deepseek-coder',
    'gpt-3.5-turbo',
    'gpt-4',
    'claude-3-opus',
    'claude-3-sonnet'
  ],
  customModel: '',
  // 添加本地模式的参数
  localOptions: {
    temperature: 0.3,
    top_p: 0.1,
    num_predict: 1000
  }
};

export default defaultConfig;