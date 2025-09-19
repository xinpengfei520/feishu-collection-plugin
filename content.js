// 内容脚本，用于获取页面信息
(function() {
  'use strict';

  // 获取页面描述
  function getPageDescription() {
    const metaDescription = document.querySelector('meta[name="description"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    
    if (ogDescription) return ogDescription.content;
    if (metaDescription) return metaDescription.content;
    
    // 如果没有meta描述，获取第一段文字
    const firstParagraph = document.querySelector('p');
    if (firstParagraph) {
      return firstParagraph.textContent.substring(0, 200);
    }
    
    return '';
  }

  // 获取页面关键词
  function getPageKeywords() {
    const keywordsMeta = document.querySelector('meta[name="keywords"]');
    if (keywordsMeta) {
      return keywordsMeta.content.split(',').map(k => k.trim());
    }
    return [];
  }

  // 获取页面图标
  function getPageIcon() {
    const iconLink = document.querySelector('link[rel="icon"]') || 
                    document.querySelector('link[rel="shortcut icon"]') ||
                    document.querySelector('link[rel="apple-touch-icon"]');
    
    if (iconLink) {
      return iconLink.href;
    }
    
    // 默认favicon路径
    return new URL('/favicon.ico', window.location.href).href;
  }

  // 监听来自popup的消息
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getPageInfo') {
      const pageInfo = {
        title: document.title,
        url: window.location.href,
        description: getPageDescription(),
        keywords: getPageKeywords(),
        icon: getPageIcon(),
        timestamp: new Date().toISOString()
      };
      
      sendResponse(pageInfo);
    }
  });

})();