// popup.js - 弹窗交互逻辑
document.addEventListener('DOMContentLoaded', function() {
    let pageInfo = {};
    let tags = [];

    // DOM元素
    const pageIcon = document.getElementById('pageIcon');
    const pageTitle = document.getElementById('pageTitle');
    const pageUrl = document.getElementById('pageUrl');
    const pageDescription = document.getElementById('pageDescription');
    const tagInput = document.getElementById('tagInput');
    const tagList = document.getElementById('tagList');
    const notes = document.getElementById('notes');
    const saveBtn = document.getElementById('saveBtn');
    const status = document.getElementById('status');

    // 初始化页面信息
    initPageInfo();

    // 绑定事件
    tagInput.addEventListener('keypress', handleTagInput);
    saveBtn.addEventListener('click', handleSave);

    // 获取页面信息
    function initPageInfo() {
        // 从内容脚本获取页面信息
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {action: 'getPageInfo'}, function(response) {
                if (response) {
                    pageInfo = response;
                    displayPageInfo();
                } else {
                    // 如果内容脚本没有响应，使用标签页基本信息
                    chrome.runtime.sendMessage({action: 'getTabInfo'}, function(response) {
                        if (response) {
                            pageInfo = {
                                title: response.title,
                                url: response.url,
                                icon: response.favicon,
                                description: '',
                                keywords: [],
                                timestamp: new Date().toISOString()
                            };
                            displayPageInfo();
                        }
                    });
                }
            });
        });
    }

    // 显示页面信息
    function displayPageInfo() {
        pageIcon.src = pageInfo.icon || '../icons/icon48.png';
        pageTitle.textContent = pageInfo.title || '未知页面';
        pageUrl.textContent = pageInfo.url;
        pageUrl.title = pageInfo.url;
        
        if (pageInfo.description) {
            pageDescription.textContent = pageInfo.description;
        } else {
            pageDescription.textContent = '暂无描述';
            pageDescription.style.color = '#999';
        }
    }

    // 处理标签输入
    function handleTagInput(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const tagText = tagInput.value.trim();
            if (tagText && !tags.includes(tagText)) {
                tags.push(tagText);
                renderTags();
                tagInput.value = '';
            }
        }
    }

    // 渲染标签列表
    function renderTags() {
        tagList.innerHTML = '';
        tags.forEach((tag, index) => {
            const tagElement = document.createElement('div');
            tagElement.className = 'tag';
            tagElement.innerHTML = `
                ${tag}
                <span class="tag-remove" data-index="${index}">×</span>
            `;
            tagList.appendChild(tagElement);
        });

        // 绑定删除事件
        document.querySelectorAll('.tag-remove').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                tags.splice(index, 1);
                renderTags();
            });
        });
    }

    // 处理保存
    function handleSave() {
        const collectionData = {
            ...pageInfo,
            tags: tags,
            notes: notes.value.trim(),
            createdAt: new Date().toISOString()
        };

        // 显示加载状态
        saveBtn.disabled = true;
        saveBtn.querySelector('.btn-text').style.display = 'none';
        saveBtn.querySelector('.loading').style.display = 'inline-block';
        status.textContent = '';
        status.className = 'status';

        // 发送到后台处理
        chrome.runtime.sendMessage({
            action: 'saveToFeishu',
            data: collectionData
        }, function(response) {
            // 恢复按钮状态
            saveBtn.disabled = false;
            saveBtn.querySelector('.btn-text').style.display = 'inline';
            saveBtn.querySelector('.loading').style.display = 'none';

            if (response.success) {
                status.textContent = '收藏成功！';
                status.className = 'status success';
                
                // 2秒后关闭弹窗
                setTimeout(() => {
                    window.close();
                }, 2000);
            } else {
                status.textContent = response.error || '收藏失败';
                status.className = 'status error';
            }
        });
    }

    // 加载保存的设置
    function loadSettings() {
        chrome.storage.sync.get(['feishuSettings'], function(result) {
            if (result.feishuSettings) {
                // 如果有保存的设置，可以在这里应用
                console.log('加载设置:', result.feishuSettings);
            }
        });
    }

    // 页面加载时获取设置
    loadSettings();
});