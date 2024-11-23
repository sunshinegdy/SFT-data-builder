import React, { useState, useRef } from 'react';
// import config from '../config';

const ImageDatasetGenerator = ({ config }) => {
  const [uploadedImages, setUploadedImages] = useState([]);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [finalDataset, setFinalDataset] = useState([]);
  const fileInputRef = useRef(null);

  const apiKey = process.env.REACT_APP_OPENAI_API_KEY;

  // 在文件顶部添加一个函数来获取图片的相对路径或文件名
  const getImageLocalPath = (file) => {
    if (file && file.name) {
      return `images/${file.name}`; // 假设图片会保存在 images 目录下
    }
    return '';
  };

  // 处理图片上传
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    
    // 验证文件类型
    const validFiles = files.filter(file => 
      file.type.startsWith('image/')
    );

    if (validFiles.length !== files.length) {
      setError('请只上传图片文件');
      return;
    }

    // 转换图片为 base64
    Promise.all(
      validFiles.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({
              file, // 保存原始文件信息
              base64: reader.result,
              path: URL.createObjectURL(file),
              name: file.name // 保存文件名
            });
          };
          reader.readAsDataURL(file);
        });
      })
    ).then(images => {
      setUploadedImages(prev => [...prev, ...images]);
      setError('');
    });
  };

  // 为每张图片生成问题
  const generateQuestions = async () => {
    if (uploadedImages.length === 0) {
      setError('请先上传图片');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const questions = await Promise.all(
        uploadedImages.map(async (image) => {
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              "Authorization": `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              messages: [
                {
                  role: 'user',
                  content: [
                    {
                      type: "text",
                      text: "请基于这张图片生成3个有意义的问题。问题要简洁、明确，并且与图片内容直接相关。"
                    },
                    {
                      type: "image_url",
                      image_url: {
                        url: image.base64,
                        detail: "auto"
                      }
                    }
                  ]
                }
              ],
              max_tokens: 300
            })
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API 请求失败: ${errorData.error?.message || '未知错误'}`);
          }

          const data = await response.json();
          const questions = data.choices[0].message.content
            .split('\n')
            .filter(q => q.trim())
            .map(q => ({
              question: q,
              isEditing: false,
              answer: ''
            }));

          return {
            imagePath: image.path,
            questions
          };
        })
      );

      setGeneratedQuestions(questions);
    } catch (err) {
      setError(`生成问题失败: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 编辑问题
  const handleQuestionEdit = (imageIndex, questionIndex, newQuestion) => {
    setGeneratedQuestions(prev => {
      const newQuestions = [...prev];
      newQuestions[imageIndex].questions[questionIndex].question = newQuestion;
      return newQuestions;
    });
  };

  // 切换问题编辑状态
  const toggleQuestionEdit = (imageIndex, questionIndex) => {
    setGeneratedQuestions(prev => {
      const newQuestions = [...prev];
      newQuestions[imageIndex].questions[questionIndex].isEditing = 
        !newQuestions[imageIndex].questions[questionIndex].isEditing;
      return newQuestions;
    });
  };

  // 生成答案
  const generateAnswers = async () => {
    setIsLoading(true);
    setError('');

    try {
      const newQuestions = await Promise.all(
        generatedQuestions.map(async (imageData) => {
          const questionsWithAnswers = await Promise.all(
            imageData.questions.map(async (q) => {
              const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${apiKey}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  model: 'gpt-4o-mini',
                  messages: [
                    {
                      role: 'user',
                      content: [
                        {
                          type: "text",
                          text: q.question
                        },
                        {
                          type: "image_url",
                          image_url: {
                            url: uploadedImages.find(img => img.path === imageData.imagePath).base64,
                            detail: "auto"
                          }
                        }
                      ]
                    }
                  ],
                  max_tokens: 300
                })
              });

              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API 请求失败: ${errorData.error?.message || '未知错误'}`);
              }

              const data = await response.json();
              return {
                ...q,
                answer: data.choices[0].message.content
              };
            })
          );

          return {
            ...imageData,
            questions: questionsWithAnswers
          };
        })
      );

      setGeneratedQuestions(newQuestions);
      
      // 修改数据集转换逻辑
      const dataset = newQuestions.flatMap(imageData => {
        // 找到对应的原始图片文件
        const originalImage = uploadedImages.find(img => img.path === imageData.imagePath);
        const imagePath = originalImage ? getImageLocalPath(originalImage.file) : '';
        
        return imageData.questions.map(q => ({
          conversations: [
            {
              from: 'human',
              value: `<image>${q.question}`
            },
            {
              from: 'assistant',
              value: q.answer
            }
          ],
          images: [imagePath]
        }));
      });

      setFinalDataset(dataset);
    } catch (err) {
      setError(`生成答案失败: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 下载数据集
  const downloadDataset = () => {
    if (finalDataset.length === 0) {
      setError('没有可下载的数据');
      return;
    }

    const blob = new Blob([JSON.stringify(finalDataset, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `image-dataset-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          图片理解数据集生成器
        </h1>

        {/* 图片上传区域 */}
        <div className="mb-8">
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                </svg>
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">点击上传</span> 或拖拽图片到这里
                </p>
                <p className="text-xs text-gray-500">支持 JPG, PNG 格式</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
              />
            </label>
          </div>
        </div>

        {/* 已上传的图片预览 */}
        {uploadedImages.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">已上传的图片:</h2>
            <div className="grid grid-cols-3 gap-4">
              {uploadedImages.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image.path}
                    alt={`上传的图片 ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => {
                      setUploadedImages(prev => prev.filter((_, i) => i !== index));
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 生成问题按钮 */}
        <button
          onClick={generateQuestions}
          disabled={isLoading || uploadedImages.length === 0}
          className={`w-full py-3 rounded-md text-white font-medium ${
            isLoading || uploadedImages.length === 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {isLoading ? '生成中...' : '生成问题'}
        </button>

        {/* 生成的问题列表 */}
        {generatedQuestions.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">生成的问题:</h2>
            {generatedQuestions.map((imageData, imageIndex) => (
              <div key={imageIndex} className="mb-8">
                <img
                  src={imageData.imagePath}
                  alt={`图片 ${imageIndex + 1}`}
                  className="w-48 h-48 object-cover rounded-lg mb-4"
                />
                <div className="space-y-4">
                  {imageData.questions.map((q, qIndex) => (
                    <div key={qIndex} className="flex items-center gap-4">
                      {q.isEditing ? (
                        <input
                          type="text"
                          value={q.question}
                          onChange={(e) => handleQuestionEdit(imageIndex, qIndex, e.target.value)}
                          className="flex-1 p-2 border rounded-md"
                        />
                      ) : (
                        <p className="flex-1">{q.question}</p>
                      )}
                      <button
                        onClick={() => toggleQuestionEdit(imageIndex, qIndex)}
                        className="px-3 py-1 text-sm border rounded-md hover:bg-gray-100"
                      >
                        {q.isEditing ? '保存' : '编辑'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 生成答案按钮 */}
        {generatedQuestions.length > 0 && (
          <button
            onClick={generateAnswers}
            disabled={isLoading}
            className={`w-full py-3 rounded-md text-white font-medium mt-4 ${
              isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {isLoading ? '生成中...' : '生成答案'}
          </button>
        )}

        {/* 错误提示 */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* 最终数据集预览和下载 */}
        {finalDataset.length > 0 && (
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">生成的数据集:</h2>
              <button
                onClick={downloadDataset}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                下载数据集
              </button>
            </div>
            <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto">
              {JSON.stringify(finalDataset, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageDatasetGenerator; 