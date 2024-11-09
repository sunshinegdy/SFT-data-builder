function Credits() {
  const contributors = [
    {
      name: "正经人王同学",
      role: "项目发起人",
      links: {
        github: "https://github.com/zjrwtx",
        wechat: "whatisallineed",
        email: "3038880699@qq.com"
      }
    }
  ];

  const specialThanks = [
    {
      name: "DeepSeek",
      description: "提供强大的API支持",
      link: "https://deepseek.com"
    },
    {
      name: "Jina AI",
      description: "提供网页内容提取服务",
      link: "https://jina.ai"
    }
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-12">
          致谢
        </h1>

        {/* 贡献者部分 */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-gray-700">
            项目贡献者
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {contributors.map((contributor, index) => (
              <div
                key={index}
                className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm"
              >
                <h3 className="text-xl font-medium text-gray-800 mb-2">
                  {contributor.name}
                </h3>
                <p className="text-gray-600 mb-4">{contributor.role}</p>
                <div className="flex gap-4">
                  {contributor.links.github && (
                    <a
                      href={`https://github.com/${contributor.links.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                      </svg>
                    </a>
                  )}
                  {contributor.links.wechat && (
                    <span className="text-gray-600 hover:text-gray-900 cursor-pointer" title={`微信: ${contributor.links.wechat}`}>
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229 .826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.018-.27-.027-.407-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"/>
                      </svg>
                    </span>
                  )}
                  {contributor.links.email && (
                    <a
                      href={`mailto:${contributor.links.email}`}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 特别感谢部分 */}
        <section>
          <h2 className="text-2xl font-semibold mb-6 text-gray-700">
            特别感谢
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {specialThanks.map((item, index) => (
              <a
                key={index}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="text-xl font-medium text-gray-800 mb-2">
                  {item.name}
                </h3>
                <p className="text-gray-600">{item.description}</p>
              </a>
            ))}
          </div>
        </section>

        {/* 开源协议部分 */}
        <section className="mt-12 text-center text-gray-600">
          <p>本项目基于 MIT 协议开源</p>
          <p className="mt-2">
            欢迎提交 
            <a 
              href="https://github.com/zjrwtx/SFT-data-builder/issues" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 mx-1"
            >
              Issues
            </a> 
            和 
            <a 
              href="https://github.com/zjrwtx/SFT-data-builder/pulls" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 mx-1"
            >
              Pull Requests
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}

export default Credits; 