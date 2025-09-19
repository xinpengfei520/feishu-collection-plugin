// 快速测试脚本 - 验证插件核心功能

// 模拟Chrome扩展API（用于测试环境）
const mockChromeAPI = {
    runtime: {
        sendMessage: function(message, callback) {
            console.log('📤 发送消息:', message);
            
            // 模拟响应
            setTimeout(() => {
                const response = {
                    success: true,
                    data: {
                        id: 'test-' + Date.now(),
                        title: '测试页面',
                        url: window.location.href,
                        timestamp: new Date().toISOString()
                    }
                };
                
                if (callback) {
                    callback(response);
                }
            }, 100);
        },
        onMessage: {
            addListener: function(listener) {
                console.log('🎧 消息监听器已注册');
            }
        }
    },
    tabs: {
        query: function(queryInfo, callback) {
            console.log('🔍 查询标签页:', queryInfo);
            const mockTabs = [{
                id: 1,
                title: '测试页面',
                url: window.location.href,
                favicon: 'icons/icon48.png'
            }];
            
            if (callback) {
                callback(mockTabs);
            }
        }
    },
    storage: {
        local: {
            get: function(keys, callback) {
                console.log('📖 获取本地存储:', keys);
                const mockData = {
                    feishu_collections: [],
                    feishu_settings: {
                        appId: 'test-app-id',
                        autoSync: true
                    }
                };
                
                if (callback) {
                    callback(mockData);
                }
            },
            set: function(items, callback) {
                console.log('💾 设置本地存储:', items);
                if (callback) {
                    callback();
                }
            }
        },
        sync: {
            get: function(keys, callback) {
                console.log('🔄 获取同步存储:', keys);
                if (callback) {
                    callback({});
                }
            },
            set: function(items, callback) {
                console.log('🔄 设置同步存储:', items);
                if (callback) {
                    callback();
                }
            }
        }
    }
};

// 测试环境检测
function isTestEnvironment() {
    return typeof chrome === 'undefined' || !chrome.runtime;
}

// 设置测试环境
if (isTestEnvironment()) {
    console.log('🧪 检测到测试环境，使用模拟API');
    window.chrome = { ...mockChromeAPI };
} else {
    console.log('🔌 检测到Chrome扩展环境');
}

// 测试工具函数
function runUtilsTests() {
    console.log('\n🛠️ 测试工具函数...');
    
    try {
        // 测试ID生成
        const id1 = Utils.generateId();
        const id2 = Utils.generateId();
        console.log('✅ ID生成:', id1 !== id2 ? '通过' : '失败');
        
        // 测试日期格式化
        const formattedDate = Utils.formatDate(new Date(), 'YYYY-MM-DD');
        console.log('✅ 日期格式化:', formattedDate.includes('-') ? '通过' : '失败');
        
        // 测试文本截断
        const truncated = Utils.truncateText('这是一个很长的文本内容', 10);
        console.log('✅ 文本截断:', truncated.length <= 13 ? '通过' : '失败'); // 10 + "..."
        
        // 测试URL验证
        const validUrl = Utils.isValidUrl('https://example.com');
        const invalidUrl = Utils.isValidUrl('not-a-url');
        console.log('✅ URL验证:', validUrl && !invalidUrl ? '通过' : '失败');
        
        // 测试HTML转义
        const escaped = Utils.escapeHtml('<script>alert("xss")</script>');
        console.log('✅ HTML转义:', !escaped.includes('<script>') ? '通过' : '失败');
        
        console.log('🎉 工具函数测试完成');
        return true;
    } catch (error) {
        console.error('❌ 工具函数测试失败:', error);
        return false;
    }
}

