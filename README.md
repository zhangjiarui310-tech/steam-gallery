# Steam Gallery

一个现代化的 Steam 游戏库可视化展示应用，支持 2D 平面和 3D 立体两种展示模式，让你以全新的方式浏览你的 Steam 游戏收藏。

## 🚀 功能特性

- **双模式展示**：支持 2D 平面网格和 3D 立体画廊两种浏览模式
- **Steam 集成**：通过 Steam API 实时获取用户资料和游戏库信息
- **多语言支持**：内置英文和中文界面
- **响应式设计**：适配桌面和移动设备
- **流畅动画**：使用 Framer Motion 实现平滑的过渡效果
- **3D 交互**：基于 Three.js 和 React Three Fiber 的沉浸式 3D 体验

## 🛠️ 技术栈

- **前端框架**：Next.js 15 + React 19
- **样式方案**：Tailwind CSS 4
- **3D 渲染**：Three.js + React Three Fiber + Drei
- **动画效果**：Framer Motion
- **状态管理**：React useState
- **API 集成**：Steam Web API
- **国际化**：自定义 i18n 实现
- **类型系统**：TypeScript

## 📦 快速开始

### 前提条件

- Node.js 18.0 或更高版本
- Steam API Key（获取地址：[Steam 开发者门户](https://steamcommunity.com/dev/apikey)）

### 安装步骤

1. **克隆项目**

   ```bash
   git clone https://github.com/yourusername/steamgallery.git
   cd steamgallery
   ```

2. **安装依赖**

   ```bash
   npm install
   ```

3. **配置环境变量**

   复制 `.env.example` 文件并重命名为 `.env.local`，然后添加你的 Steam API Key：

   ```env
   STEAM_API_KEY="你的 Steam API Key"
   ```

4. **启动开发服务器**

   ```bash
   npm run dev
   ```

   应用将在 `http://localhost:3000` 启动

5. **构建生产版本**

   ```bash
   npm run build
   npm start
   ```

## 📁 项目结构

```
steamgallery/
├── app/                    # Next.js 应用目录
│   ├── api/                # API 路由
│   │   ├── image-proxy/    # 图片代理 API
│   │   └── steam/          # Steam API 集成
│   ├── locales/            # 国际化文件
│   ├── globals.css         # 全局样式
│   ├── layout.tsx          # 应用布局
│   └── page.tsx            # 主页面
├── components/             # 组件目录
│   ├── FlatShowcase.tsx    # 2D 游戏展示组件
│   ├── Gallery3D.tsx       # 3D 游戏展示组件
│   ├── LanguageSwitcher.tsx # 语言切换组件
│   ├── ProfileHeader.tsx   # 用户资料头部
│   └── SteamInput.tsx      # Steam ID 输入组件
├── hooks/                  # 自定义钩子
├── lib/                    # 工具库
├── .env.local              # 环境变量
├── package.json            # 项目配置
└── README.md               # 项目文档
```

## 🌐 API 说明

### Steam API 集成

- **`/api/steam/profile`** - 获取用户资料信息
- **`/api/steam/games`** - 获取用户游戏库
- **`/api/steam/achievements`** - 获取游戏成就信息
- **`/api/image-proxy`** - 代理 Steam 图片资源

### 使用方法

1. 在首页输入你的 Steam ID 或自定义 URL
2. 点击搜索按钮获取你的游戏库
3. 使用顶部的视图切换按钮在 2D 和 3D 模式之间切换
4. 在 3D 模式下，你可以使用鼠标拖动旋转视角，滚轮缩放

## 🔧 开发指南

### 代码风格

- 使用 TypeScript 进行类型检查
- 遵循 ESLint 规则
- 使用 Tailwind CSS 进行样式开发
- 组件命名使用 PascalCase
- 变量和函数命名使用 camelCase

### 运行测试

```bash
# 运行 ESLint 检查
npm run lint

# 清理构建缓存
npm run clean
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来帮助改进这个项目！

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- [Steam Web API](https://steamcommunity.com/dev) - 提供游戏数据
- [Next.js](https://nextjs.org/) - 现代化 React 框架
- [Three.js](https://threejs.org/) - 3D 渲染库
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架
- [Framer Motion](https://www.framer.com/motion/) - 动画库

---

**享受探索你的 Steam 游戏库的全新方式！** 🎮
