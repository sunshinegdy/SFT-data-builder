# 🤖 大模型训练数据生成助手(合成数据)-公众号：正经人王同学

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![React](https://img.shields.io/badge/React-18.x-61dafb.svg)

<p align="center">
  <img src="docs/images/demo.gif" alt="演示" width="800">
</p>

## ✨ 特性

- 🎯 **一键生成训练数据**：将普通文本秒变高质量AI训练数据 支持直接从微信公众号文章等链接内容生成训练数据
- 🔄 **批量生成**：一次生成多条不同角度的训练数据
- 📝 **灵活编辑**：所有生成的数据都可以随时编辑和调整
- 💾 **本地存储**：自动保存所有数据到本地
- 📤 **导出简单**：一键导出标准格式JSON文件
- 🎨 **优雅界面**：简洁直观的用户界面，操作便捷
- 🔌 **多模型支持**：支持多种主流AI模型，可自定义模型
- 📚 **多格式支持**：支持PDF、Word、TXT等多种文件格式

## 🚀 快速开始

### 安装依赖 
```bash
npm install
```
### 启动项目
```bash
npm run start
```

## 📖 使用指南

1. **配置API**
   - 点击"打开配置"按钮
   - 设置API地址和密钥
   - 选择或自定义AI模型
   - 设置每次生成的数据条数

2. **输入内容**
   - 上传文件（支持PDF、DOCX、TXT）
   - 或直接输入文本内容

3. **生成数据**
   - 点击"生成AI响应"按钮
   - 在多个生成结果中切换
   - 根据需要编辑生成的内容

4. **管理数据**
   - 添加到数据列表
   - 预览所有生成的数据
   - 删除不需要的数据
   - 导出为JSON文件

## 🎯 训练数据格式
json
{
"instruction": "用户指令",
"input": "用户输入（可选）",
"output": "AI回答",
"system": "系统提示词（可选）",
"history": [
["历史问题1", "历史回答1"],
["历史问题2", "历史回答2"]
]
}


## 🛠️ 技术栈

- ⚛️ React 18
- 🎨 TailwindCSS
- 📄 PDF.js
- 📝 Mammoth.js
- 💾 LocalStorage API

## 📋 待办功能

- [ ] 支持更多文件格式
- [ ] 添加数据验证功能
- [ ] 批量导入功能
- [ ] 数据标签系统
- [ ] 导出更多格式

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交改动 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 📜 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 👨‍💻 作者

正经人王同学

- 微信公众号：正经人王同学
- 微信:whatisallineed
- GitHub：[https://github.com/zjrwtx](https://github.com/zjrwtx)
- Email：[3038880699@qq.com](mailto:3038880699@qq.com)

## 🌟 Star 历史

[![Star History Chart](https://api.star-history.com/svg?repos=zjrwtx/SFT-data-builder&type=Date)](https://star-history.com/#zjrwtx/SFT-data-builder&Date)

## 🙏 鸣谢

感谢所有为这个项目做出贡献的开发者！

---

如果这个项目对你有帮助，请给一个 ⭐️ 鼓励一下！
