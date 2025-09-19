// 插件验证脚本 - 检查插件是否可以正常加载
const fs = require('fs');
const path = require('path');

function validatePlugin() {
    console.log('🔍 验证飞书收藏插件...\n');
    
    let hasErrors = false;
    
    // 1. 检查manifest.json
    console.log('1️⃣ 检查 manifest.json...');
    try {
        const manifestPath = path.join(__dirname, 'manifest.json');
        const manifestContent = fs.readFileSync(manifestPath, 'utf8');
        const manifest = JSON.parse(manifestContent);
        
        // 检查必要字段
        const requiredFields = ['name', 'version', 'manifest_version', 'description'];
        const missingFields = requiredFields.filter(field => !manifest[field]);
        
        if (missingFields.length > 0) {
            console.log(`❌ 缺少必要字段: ${missingFields.join(', ')}`);
            hasErrors = true;
        } else {
            console.log('✅ manifest.json 格式正确');
        }
        
        // 检查图标配置
        if (manifest.icons) {
            const iconSizes = ['16', '48', '128'];
            iconSizes.forEach(size => {
                const iconPath = manifest.icons[size];
                if (iconPath) {
                    const fullPath = path.join(__dirname, iconPath);
                    if (fs.existsSync(fullPath)) {
                        console.log(`✅ 图标 ${size}x${size}: ${iconPath}`);
                    } else {
                        console.log(`❌ 图标文件不存在: ${iconPath}`);
                        hasErrors = true;
                    }
                } else {
                    console.log(`⚠️  缺少图标配置: ${size}x${size}`);
                }
            });
        }
        
    } catch (error) {
        console.log(`❌ manifest.json 解析失败: ${error.message}`);
        hasErrors = true;
    }
    
    // 2. 检查必要文件
    console.log('\n2️⃣ 检查必要文件...');
    const requiredFiles = [
        'background.js',
        'content.js',
        'popup/popup.html',
        'popup/popup.js',
        'options/options.html',
        'lib/feishu-api.js',
        'lib/storage.js'
    ];
    
    requiredFiles.forEach(file => {
        const filePath = path.join(__dirname, file);
        if (fs.existsSync(filePath)) {
            console.log(`✅ ${file}`);
        } else {
            console.log(`❌ 缺少文件: ${file}`);
            hasErrors = true;
        }
    });
    
    // 3. 检查图标文件格式
    console.log('\n3️⃣ 检查图标文件格式...');
    const iconFiles = ['icons/icon16.png', 'icons/icon48.png', 'icons/icon128.png'];
    
    iconFiles.forEach(iconFile => {
        const iconPath = path.join(__dirname, iconFile);
        if (fs.existsSync(iconPath)) {
            try {
                const buffer = fs.readFileSync(iconPath);
                // 检查PNG文件签名
                const pngSignature = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
                const isValidPNG = pngSignature.every((byte, index) => buffer[index] === byte);
                
                if (isValidPNG) {
                    console.log(`✅ ${iconFile} 是有效的PNG文件`);
                } else {
                    console.log(`❌ ${iconFile} 不是有效的PNG文件`);
                    hasErrors = true;
                }
            } catch (error) {
                console.log(`❌ 无法读取图标文件: ${iconFile}`);
                hasErrors = true;
            }
        } else {
            console.log(`❌ 图标文件不存在: ${iconFile}`);
            hasErrors = true;
        }
    });
    
    // 4. 检查权限配置
    console.log('\n4️⃣ 检查权限配置...');
    try {
        const manifestPath = path.join(__dirname, 'manifest.json');
        const manifestContent = fs.readFileSync(manifestPath, 'utf8');
        const manifest = JSON.parse(manifestContent);
        
        const requiredPermissions = ['activeTab', 'storage'];
        const permissions = manifest.permissions || [];
        
        requiredPermissions.forEach(permission => {
            if (permissions.includes(permission)) {
                console.log(`✅ 权限: ${permission}`);
            } else {
                console.log(`⚠️  建议添加权限: ${permission}`);
            }
        });
        
        // 检查host_permissions
        const hostPermissions = manifest.host_permissions || [];
        if (hostPermissions.some(host => host.includes('feishu.cn'))) {
            console.log('✅ 包含飞书域名权限');
        } else {
            console.log('⚠️  缺少飞书域名权限');
        }
        
    } catch (error) {
        console.log(`❌ 权限检查失败: ${error.message}`);
        hasErrors = true;
    }
    
    // 总结
    console.log('\n📊 验证结果:');
    if (hasErrors) {
        console.log('❌ 插件存在错误，需要修复后才能安装');
        console.log('\n🔧 修复建议:');
        console.log('   1. 确保所有图标文件都是有效的PNG格式');
        console.log('   2. 检查manifest.json配置是否正确');
        console.log('   3. 确保所有必要文件都存在');
        console.log('   4. 运行: node create-real-icons.js 重新生成图标');
        return false;
    } else {
        console.log('✅ 插件验证通过，可以正常安装');
        console.log('\n🚀 安装步骤:');
        console.log('   1. 打开 Chrome 浏览器');
        console.log('   2. 访问 chrome://extensions/');
        console.log('   3. 开启"开发者模式"');
        console.log('   4. 点击"加载已解压的扩展程序"');
        console.log('   5. 选择本插件文件夹');
        return true;
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    validatePlugin();
}

module.exports = { validatePlugin };