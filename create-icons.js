// 创建PNG图标文件 - 用于Chrome扩展
const fs = require('fs');
const path = require('path');

// 创建简单的PNG文件头（16x16, 48x48, 128x128）
function createPNGIcon(size, filename) {
    // PNG文件头和IDAT数据的简化版本
    // 这里创建一个单色的PNG文件作为占位符
    const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    
    // 创建简单的PNG数据结构
    // IHDR chunk
    const ihdrLength = Buffer.from([0x00, 0x00, 0x00, 0x0D]);
    const ihdrType = Buffer.from([0x49, 0x48, 0x44, 0x52]);
    const width = Buffer.from([0x00, 0x00, 0x00, size]);
    const height = Buffer.from([0x00, 0x00, 0x00, size]);
    const bitDepth = Buffer.from([0x08]);
    const colorType = Buffer.from([0x02]);
    const compression = Buffer.from([0x00]);
    const filter = Buffer.from([0x00]);
    const interlace = Buffer.from([0x00]);
    const ihdrCrc = Buffer.from([0x50, 0x6D, 0x8E, 0x7A]); // 简化的CRC
    
    // 简化的IDAT chunk（单色图像数据）
    const idatLength = Buffer.from([0x00, 0x00, 0x01, 0x00]); // 256字节数据
    const idatType = Buffer.from([0x49, 0x44, 0x41, 0x54]);
    const compressedData = Buffer.alloc(256, 0xFF); // 白色像素数据
    const idatCrc = Buffer.from([0x35, 0xAF, 0x06, 0x1E]); // 简化的CRC
    
    // IEND chunk
    const iendLength = Buffer.from([0x00, 0x00, 0x00, 0x00]);
    const iendType = Buffer.from([0x49, 0x45, 0x4E, 0x44]);
    const iendCrc = Buffer.from([0xAE, 0x42, 0x60, 0x82]);
    
    // 组合PNG文件
    const pngBuffer = Buffer.concat([
        pngSignature,
        ihdrLength, ihdrType, width, height, bitDepth, colorType, 
        compression, filter, interlace, ihdrCrc,
        idatLength, idatType, compressedData, idatCrc,
        iendLength, iendType, iendCrc
    ]);
    
    fs.writeFileSync(filename, pngBuffer);
    console.log(`✅ 创建图标: ${filename} (${size}x${size})`);
}

// 创建所有需要的图标
function createAllIcons() {
    const iconsDir = path.join(__dirname, 'icons');
    
    // 确保icons目录存在
    if (!fs.existsSync(iconsDir)) {
        fs.mkdirSync(iconsDir);
    }
    
    // 创建不同尺寸的图标
    createPNGIcon(16, path.join(iconsDir, 'icon16.png'));
    createPNGIcon(48, path.join(iconsDir, 'icon48.png'));
    createPNGIcon(128, path.join(iconsDir, 'icon128.png'));
    
    console.log('\n🎨 所有图标创建完成！');
    console.log('💡 这些是占位符图标，建议替换为真实的图标文件');
    console.log('📁 图标文件保存在: icons/');
}

// 如果直接运行此脚本
if (require.main === module) {
    createAllIcons();
}

module.exports = { createAllIcons };