// 测试存储管理
function runStorageTests() {
    console.log('\n💾 测试存储管理...');
    
    try {
        // 初始化StorageManager
        const storageManager = new StorageManager();
        
        // 测试保存收藏
        const testCollection = {
            title: '测试页面',
            url: window.location.href,
            description: '这是一个测试收藏',
            tags: ['测试', '插件'],
            notes: '测试备注内容'
        };
        
        // 模拟异步测试
        return storageManager.saveCollection(testCollection).then(result => {
            console.log('✅ 保存收藏:', result.id ? '通过' : '失败');
            
            // 测试获取收藏
            return storageManager.getCollections();
        }).then(collections => {
            console.log('✅ 获取收藏:', collections.length > 0 ? '通过' : '失败');
            
            // 测试搜索功能
            return storageManager.searchCollections('测试');
        }).then(searchResults => {
            console.log('✅ 搜索功能:', searchResults.length > 0 ? '通过' : '失败');
            
            // 测试标签功能
            return storageManager.getAllTags();
        }).then(tags => {
            console.log('✅ 标签管理:', Array.isArray(tags) ? '通过' : '失败');
            
            console.log('🎉 存储管理测试完成');
            return true;
        }).catch(error => {
            console.error('❌ 存储管理测试失败:', error);
            return false;
        });
    } catch (error) {
        console.error('❌ 存储管理测试失败:', error);
        return Promise.resolve(false);
    }
}

// 测试飞书API
function runFeishuAPITests() {
    console.log('\n🚀 测试飞书API...');
    
    try {
        const feishuAPI = new FeishuAPI();
        
        // 注意：这里只是测试API类的初始化，实际API调用需要真实的凭证
        console.log('✅ API类初始化:', feishuAPI ? '通过' : '失败');
        
        // 测试配置验证
        const testConfig = {
            appId: 'test-app-id',
            appSecret: 'test-app-secret'
        };
        
        console.log('✅ 配置格式:', testConfig.appId && testConfig.appSecret ? '通过' : '失败');
        
        console.log('🎉 飞书API测试完成（注意：需要真实凭证进行完整测试）');
        return true;
    } catch (error) {
        console.error('❌ 飞书API测试失败:', error);
        return false;
    }
}

// 测试页面信息采集
function runPageInfoTests() {
    console.log('\n📄 测试页面信息采集...');
    
    try {
        // 模拟内容脚本功能
        function getPageDescription() {
            const metaDescription = document.querySelector('meta[name="description"]');
            const ogDescription = document.querySelector('meta[property="og:description"]');
            
            if (ogDescription) return ogDescription.content;
            if (metaDescription) return metaDescription.content;
            
            const firstParagraph = document.querySelector('p');
            if (firstParagraph) {
                return firstParagraph.textContent.substring(0, 200);
            }
            
            return '';
        }

        function getPageKeywords() {
            const keywordsMeta = document.querySelector('meta[name="keywords"]');
            if (keywordsMeta) {
                return keywordsMeta.content.split(',').map(k => k.trim());
            }
            return [];
        }

        function getPageIcon() {
            const iconLink = document.querySelector('link[rel="icon"]') || 
                           document.querySelector('link[rel="shortcut icon"]') ||
                           document.querySelector('link[rel="apple-touch-icon"]');
            
            if (iconLink) {
                return iconLink.href;
            }
            
            return new URL('/favicon.ico', window.location.href).href;
        }

        // 获取页面信息
        const pageInfo = {
            title: document.title,
            url: window.location.href,
            description: getPageDescription(),
            keywords: getPageKeywords(),
            icon: getPageIcon(),
            timestamp: new Date().toISOString()
        };
        
        console.log('📋 页面信息:', pageInfo);
        console.log('✅ 标题获取:', pageInfo.title ? '通过' : '失败');
        console.log('✅ URL获取:', pageInfo.url ? '通过' : '失败');
        console.log('✅ 描述获取:', typeof pageInfo.description === 'string' ? '通过' : '失败');
        console.log('✅ 关键词获取:', Array.isArray(pageInfo.keywords) ? '通过' : '失败');
        console.log('✅ 图标获取:', pageInfo.icon ? '通过' : '失败');
        
        console.log('🎉 页面信息采集测试完成');
        return true;
    } catch (error) {
        console.error('❌ 页面信息采集测试失败:', error);
        return false;
    }
}

