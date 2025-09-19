// 工具函数集合

// 生成唯一ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 格式化日期
function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
}

// 截断文本
function truncateText(text, maxLength = 100, suffix = '...') {
    if (!text || text.length <= maxLength) {
        return text;
    }
    return text.substring(0, maxLength - suffix.length) + suffix;
}

// 提取域名
function extractDomain(url) {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname;
    } catch (error) {
        return '';
    }
}

// 清理URL参数
function cleanUrl(url, preserveParams = []) {
    try {
        const urlObj = new URL(url);
        if (preserveParams.length === 0) {
            return urlObj.origin + urlObj.pathname;
        }
        
        const params = new URLSearchParams();
        preserveParams.forEach(param => {
            if (urlObj.searchParams.has(param)) {
                params.set(param, urlObj.searchParams.get(param));
            }
        });
        
        return urlObj.origin + urlObj.pathname + (params.toString() ? '?' + params.toString() : '');
    } catch (error) {
        return url;
    }
}

// HTML转义
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 防抖函数
function debounce(func, wait, immediate = false) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
}

// 节流函数
function throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// 深拷贝
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    if (typeof obj === 'object') {
        const cloned = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                cloned[key] = deepClone(obj[key]);
            }
        }
        return cloned;
    }
}

// 对象合并
function mergeObjects(target, ...sources) {
    if (!sources.length) return target;
    const source = sources.shift();
    
    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) Object.assign(target, { [key]: {} });
                mergeObjects(target[key], source[key]);
            } else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }
    
    return mergeObjects(target, ...sources);
}

function isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
}

// 数组去重
function uniqueArray(array, key) {
    if (!key) {
        return [...new Set(array)];
    }
    
    const seen = new Set();
    return array.filter(item => {
        const value = typeof item === 'object' ? item[key] : item;
        if (seen.has(value)) {
            return false;
        }
        seen.add(value);
        return true;
    });
}

// 验证URL
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// 验证邮箱
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// 文件下载
function downloadFile(content, filename, contentType = 'application/json') {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// 读取文件
function readFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsText(file);
    });
}

// 本地存储操作
const Storage = {
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('存储数据失败:', error);
            return false;
        }
    },
    
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('读取数据失败:', error);
            return defaultValue;
        }
    },
    
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('删除数据失败:', error);
            return false;
        }
    },
    
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('清空数据失败:', error);
            return false;
        }
    }
};

// 浏览器兼容性检测
function checkBrowserCompatibility() {
    const features = {
        localStorage: typeof(Storage) !== "undefined",
        promises: typeof(Promise) !== "undefined",
        fetch: typeof(fetch) !== "undefined",
        url: typeof(URL) !== "undefined",
        chromeExtension: typeof(chrome) !== "undefined" && chrome.runtime,
        serviceWorker: 'serviceWorker' in navigator
    };
    
    const supported = Object.values(features).every(feature => feature);
    
    return {
        supported,
        features,
        missing: Object.keys(features).filter(key => !features[key])
    };
}

// 性能监控
class PerformanceMonitor {
    constructor() {
        this.metrics = {};
    }
    
    start(label) {
        this.metrics[label] = {
            start: performance.now(),
            end: null,
            duration: null
        };
    }
    
    end(label) {
        if (!this.metrics[label]) return;
        
        this.metrics[label].end = performance.now();
        this.metrics[label].duration = this.metrics[label].end - this.metrics[label].start;
        
        return this.metrics[label].duration;
    }
    
    getDuration(label) {
        return this.metrics[label]?.duration;
    }
    
    getAllMetrics() {
        return this.metrics;
    }
    
    clear() {
        this.metrics = {};
    }
}

// 错误处理
class ErrorHandler {
    constructor(options = {}) {
        this.options = {
            logErrors: options.logErrors !== false,
            showUserFriendly: options.showUserFriendly !== false,
            callback: options.callback || null
        };
    }
    
    handle(error, context = '') {
        if (this.options.logErrors) {
            console.error(`Error${context ? ` in ${context}` : ''}:`, error);
        }
        
        if (this.options.callback) {
            this.options.callback(error, context);
        }
        
        if (this.options.showUserFriendly) {
            return this.getUserFriendlyMessage(error);
        }
        
        return error.message || 'An error occurred';
    }
    
    getUserFriendlyMessage(error) {
        const messages = {
            'NetworkError': '网络连接失败，请检查网络连接',
            'TimeoutError': '请求超时，请稍后重试',
            'AuthError': '认证失败，请检查配置信息',
            'QuotaExceededError': '存储空间不足，请清理数据',
            'NotFoundError': '请求的资源不存在',
            'ValidationError': '数据验证失败，请检查输入'
        };
        
        const errorType = error.name || error.constructor.name;
        return messages[errorType] || '操作失败，请稍后重试';
    }
}

// 导出版本信息
const VERSION = '1.0.0';
const BUILD_TIME = new Date().toISOString();

// 导出所有工具函数
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        generateId,
        formatDate,
        truncateText,
        extractDomain,
        cleanUrl,
        escapeHtml,
        debounce,
        throttle,
        deepClone,
        mergeObjects,
        uniqueArray,
        isValidUrl,
        isValidEmail,
        downloadFile,
        readFile,
        Storage,
        checkBrowserCompatibility,
        PerformanceMonitor,
        ErrorHandler,
        VERSION,
        BUILD_TIME
    };
} else if (typeof window !== 'undefined') {
    window.Utils = {
        generateId,
        formatDate,
        truncateText,
        extractDomain,
        cleanUrl,
        escapeHtml,
        debounce,
        throttle,
        deepClone,
        mergeObjects,
        uniqueArray,
        isValidUrl,
        isValidEmail,
        downloadFile,
        readFile,
        Storage,
        checkBrowserCompatibility,
        PerformanceMonitor,
        ErrorHandler,
        VERSION,
        BUILD_TIME
    };
}