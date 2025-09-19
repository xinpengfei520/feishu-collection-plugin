// 构建脚本 - 用于生成图标和打包插件
const fs = require('fs');
const path = require('path');

// 检查Node.js环境
if (typeof require === 'undefined') {
    console.log('⚠️  构建脚本需要在Node.js环境中运行');
    console.log('📋 请使用以下命令安装依赖并构建：');
    console.log('   npm install');
    console.log('   npm run build');
    process.exit(1);
}

// 创建图标（简单的文本图标）
function createIcons() {
    const iconsDir = path.join(__dirname, 'icons');
    
    // 确保icons目录存在
    if (!fs.existsSync(iconsDir)) {
        fs.mkdirSync(iconsDir);
    }

    // 创建简单的文本图标文件
    const iconSizes = [16, 48, 128];
    
    iconSizes.forEach(size => {
        const iconPath = path.join(iconsDir, `icon${size}.png`);
        
        // 创建简单的PNG文件头（这里只是占位符）
        // 在实际项目中，您需要使用图像处理库生成真实的PNG文件
        const placeholderContent = `ICON${size}X${size}_PLACEHOLDER`;
        
        fs.writeFileSync(iconPath, placeholderContent);
        console.log(`✅ 创建图标: icons/icon${size}.png`);
    });

    console.log('🎨 图标创建完成！');
    console.log('💡 注意：这些是占位符图标，建议替换为真实的PNG图标文件');
}

// 验证插件文件完整性
function validatePlugin() {
    const requiredFiles = [
        'manifest.json',
        'background.js',
        'content.js',
        'popup/popup.html',
        'popup/popup.js',
        'popup/popup.css',
        'options/options.html',
        'options/options.js',
        'options/options.css',
        'lib/feishu-api.js',
        'lib/storage.js',
        'utils.js'
    ];

    const missingFiles = [];
    
    requiredFiles.forEach(file => {
        const filePath = path.join(__dirname, file);
        if (!fs.existsSync(filePath)) {
            missingFiles.push(file);
        }
    });

    if (missingFiles.length > 0) {
        console.log('❌ 缺少以下必要文件：');
        missingFiles.forEach(file => console.log(`   - ${file}`));
        return false;
    }

    console.log('✅ 所有必要文件都存在');
    return true;
}

// 验证manifest.json格式
function validateManifest() {
    try {
        const manifestPath = path.join(__dirname, 'manifest.json');
        const manifestContent = fs.readFileSync(manifestPath, 'utf8');
        const manifest = JSON.parse(manifestContent);
        
        const requiredFields = ['name', 'version', 'manifest_version', 'description'];
        const missingFields = requiredFields.filter(field => !manifest[field]);
        
        if (missingFields.length > 0) {
            console.log('❌ manifest.json 缺少必要字段：');
            missingFields.forEach(field => console.log(`   - ${field}`));
            return false;
        }

        console.log('✅ manifest.json 格式正确');
        return true;
    } catch (error) {
        console.log('❌ manifest.json 格式错误:', error.message);
        return false;
    }
}

// 生成打包清单
function generatePackageList() {
    const packageFiles = [
        'manifest.json',
        'background.js',
        'content.js',
        'utils.js',
        'popup/',
        'options/',
        'lib/',
        'icons/',
        'README.md'
    ];

    const packageContent = {
        name: '飞书收藏插件',
        version: '1.0.0',
        buildTime: new Date().toISOString(),
        files: packageFiles,
        instructions: [
            '1. 打开 Chrome 浏览器，访问 chrome://extensions/',
            '2. 开启右上角的"开发者模式"',
            '3. 点击"加载已解压的扩展程序"',
            '4. 选择本插件文件夹',
            '5. 插件安装完成！'
        ]
    };

    fs.writeFileSync(
        path.join(__dirname, 'package-info.json'),
        JSON.stringify(packageContent, null, 2)
    );

    console.log('📦 打包清单已生成: package-info.json');
}

// 主构建函数
function build() {
    console.log('🔨 开始构建飞书收藏插件...\n');

    // 1. 验证插件文件
    console.log('1️⃣ 验证插件文件完整性...');
    if (!validatePlugin()) {
        process.exit(1);
    }
    console.log('');

    // 2. 验证manifest.json
    console.log('2️⃣ 验证manifest.json格式...');
    if (!validateManifest()) {
        process.exit(1);
    }
    console.log('');

    // 3. 创建图标
    console.log('3️⃣ 创建图标文件...');
    createIcons();
    console.log('');

    // 4. 生成打包清单
    console.log('4️⃣ 生成打包清单...');
    generatePackageList();
    console.log('');

    console.log('✅ 构建完成！');
    console.log('');
    console.log('📋 下一步操作：');
    console.log('   1. 打开 Chrome 浏览器');
    console.log('   2. 访问 chrome://extensions/');
    console.log('   3. 开启"开发者模式"');
    console.log('   4. 点击"加载已解压的扩展程序"');
    console.log('   5. 选择本插件文件夹');
    console.log('');
    console.log('📖 使用说明：');
    console.log('   - 首次使用需要在插件设置中配置飞书信息');
    console.log('   - 点击浏览器工具栏的插件图标即可收藏网页');
    console.log('   - 支持标签、备注和自动同步功能');
    console.log('');
    console.log('🔗 测试页面：');
    console.log('   打开 test.html 文件测试插件功能');
}

// 运行构建
if (require.main === module) {
    build();
}

module.exports = { build, createIcons, validatePlugin, validateManifest };