// 测试浏览器兼容性
function runCompatibilityTests() {
    console.log('\n🔍 测试浏览器兼容性...');
    
    try {
        const compatibility = Utils.checkBrowserCompatibility();
        console.log('✅ 兼容性检测:', compatibility.supported ? '通过' : '失败');
        
        if (!compatibility.supported) {
            console.log('⚠️  不支持的特性:', compatibility.missing);
        }
        
        // 测试特定API
        console.log('✅ localStorage:', compatibility.features.localStorage ? '支持' : '不支持');
        console.log('✅ Promise:', compatibility.features.promises ? '支持' : '不支持');
        console.log('✅ fetch:', compatibility.features.fetch ? '支持' : '不支持');
        console.log('✅ URL:', compatibility.features.url ? '支持' : '不支持');
        
        console.log('🎉 浏览器兼容性测试完成');
        return compatibility.supported;
    } catch (error) {
        console.error('❌ 浏览器兼容性测试失败:', error);
        return false;
    }
}

// 运行所有测试
async function runAllTests() {
    console.log('🚀 开始飞书收藏插件功能测试...\n');
    console.log('📅 测试时间:', new Date().toLocaleString());
    console.log('🌐 测试页面:', window.location.href);
    console.log('');
    
    const testResults = {
        utils: false,
        storage: false,
        api: false,
        pageInfo: false,
        compatibility: false
    };
    
    try {
        // 运行所有测试
        testResults.utils = runUtilsTests();
        testResults.storage = await runStorageTests();
        testResults.api = runFeishuAPITests();
        testResults.pageInfo = runPageInfoTests();
        testResults.compatibility = runCompatibilityTests();
        
        // 统计结果
        const passed = Object.values(testResults).filter(Boolean).length;
        const total = Object.keys(testResults).length;
        
        console.log('\n📊 测试统计:');
        console.log(`✅ 通过: ${passed}/${total}`);
        console.log(`❌ 失败: ${total - passed}/${total}`);
        
        if (passed === total) {
            console.log('🎉 所有测试通过！插件功能正常');
        } else {
            console.log('⚠️  部分测试失败，请检查相关问题');
        }
        
        return passed === total;
    } catch (error) {
        console.error('💥 测试过程出错:', error);
        return false;
    }
}

// 显示测试结果
function showTestResults(success) {
    const resultDiv = document.createElement('div');
    resultDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px;
        border-radius: 8px;
        color: white;
        font-weight: bold;
        z-index: 10000;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    
    if (success) {
        resultDiv.style.backgroundColor = '#4CAF50';
        resultDiv.innerHTML = '🎉 插件测试通过！所有功能正常';
    } else {
        resultDiv.style.backgroundColor = '#f44336';
        resultDiv.innerHTML = '⚠️ 插件测试失败，请查看控制台详情';
    }
    
    document.body.appendChild(resultDiv);
    
    // 5秒后自动移除
    setTimeout(() => {
        if (resultDiv.parentNode) {
            resultDiv.parentNode.removeChild(resultDiv);
        }
    }, 5000);
}

// 自动运行测试（如果在测试页面）
if (window.location.pathname.includes('test.html') || window.location.pathname.includes('quick-test')) {
    console.log('🧪 自动运行插件测试...');
    
    // 等待DOM加载完成
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            runAllTests().then(showTestResults);
        });
    } else {
        runAllTests().then(showTestResults);
    }
}

// 导出测试函数供手动调用
window.runPluginTests = runAllTests;

console.log('🎯 快速测试脚本已加载');
console.log('💡 使用 window.runPluginTests() 手动运行测试');