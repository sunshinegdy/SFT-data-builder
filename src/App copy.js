import { useState, useEffect } from 'react';
// 添加文件解析库
import { Document, Page, pdfjs } from 'react-pdf';
import mammoth from 'mammoth';
// 导入默认配置
import defaultConfig from './config';

// 设置pdf.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

function App() {
  // 从 localStorage 初始化数据列表状态
  const [dataList, setDataList] = useState(() => {
    const savedData = localStorage.getItem('aiTrainingData');
    return savedData ? JSON.parse(savedData) : [];
  });

  const [formData, setFormData] = useState({
    instruction: '',
    input: '',
    output: '',
    system: '',
    history: [['', '']]
  });

  // 添加新的状态
  const [fileContent, setFileContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 添加新的状态来存储 AI 生成的多条建议
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);

  // 在状态声明部分添加新的状态
  const [config, setConfig] = useState(() => {
    const savedConfig = localStorage.getItem('aiGeneratorConfig');
    return savedConfig ? JSON.parse(savedConfig) : defaultConfig;
  });

  // 添加配置保存函数
  const saveConfig = (newConfig) => {
    setConfig(newConfig);
    localStorage.setItem('aiGeneratorConfig', JSON.stringify(newConfig));
  };

  // 添加配置表单组件
  const ConfigurationForm = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [tempConfig, setTempConfig] = useState(config);

    const handleSubmit = (e) => {
      e.preventDefault();
      saveConfig(tempConfig);
      setIsOpen(false);
    };

    return (
      <div className="mb-8">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
        >
          {isOpen ? '关闭配置' : '打开配置'}
        </button>

        {isOpen && (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4 p-4 border rounded-lg bg-gray-50">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API Base URL:
              </label>
              <input
                type="text"
                value={tempConfig.baseUrl}
                onChange={(e) => setTempConfig({...tempConfig, baseUrl: e.target.value})}
                className="w-full p-2 border rounded-md"
                placeholder="https://api.deepseek.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API Key:
              </label>
              <input
                type="password"
                value={tempConfig.apiKey}
                onChange={(e) => setTempConfig({...tempConfig, apiKey: e.target.value})}
                className="w-full p-2 border rounded-md"
                placeholder="输入你的 API Key"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                选择模型:
              </label>
              <select
                value={tempConfig.model}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === 'custom') {
                    // 如果选择自定义，保持当前的自定义模型名称
                    setTempConfig({
                      ...tempConfig,
                      model: tempConfig.customModel || ''
                    });
                  } else {
                    // 如果选择预设模型，更新模型名称
                    setTempConfig({
                      ...tempConfig,
                      model: value,
                      customModel: '' // 清空自定义模型
                    });
                  }
                }}
                className="w-full p-2 border rounded-md mb-2"
              >
                {defaultConfig.modelOptions.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
                <option value="custom">自定义模型</option>
              </select>
              
              {/* 自定义模型输入框 */}
              <input
                type="text"
                value={tempConfig.customModel}
                onChange={(e) => {
                  const value = e.target.value;
                  setTempConfig({
                    ...tempConfig,
                    customModel: value,
                    model: value || tempConfig.model // 如果输入为空，保持原有模型
                  });
                }}
                className="w-full p-2 border rounded-md"
                placeholder="输入自定义模型名称"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                生成建议数量:
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={tempConfig.suggestionsCount}
                onChange={(e) => setTempConfig({
                  ...tempConfig, 
                  suggestionsCount: Math.min(10, Math.max(1, parseInt(e.target.value) || 1))
                })}
                className="w-full p-2 border rounded-md"
              />
              <p className="text-sm text-gray-500 mt-1">建议范围：1-10条</p>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                保存配置
              </button>
              <button
                type="button"
                onClick={() => {
                  setTempConfig(defaultConfig);
                  setIsOpen(false);
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                恢复默认
              </button>
            </div>
          </form>
        )}
      </div>
    );
  };

  // 当 dataList 改变时，保存到 localStorage
  useEffect(() => {
    localStorage.setItem('aiTrainingData', JSON.stringify(dataList));
  }, [dataList]);

  const handleInputChange = (e, field) => {
    setFormData({
      ...formData,
      [field]: e.target.value
    });
  };

  const handleHistoryChange = (index, type, value) => {
    const newHistory = [...formData.history];
    if (type === 'instruction') {
      newHistory[index][0] = value;
    } else {
      newHistory[index][1] = value;
    }
    setFormData({
      ...formData,
      history: newHistory
    });
  };

  const addHistoryRow = () => {
    setFormData({
      ...formData,
      history: [...formData.history, ['', '']]
    });
  };

  const removeHistoryRow = (index) => {
    const newHistory = formData.history.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      history: newHistory
    });
  };

  // 清空表单数据
  const resetForm = () => {
    setFormData({
      instruction: '',
      input: '',
      output: '',
      system: '',
      history: [['', '']]
    });
  };

  // 添加当前表单数据到列表
  const addToDataList = () => {
    if (!formData.instruction || !formData.output) {
      alert('请填写必填项：指令和输出');
      return;
    }

    // 清理历史对话数据中的多余引号
    const cleanedHistory = formData.history.map(([q, a]) => [
      q.replace(/^["']|["']$/g, '').trim(),  // 移除首尾的引号
      a.replace(/^["']|["']$/g, '').trim()   // 移除首尾的引号
    ]).filter(([q, a]) => q || a);  // 过滤掉空的对话

    const cleanedData = {
      ...formData,
      // 清理其他字段中可能的多余空格
      instruction: formData.instruction.trim(),
      input: formData.input.trim(),
      output: formData.output.trim(),
      system: formData.system.trim(),
      history: cleanedHistory
    };

    setDataList([...dataList, cleanedData]);
    resetForm();
  };

  // 下载JSON文件
  const downloadJSON = () => {
    try {
      if (dataList.length === 0) {
        alert('请先添加数据');
        return;
      }
      
      // 直接使用 JSON.stringify，不需要特殊处理
      const jsonStr = JSON.stringify(dataList, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `training-data-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('下载出错:', error);
      alert('下载失败，请查控制台错误信息');
    }
  };

  // 删除指定数据
  const removeFromDataList = (index) => {
    const newDataList = dataList.filter((_, i) => i !== index);
    setDataList(newDataList);
  };

  // 清空所有数据（包括本地存储）
  const clearAllData = () => {
    if (window.confirm('确定要清空所有数据吗？此操作不可恢复。')) {
      setDataList([]);
      localStorage.removeItem('aiTrainingData');
    }
  };

  // 文件上传处理
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      let content = '';
      
      if (file.type === 'application/pdf') {
        content = await readPdfFile(file);
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        content = await readDocxFile(file);
      } else if (file.type === 'text/plain') {
        content = await readTextFile(file);
      } else {
        throw new Error('不支持的文件格式');
      }

      setFileContent(content);
      await generateAIResponse(content);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 读取PDF文件
  const readPdfFile = async (file) => {
    // PDF文件读取逻辑
    // 这里需要实现PDF文本提取
    return '提取的PDF文本内容';
  };

  // 读取DOCX文件
  const readDocxFile = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  };

  // 读取文本文件
  const readTextFile = async (file) => {
    return await file.text();
  };

  // 修改 generateAIResponse 函数
  const generateAIResponse = async (content) => {
    try {
      setIsLoading(true);
      
      // 确保有有效的模型名称
      const modelName = config.model || 'deepseek-chat'; // 使用默认值作为后备

      const response = await fetch(`${config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          model: modelName, // 使用确定的模型名称
          messages: [
            {
              role: 'system',
              content: `你是一个大模型训练数据生成助手。请将用户输入的内容转换为${config.suggestionsCount}条训练数据，每条都符合以下格式，并确保返回的是一个有效的JSON数组：
              [
                {
                  "instruction": "用户指令",
                  "input": "用户输入（可选）",
                  "output": "AI回答",
                  "system": "系统提示词（可选）",
                  "history": [["历史问题1", "历史回答1"], ["历史问题2", "历史回答2"]]
                }
              ]
              
              确保每条数据都有不同的角度或重点。
              注意：请确保返回的是一个标准的JSON数组，不要添加任何额外的格式或说明。`
            },
            {
              role: 'user',
              content: `请将以下内容转换为${config.suggestionsCount}条训练数据：\n${content}`
            }
          ],
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`API 请求失败: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);

      if (data.choices && data.choices[0] && data.choices[0].message) {
        const aiResponse = data.choices[0].message.content;
        try {
          // 改进的 JSON 提取逻辑
          let jsonContent;
          
          // 尝试多种可能的格式
          const patterns = [
            /```json\s*(\[[\s\S]*?\])\s*```/, // Markdown 代码块格式
            /```\s*(\[[\s\S]*?\])\s*```/,     // 普通代码块格式
            /(\[[\s\S]*?\])/                   // 纯 JSON 数组格式
          ];

          for (const pattern of patterns) {
            const match = aiResponse.match(pattern);
            if (match) {
              try {
                const extracted = match[1].trim();
                // 尝试解析提取的内容
                const parsed = JSON.parse(extracted);
                if (Array.isArray(parsed)) {
                  jsonContent = parsed;
                  break;
                }
              } catch (e) {
                console.log('当前模式解析失败，尝试下一个模式');
              }
            }
          }

          // 如果所有模式都失败，尝试直接解析整个响应
          if (!jsonContent) {
            try {
              const parsed = JSON.parse(aiResponse);
              if (Array.isArray(parsed)) {
                jsonContent = parsed;
              }
            } catch (e) {
              console.log('直接解析失败');
            }
          }

          if (jsonContent && Array.isArray(jsonContent)) {
            // 验证和清理每个数据项
            const cleanedResponses = jsonContent.map(item => ({
              instruction: (item.instruction || '').trim(),
              input: (item.input || '').trim(),
              output: (item.output || '').trim(),
              system: (item.system || '').trim(),
              history: Array.isArray(item.history) ? item.history.map(([q, a]) => [
                (q || '').trim(),
                (a || '').trim()
              ]) : [['', '']]
            })).filter(item => item.instruction && item.output); // 只保留有必填字段的数据

            if (cleanedResponses.length > 0) {
              setAiSuggestions(cleanedResponses);
              setCurrentSuggestionIndex(0);
              setFormData(cleanedResponses[0]);
              setError(null);
            } else {
              throw new Error('没有找到有效的训练数据');
            }
          } else {
            throw new Error('未能提取有效的 JSON 数组');
          }
        } catch (parseError) {
          console.error('JSON 处理失败:', parseError);
          setError(`数据处理失败: ${parseError.message}`);
          // 将原始应显示在输出中，方便调试
          setFormData({
            instruction: '解析原始响应',
            input: content,
            output: aiResponse,
            system: '',
            history: [['', '']]
          });
        }
      } else {
        throw new Error('API 响应格式不正确');
      }
    } catch (err) {
      console.error('API 调用错误:', err);
      setError(`AI响应生成失败: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 添加切换建议的函数
  const showNextSuggestion = () => {
    const nextIndex = (currentSuggestionIndex + 1) % aiSuggestions.length;
    setCurrentSuggestionIndex(nextIndex);
    setFormData(aiSuggestions[nextIndex]);
  };

  const showPreviousSuggestion = () => {
    const prevIndex = currentSuggestionIndex === 0 
      ? aiSuggestions.length - 1 
      : currentSuggestionIndex - 1;
    setCurrentSuggestionIndex(prevIndex);
    setFormData(aiSuggestions[prevIndex]);
  };

  // 在表单区域上方添加建议导航组件
  const SuggestionNavigation = () => {
    if (aiSuggestions.length <= 1) return null;
    
    return (
      <div className="flex items-center justify-between mb-4 bg-gray-100 p-4 rounded-lg">
        <button
          onClick={showPreviousSuggestion}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          上一个建议
        </button>
        <div className="text-gray-700">
          建议 {currentSuggestionIndex + 1} / {aiSuggestions.length}
        </div>
        <button
          onClick={showNextSuggestion}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          下一个建议
        </button>
      </div>
    );
  };

  // 在 App 组件的状态声明部分添加新状态
  const [articleUrl, setArticleUrl] = useState('');

  // 在 generateAIResponse 函数之前添加新的处理函数
  const handleArticleUrlSubmit = async () => {
    if (!articleUrl) {
      setError('请输入文章链接');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 构建 r.jina.ai 链接
      const jinaUrl = `https://r.jina.ai/${articleUrl}`;
      
      // 获取文章内容
      const response = await fetch(jinaUrl);
      if (!response.ok) {
        throw new Error('获取文章内容失败');
      }
      
      const content = await response.text();
      setFileContent(content);
      
      // 自动生成 AI 响应
      await generateAIResponse(content);
    } catch (err) {
      console.error('文章提取错误:', err);
      setError(`文章内容提取失败: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
            大模型训练数据生成助手(合成数据)-公众号：正经人王同学
          </h1>

          {/* 添加配置组件 */}
          <ConfigurationForm />

          {/* 添加文件上传区域 */}
          <div className="mb-8">
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                  </svg>
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">点击上传</span> 或拖拽文件到这里
                  </p>
                  <p className="text-xs text-gray-500">支持 PDF、DOCX、TXT 文件</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
            {isLoading && (
              <div className="mt-4 text-center text-gray-600">
                正在处理文件...
              </div>
            )}
            {error && (
              <div className="mt-4 text-center text-red-500">
                {error}
              </div>
            )}
          </div>

          {/* 在文件上传区域后添加文章链接输入区 */}
          <div className="mb-8">
            <div className="flex gap-4">
              <input
                type="text"
                value={articleUrl}
                onChange={(e) => setArticleUrl(e.target.value)}
                placeholder="输入文章链接，如: https://mp.weixin.qq.com/s/xxx"
                className="flex-1 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={handleArticleUrlSubmit}
                disabled={!articleUrl || isLoading}
                className={`px-6 py-2 rounded-md text-white ${
                  !articleUrl || isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                提取文章
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              支持微信公众号文章等网页链接
            </p>
          </div>

          {/* 或者直接输入文本 */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              直接输入本:
            </label>
            <textarea
              value={fileContent}
              onChange={(e) => setFileContent(e.target.value)}
              className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="在此输入文本内容..."
            />
            <button
              onClick={() => generateAIResponse(fileContent)}
              disabled={!fileContent || isLoading}
              className={`mt-2 px-4 py-2 rounded-md text-white ${
                !fileContent || isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              生成AI响应
            </button>
          </div>

          <div className="space-y-4 mt-6">
            {aiSuggestions.length > 0 && <SuggestionNavigation />}
            <div className="space-y-6">
              {/* 表单字段 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  指令 (必填):
                </label>
                <textarea
                  value={formData.instruction}
                  onChange={(e) => handleInputChange(e, 'instruction')}
                  placeholder="例如：请帮我写一篇关于人工智能的文章，要求800字左右。"
                  className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  输入 (选填):
                </label>
                <textarea
                  value={formData.input}
                  onChange={(e) => handleInputChange(e, 'input')}
                  placeholder="例如：文章需要包含以下关键点：1. AI的定义 2. AI的应用领域 3. AI的未来发展"
                  className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  输出 (必填):
                </label>
                <textarea
                  value={formData.output}
                  onChange={(e) => handleInputChange(e, 'output')}
                  placeholder="例如：人工智能（AI）是一门致力于研究和开发能够模拟、延伸和扩展人类智能的计算机科学领域...（此处是一篇完整的800字文章）"
                  className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  系统提示词 (选填):
                </label>
                <textarea
                  value={formData.system}
                  onChange={(e) => handleInputChange(e, 'system')}
                  placeholder="例如：你是一位专业的文章写作助手，擅长创作各类主题的文章。你会根据用户的要求，写出结构清晰、内容丰富的文章。"
                  className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-800">
                    历史对话 (选填)
                  </h2>
                  <span className="text-sm text-gray-500">
                    于记录之前的对话内容
                  </span>
                </div>
                {formData.history.map((item, index) => (
                  <div key={index} className="flex gap-4 items-start">
                    <textarea
                      value={item[0]}
                      onChange={(e) => handleHistoryChange(index, 'instruction', e.target.value)}
                      placeholder="例如：这篇文章能否加入一些具体的AI应用案例？"
                      className="flex-1 h-24 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <textarea
                      value={item[1]}
                      onChange={(e) => handleHistoryChange(index, 'response', e.target.value)}
                      placeholder="例如：好的，我来补充一些AI应用案例。在医疗领域，AI被用于..."
                      className="flex-1 h-24 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      onClick={() => removeHistoryRow(index)}
                      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                    >
                      删除
                    </button>
                  </div>
                ))}
                <button
                  onClick={addHistoryRow}
                  className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  添加历史对话行
                </button>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={addToDataList}
                  className="flex-1 px-6 py-3 bg-green-500 text-white font-medium rounded-md hover:bg-green-600 transition-colors"
                >
                  添加到数据列表
                </button>
                <button
                  onClick={resetForm}
                  className="px-6 py-3 bg-gray-500 text-white font-medium rounded-md hover:bg-gray-600 transition-colors"
                >
                  清空表单
                </button>
              </div>

              {/* 显示已添加的数据数量 */}
              {dataList.length > 0 && (
                <div className="text-center text-gray-600">
                  已添加 {dataList.length} 条数据
                </div>
              )}

              {/* 在下载按钮之前添加数据预览区域 */}
              {dataList.length > 0 && (
                <div className="mt-8 border-t pt-8">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">
                      已生成的数据 ({dataList.length}条)
                    </h2>
                  </div>
                  
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {dataList.map((data, index) => (
                      <div key={index} className="border rounded-lg p-4 bg-gray-50 relative">
                        <button
                          onClick={() => removeFromDataList(index)}
                          className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                          title="删除此条数据"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                        
                        <div className="grid gap-2">
                          <div>
                            <span className="font-semibold">指令:</span>
                            <p className="ml-4 text-gray-700">{data.instruction}</p>
                          </div>
                          
                          {data.input && (
                            <div>
                              <span className="font-semibold">输入:</span>
                              <p className="ml-4 text-gray-700">{data.input}</p>
                            </div>
                          )}
                          
                          <div>
                            <span className="font-semibold">输出:</span>
                            <p className="ml-4 text-gray-700">{data.output}</p>
                          </div>
                          
                          {data.system && (
                            <div>
                              <span className="font-semibold">系统提示词:</span>
                              <p className="ml-4 text-gray-700">{data.system}</p>
                            </div>
                          )}
                          
                          {data.history.length > 0 && data.history[0][0] && (
                            <div>
                              <span className="font-semibold">历史对话:</span>
                              <div className="ml-4">
                                {data.history.map((item, idx) => (
                                  <div key={idx} className="mb-2">
                                    <p className="text-gray-700">问: {item[0]}</p>
                                    <p className="text-gray-700">答: {item[1]}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 flex gap-4">
                <button
                  onClick={downloadJSON}
                  disabled={dataList.length === 0}
                  className={`flex-1 px-6 py-3 text-white font-medium rounded-md transition-colors ${
                    dataList.length === 0 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  下载JSON文件 ({dataList.length}条)
                </button>
                
                {dataList.length > 0 && (
                  <button
                    onClick={clearAllData}
                    className="px-6 py-3 bg-red-500 text-white font-medium rounded-md hover:bg-red-600 transition-colors"
                  >
                    清空所有数据
                  </button>
                )}
              </div>

              {/* 添加提示信息 */}
              <div className="mt-4 text-sm text-gray-500 text-center">
                数据已自动保存到本地存储
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

  