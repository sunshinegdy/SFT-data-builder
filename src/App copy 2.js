import { useState, useEffect } from 'react';
// 添加文件解析库
import { Document, Page, pdfjs } from 'react-pdf';
import mammoth from 'mammoth';
// 导入默认配置
import defaultConfig from './config';
// 在文件顶部添加路由相关的导入
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import BatchProcessor from './components/BatchProcessor';
import Credits from './components/Credits';
import FormatConverter from './components/transfertools';
import HuggingFaceUploader from './components/HuggingFaceUploader';
import CotGenerator from './components/CotGenerator';

// 设置pdf.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

// 创建一个新的导航组件来使用 useLocation
function Navigation() {
  const location = useLocation();
  
  return (
    <nav className="mb-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="flex flex-wrap justify-center items-center p-4 gap-2">
          <Link
            to="/"
            className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
              location.pathname === '/'
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>单条处理</span>
            </div>
          </Link>
          
          <Link
            to="/batch"
            className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
              location.pathname === '/batch'
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7C5 4 4 5 4 7z M8 4v4M16 4v4M4 11h16" />
              </svg>
              <span>批量处理</span>
            </div>
          </Link>
     

        

          <Link
            to="/transfer"
            className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
              location.pathname === '/transfer'
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <span>格式转换</span>
            </div>
          </Link>


          <Link
            to="/credits"
            className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
              location.pathname === '/credits'
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>致谢</span>
            </div>
          </Link>

          <Link
            to="/cot"
            className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
              location.pathname === '/cot'
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>CoT 生成器</span>
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
}

// 在 App.js 中添加 CoT 相关的 system prompt
const COT_SYSTEM_PROMPT = `你是一个专家级的AI助手。你的任务分为两步：

第一步：基于用户提供的参考资料，生成3个有深度的问题。这些问题应该：
1. 需要深入的分析和推理
2. 涉及多角度或方面
3. 能引发思考和讨论
4. 与参考资料内容密切相关

第二步：对每个问题，提供完整的推理过程，包括：
1. 使用3-5个推理步骤
2. 探索多种方法以达到答案
3. 通过不同的方法验证答案
4. 考虑潜在的替代答案并解释为何被拒绝
5. 考虑推理可能出错的地方
6. 充分测试所有其他可能性

请以JSON格式输出，格式如下：
[
  {
    "question": "生成的问题1",
    "reasoning_steps": [
      {
        "title": "步骤1标题",
        "content": "步骤1详细内容",
        "next_action": "continue"
      },
      {
        "title": "步骤2标题",
        "content": "步骤2详细内容",
        "next_action": "continue"
      },
      {
        "title": "最终结论",
        "content": "总结性结论",
        "next_action": "final_answer"
      }
    ]
  },
  // ... 其他问题
]`;

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
                模型:
              </label>
              <select
                value={tempConfig.model}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === 'custom') {
                    // 如果选择自定义，保持当前的自定义模型名���
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

  // 添加当前表数据到列表
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
      // 清理其他字段的可能的多余空格
      instruction: formData.instruction.trim(),
      input: formData.input.trim(),
      output: formData.output.trim(),
      system: formData.system.trim(),
      history: cleanedHistory
    };

    setDataList([...dataList, cleanedData]);
    resetForm();
  };

  // 载JSON文件
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

  // 读取DOCX件
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
      
      const modelName = config.model || 'deepseek-chat';
      const systemPrompt = dataType === 'cot' ? COT_SYSTEM_PROMPT : 
        `你是一个大模型训练数据生成助手。请将用户输入的内容转换为${config.suggestionsCount}条训练数据，每条都符合以下格式，并确保返回的是一个有效的JSON数组：
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
        注意：请确保返回的是一个标准的JSON数组，不要添加任何额外的格式或说明。`;

      const response = await fetch(`${config.baseUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          model: modelName,
          max_tokens: 4096,
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: `请基于以下内容生成数据：\n${content}`
            }
          ],
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`API 请求失败: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.choices && data.choices[0] && data.choices[0].message) {
        const aiResponse = data.choices[0].message.content;
        
        // 解析JSON响应
        let jsonContent;
        const patterns = [
          /```json\s*(\[[\s\S]*?\])\s*```/,
          /```\s*(\[[\s\S]*?\])\s*```/,
          /(\[[\s\S]*?\])/
        ];

        for (const pattern of patterns) {
          const match = aiResponse.match(pattern);
          if (match) {
            try {
              const extracted = match[1].trim();
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
          if (dataType === 'cot') {
            // 处理 CoT 类型的响应
            const cotData = jsonContent.map(item => ({
              instruction: item.question,
              input: JSON.stringify(item.reasoning_steps, null, 2),
              output: item.reasoning_steps[item.reasoning_steps.length - 1].content,
              type: 'cot'
            }));
            setAiSuggestions(cotData);
            setCurrentSuggestionIndex(0);
            setFormData(cotData[0]);
          } else {
            // 处理对话类型的响应
            const cleanedResponses = jsonContent.map(item => ({
              instruction: (item.instruction || '').trim(),
              input: (item.input || '').trim(),
              output: (item.output || '').trim(),
              system: (item.system || '').trim(),
              history: Array.isArray(item.history) ? item.history.map(([q, a]) => [
                (q || '').trim(),
                (a || '').trim()
              ]) : [['', '']]
            })).filter(item => item.instruction && item.output);

            if (cleanedResponses.length > 0) {
              setAiSuggestions(cleanedResponses);
              setCurrentSuggestionIndex(0);
              setFormData(cleanedResponses[0]);
            }
          }
          setError(null);
        } else {
          throw new Error('未能提取有效的训练数据');
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

  // 在表单区域上方添加建议导航组
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

  // 在 App 组件的状态声明部分添加数据类型选择
  const [dataType, setDataType] = useState('dialogue'); // 'dialogue' 或 'cot'

  // 在状态声明部分添加 CoT 数据列表
  const [cotDataList, setCotDataList] = useState(() => {
    const savedData = localStorage.getItem('cotTrainingData');
    return savedData ? JSON.parse(savedData) : [];
  });

  // 添加 CoT 数据保存函数
  useEffect(() => {
    localStorage.setItem('cotTrainingData', JSON.stringify(cotDataList));
  }, [cotDataList]);

  return (
    <Router>
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <Navigation />
          <Routes>
            <Route path="/batch" element={
              <BatchProcessor 
                config={config}
                generateAIResponse={generateAIResponse}
              />
            } />
            <Route path="/credits" element={<Credits />} />
            <Route path="/transfer" element={<FormatConverter />} />
            <Route path="/cot" element={<CotGenerator config={config} />} />
            <Route path="/" element={
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">
                  捕获月球多模态合成数据平台
                 
                </h1>
                
                <div className="flex flex-wrap justify-center items-center gap-4 mb-8 text-sm" style={{ textAlign: 'center' }}>致力于打造低成本的人人都懂用的多模态合成数据解决方案<br/>助力各类大模型的预训练、微调、o1、function calling、agent等训练场景,欢迎加入我们或与我们合作！</div>

                {/* 添加导航链接 */}
                <div className="flex flex-wrap justify-center items-center gap-4 mb-8 text-sm">
                  <a
                    href="https://github.com/zjrwtx/SFT-data-builder"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                    <span>GitHub</span>
                  </a>

                  <a
                    href="https://mp.weixin.qq.com/s/ybihzjCJCL18uS_pYXpkcA"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229 .826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.018-.27-.027-.407-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"/>
                    </svg>
                    <span>公众号：正经人王同学</span>
                  </a>

                  <a
                    href="mailto:3038880699@qq.com"
                    className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>联系作者：微信：whatisallineed</span>
                  </a>

                  <div className="flex items-center gap-1 text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Version 1.0.0</span>
                  </div>
                </div>

                {/* 保持原有的 ConfigurationForm 和其他组件 */}
                <ConfigurationForm />

                {/* 在配置表单后，文件上传区域前添加数据类型选择器 */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    选择数据类型:
                  </label>
                  <select
                    value={dataType}
                    onChange={(e) => setDataType(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="dialogue">纯对话类型</option>
                    <option value="cot">CoT (Chain of Thought) 类型</option>
                  </select>
                </div>

                {/* 保持原有的文件上传区域和文章链接输入区 */}
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
                  
                  {dataType === 'dialogue' ? (
                    // 原有的对话类型表单
                    <div className="space-y-6">
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
                          placeholder="例如：你是一位专业的文章写助手，擅长创作各类主题的文章。你会根据用户的要求，写出结构清晰、内容丰富的文章。"
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
                              placeholder="例如：好的，我来补充些AI应用案例。在医领域，AI被用于..."
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
                          ���加历史对话行
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
                                  {data.type === 'cot' ? (
                                    // CoT 类型数据显示
                                    <>
                                      <div>
                                        <span className="font-semibold">标题:</span>
                                        <p className="ml-4 text-gray-700">{data.instruction}</p>
                                      </div>
                                      <div>
                                        <span className="font-semibold">推理过程:</span>
                                        <pre className="ml-4 text-gray-700 whitespace-pre-wrap">
                                          {data.input}
                                        </pre>
                                      </div>
                                      <div>
                                        <span className="font-semibold">结论:</span>
                                        <p className="ml-4 text-gray-700">{data.output}</p>
                                      </div>
                                    </>
                                  ) : (
                                    // 对话类型数据显示（原有的显示逻辑）
                                    <>
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
                                      {/* ... 其他对话类型字段 ... */}
                                    </>
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
                  ) : (
                    // CoT 类型表单
                    <CotGenerator 
                      config={config}
                      fileContent={fileContent}
                      onDataGenerated={(data) => {
                        // 将生成的 CoT 数据添加到专门的 CoT 数据列表
                        setCotDataList([...cotDataList, ...data]);
                      }}
                    />
                  )}
                </div>

                {dataList.length > 0 && (
                  <HuggingFaceUploader 
                    data={dataList}
                    fileName={`training-data-${new Date().toISOString().slice(0, 10)}.json`}
                  />
                )}

                {cotDataList.length > 0 && (
                  <div className="mt-8 border-t pt-8">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold text-gray-800">
                        CoT类数据 ({cotDataList.length}条)
                      </h2>
                      <div className="flex gap-2">
                        <button
                          onClick={() => downloadJSON(cotDataList, 'cot')}
                          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                        >
                          下载CoT数据
                        </button>
                        <HuggingFaceUploader 
                          data={cotDataList}
                          fileName={`cot-data-${new Date().toISOString().slice(0, 10)}.json`}
                          formatData={(data) => data.map(item => ({
                            question: item.question,
                            reasoning_steps: item.reasoning_steps
                          }))}
                        />
                      </div>
                    </div>
                    {/* ... 其他显示逻辑 ... */}
                  </div>
                )}
              </div>
            } />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;

  