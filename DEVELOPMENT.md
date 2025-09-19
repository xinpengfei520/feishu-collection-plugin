# 飞书收藏插件开发指南

## 🛠️ 开发环境搭建

### 前置要求
- Node.js ≥ 14.0.0
- Chrome浏览器（最新版）
- 代码编辑器（VS Code推荐）

### 项目初始化
```bash
# 克隆项目
git clone https://github.com/your-username/feishu-collection-plugin.git
cd feishu-collection-plugin

# 安装依赖
npm install

# 运行构建
npm run build
```

## 📁 项目结构

```
feishu-collection-plugin/
├── manifest.json          # 插件配置文件
├── background.js          # 后台服务脚本
├── content.js             # 内容脚本
├── utils.js               # 工具函数库
├── build.js               # 构建脚本
├── package.json           # 项目配置
├── test.html              # 测试页面
├── quick-test.js          # 快速测试脚本
├── popup/                 # 弹出窗口
│   ├── popup.html         # 弹窗HTML
│   ├── popup.js           # 弹窗交互逻辑
│   └── popup.css          # 弹窗样式
├── options/               # 设置页面
│   ├── options.html       # 设置页面HTML
│   ├── options.js         # 设置页面逻辑
│   └── options.css        # 设置页面样式
├── lib/                   # 工具库
│   ├── feishu-api.js      # 飞书API封装
│   └── storage.js         # 本地存储管理
└── icons/                 # 图标资源
    ├── icon.svg           # SVG源文件
    ├── icon16.png         # 16x16图标
    ├── icon48.png         # 48x48图标
    └── icon128.png        # 128x128图标
```

## 🔧 核心模块

### 1. Manifest配置 (manifest.json)
```json
{
  "manifest_version": 3,
  "name": "飞书收藏插件",
  "version": "1.0.0",
  "description": "一键收藏网页到飞书多维表格",
  "permissions": ["activeTab", "storage", "scripting"],
  "host_permissions": ["https://open.feishu.cn/*", "https://*.feishu.cn/*"]
}
```

### 2. 后台脚本 (background.js)
- 处理核心业务逻辑
- 管理飞书API调用
- 协调数据同步
- 监听浏览器事件

### 3. 内容脚本 (content.js)
- 注入网页获取信息
- 提取页面元数据
- 处理动态内容

### 4. 弹窗界面 (popup/)
- 提供用户交互界面
- 显示页面信息
- 收集用户输入（标签、备注）

### 5. 设置页面 (options/)
- 插件配置管理
- 数据管理界面
- 高级功能设置

## 🚀 开发流程

### 1. 功能开发
```bash
# 1. 创建新分支
git checkout -b feature/new-feature

# 2. 开发功能
# 编辑相关文件...

# 3. 测试功能
npm run test

# 4. 构建项目
npm run build
```

### 2. 代码规范
- 使用ES6+语法
- 异步操作使用async/await
- 错误处理使用try/catch
- 添加必要的注释

### 3. 提交规范
```
feat: 添加新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建/工具相关
```

## 🧪 测试方法

### 单元测试
```javascript
// 运行快速测试
window.runPluginTests();

// 或在测试页面自动运行
```

### 功能测试
1. 打开 `test.html` 文件
2. 检查控制台输出
3. 验证各项功能

### 集成测试
1. 配置飞书API信息
2. 测试收藏同步功能
3. 验证数据一致性

## 📋 API接口

### 飞书API端点
```
# 认证
POST /auth/v3/tenant_access_token/internal

# 表格管理
GET  /bitable/v1/apps/{app_token}/tables/{table_id}/fields
POST /bitable/v1/apps/{app_token}/tables/{table_id}/records
PUT  /bitable/v1/apps/{app_token}/tables/{table_id}/records/{record_id}
DELETE /bitable/v1/apps/{app_token}/tables/{table_id}/records/{record_id}
```

### 数据格式
```javascript
// 收藏记录格式
{
  title: "页面标题",
  url: "https://example.com",
  description: "页面描述",
  tags: ["标签1", "标签2"],
  notes: "用户备注",
  icon: "图标URL",
  keywords: ["关键词1", "关键词2"],
  createdAt: "2025-01-01T00:00:00.000Z",
  synced: false,
  feishuRecordId: null
}
```

## 🎨 UI设计

### 设计原则
- 简洁直观的界面
- 统一的颜色主题
- 响应式布局
- 良好的用户体验

### 颜色方案
```css
:root {
  --primary-color: #3370ff;
  --secondary-color: #2c5aa0;
  --success-color: #4caf50;
  --error-color: #f44336;
  --warning-color: #ff9800;
  --text-color: #333;
  --bg-color: #f8f9fa;
}
```

## 🔍 调试技巧

### 1. 控制台调试
```javascript
// 在background.js中添加日志
console.log('Background script loaded');

// 在popup.js中添加日志
console.log('Popup opened', new Date());

// 在content.js中添加日志
console.log('Content script injected');
```

### 2. 断点调试
- 打开Chrome DevTools
- 切换到Sources面板
- 在代码行号处点击设置断点
- 刷新页面触发断点

### 3. 网络调试
- 监控飞书API请求
- 检查请求/响应数据
- 验证状态码和错误信息

## 🚢 发布流程

### 1. 版本更新
```bash
# 更新版本号
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0
```

### 2. 构建打包
```bash
npm run build
```

### 3. 测试验证
- 运行所有测试用例
- 验证功能完整性
- 检查代码质量

### 4. 发布准备
- 更新CHANGELOG.md
- 完善文档
- 准备发布说明

## 🔐 安全考虑

### 1. 数据安全
- 敏感信息加密存储
- API密钥安全传输
- 用户数据隐私保护

### 2. 权限控制
- 最小权限原则
- 用户授权确认
- 数据访问限制

### 3. 错误处理
- 友好的错误提示
- 安全的错误日志
- 异常恢复机制

## 📊 性能优化

### 1. 代码优化
- 减少DOM操作
- 使用事件委托
- 避免内存泄漏

### 2. 存储优化
- 合理的数据结构
- 压缩存储空间
- 定期清理数据

### 3. 网络优化
- 请求合并
- 缓存策略
- 失败重试

## 🤝 贡献指南

### 1. 报告问题
- 使用GitHub Issues
- 提供详细描述
- 包含复现步骤

### 2. 提交代码
- Fork项目仓库
- 创建特性分支
- 提交Pull Request

### 3. 代码审查
- 遵循代码规范
- 添加测试用例
- 更新相关文档

## 📚 相关资源

- [Chrome扩展开发文档](https://developer.chrome.com/docs/extensions/)
- [飞书开放平台API](https://open.feishu.cn/document/)
- [Manifest V3迁移指南](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [WebExtensions API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)

## 🎯 未来规划

### 短期目标
- 🔧 修复已知问题
- 📱 优化移动端体验
- 🌐 支持多语言

### 长期目标
- 🔄 支持更多平台（Firefox、Edge）
- 📊 增强数据分析功能
- 🤖 AI智能标签推荐
- 🔄 双向同步支持

---

**让我们一起打造更好的飞书收藏插件！** 🚀

如有问题或建议，欢迎提交Issue或Pull Request。","file_path":"/Users/vancexin/ClaudeCode/feishu-collection-plugin/DEVELOPMENT.md"}    