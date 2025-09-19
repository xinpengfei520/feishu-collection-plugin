// options.js - 设置页面逻辑
document.addEventListener('DOMContentLoaded', function() {
    let storageManager = null;
    let currentSettings = {};
    let collections = [];
    let allTags = [];

    // DOM元素
    const navTabs = document.querySelectorAll('.nav-tab');
    const tabContents = document.querySelectorAll('.tab-content');
    const statusBar = document.getElementById('status');
    
    // 基础设置元素
    const appIdInput = document.getElementById('appId');
    const appSecretInput = document.getElementById('appSecret');
    const appTokenInput = document.getElementById('appToken');
    const tableIdInput = document.getElementById('tableId');
    const autoSyncCheckbox = document.getElementById('autoSync');
    const maxLocalStorageSelect = document.getElementById('maxLocalStorage');
    
    // 按钮元素
    const saveSettingsBtn = document.getElementById('saveSettings');
    const testConnectionBtn = document.getElementById('testConnection');
    const exportDataBtn = document.getElementById('exportData');
    const importDataBtn = document.getElementById('importData');
    const importFileInput = document.getElementById('importFile');
    const clearLocalDataBtn = document.getElementById('clearLocalData');
    const clearSyncQueueBtn = document.getElementById('clearSyncQueue');
    const syncNowBtn = document.getElementById('syncNow');
    const refreshStatsBtn = document.getElementById('refreshStats');
    
    // 收藏管理元素
    const totalCountEl = document.getElementById('totalCount');
    const tagCountEl = document.getElementById('tagCount');
    const unsyncedCountEl = document.getElementById('unsyncedCount');
    const searchInput = document.getElementById('searchInput');
    const tagFilter = document.getElementById('tagFilter');
    const collectionsList = document.getElementById('collectionsList');

    // 初始化
    init();

    async function init() {
        try {
            // 初始化存储管理器
            storageManager = new StorageManager();
            
            // 加载设置
            await loadSettings();
            
            // 加载收藏数据
            await loadCollections();
            
            // 绑定事件
            bindEvents();
            
            // 显示状态
            showStatus('设置页面加载完成', 'success');
        } catch (error) {
            console.error('初始化失败:', error);
            showStatus('初始化失败: ' + error.message, 'error');
        }
    }

    // 绑定事件
    function bindEvents() {
        // 标签页切换
        navTabs.forEach(tab => {
            tab.addEventListener('click', () => switchTab(tab.dataset.tab));
        });

        // 基础设置
        saveSettingsBtn.addEventListener('click', saveSettings);
        testConnectionBtn.addEventListener('click', testConnection);

        // 高级设置
        exportDataBtn.addEventListener('click', exportData);
        importDataBtn.addEventListener('click', () => importFileInput.click());
        importFileInput.addEventListener('change', importData);
        clearLocalDataBtn.addEventListener('click', clearLocalData);
        clearSyncQueueBtn.addEventListener('click', clearSyncQueue);

        // 收藏管理
        syncNowBtn.addEventListener('click', syncNow);
        refreshStatsBtn.addEventListener('click', refreshStats);
        searchInput.addEventListener('input', debounce(searchCollections, 300));
        tagFilter.addEventListener('change', filterByTag);
    }

    // 切换标签页
    function switchTab(tabName) {
        navTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        
        tabContents.forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-tab`);
        });

        // 加载对应标签页的数据
        if (tabName === 'collections') {
            refreshStats();
            renderCollections();
        }
    }

    // 加载设置
    async function loadSettings() {
        try {
            currentSettings = await storageManager.getSettings();
            
            // 填充表单
            appIdInput.value = currentSettings.appId || '';
            appSecretInput.value = currentSettings.appSecret || '';
            appTokenInput.value = currentSettings.appToken || '';
            tableIdInput.value = currentSettings.tableId || '';
            autoSyncCheckbox.checked = currentSettings.autoSync !== false;
            maxLocalStorageSelect.value = currentSettings.maxLocalStorage || '100';
        } catch (error) {
            console.error('加载设置失败:', error);
            showStatus('加载设置失败: ' + error.message, 'error');
        }
    }

    // 保存设置
    async function saveSettings() {
        try {
            const settings = {
                appId: appIdInput.value.trim(),
                appSecret: appSecretInput.value.trim(),
                appToken: appTokenInput.value.trim(),
                tableId: tableIdInput.value.trim(),
                autoSync: autoSyncCheckbox.checked,
                maxLocalStorage: parseInt(maxLocalStorageSelect.value),
                updatedAt: new Date().toISOString()
            };

            await storageManager.saveSettings(settings);
            currentSettings = settings;
            
            showStatus('设置保存成功', 'success');
            
            // 通知后台脚本重新初始化
            chrome.runtime.sendMessage({ action: 'reloadSettings' });
        } catch (error) {
            console.error('保存设置失败:', error);
            showStatus('保存设置失败: ' + error.message, 'error');
        }
    }

    // 测试连接
    async function testConnection() {
        try {
            if (!appIdInput.value || !appSecretInput.value) {
                throw new Error('请填写应用ID和应用密钥');
            }

            testConnectionBtn.disabled = true;
            testConnectionBtn.textContent = '测试中...';

            // 创建临时API实例测试连接
            const tempAPI = new FeishuAPI();
            await tempAPI.init({
                appId: appIdInput.value.trim(),
                appSecret: appSecretInput.value.trim()
            });

            showStatus('连接测试成功！', 'success');
        } catch (error) {
            console.error('连接测试失败:', error);
            showStatus('连接测试失败: ' + error.message, 'error');
        } finally {
            testConnectionBtn.disabled = false;
            testConnectionBtn.textContent = '测试连接';
        }
    }

    // 加载收藏数据
    async function loadCollections() {
        try {
            collections = await storageManager.getCollections();
            allTags = await storageManager.getAllTags();
            updateTagFilter();
        } catch (error) {
            console.error('加载收藏数据失败:', error);
            showStatus('加载收藏数据失败: ' + error.message, 'error');
        }
    }

    // 更新标签筛选器
    function updateTagFilter() {
        tagFilter.innerHTML = '<option value="">所有标签</option>';
        allTags.forEach(tag => {
            const option = document.createElement('option');
            option.value = tag;
            option.textContent = tag;
            tagFilter.appendChild(option);
        });
    }

    // 刷新统计
    async function refreshStats() {
        try {
            const stats = await storageManager.getStats();
            totalCountEl.textContent = stats.total;
            tagCountEl.textContent = stats.tags;
            unsyncedCountEl.textContent = stats.unsynced;
        } catch (error) {
            console.error('刷新统计失败:', error);
            showStatus('刷新统计失败: ' + error.message, 'error');
        }
    }

    // 渲染收藏列表
    async function renderCollections(searchQuery = '', selectedTag = '') {
        try {
            let displayCollections;
            
            if (searchQuery) {
                displayCollections = await storageManager.searchCollections(searchQuery);
            } else if (selectedTag) {
                displayCollections = await storageManager.getCollectionsByTag(selectedTag);
            } else {
                displayCollections = collections;
            }

            if (displayCollections.length === 0) {
                collectionsList.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">📚</div>
                        <div>暂无收藏记录</div>
                    </div>
                `;
                return;
            }

            collectionsList.innerHTML = displayCollections.map(collection => `
                <div class="collection-item">
                    <img src="${collection.icon || '../icons/icon48.png'}" 
                         alt="" class="collection-icon" onerror="this.src='../icons/icon48.png'">
                    <div class="collection-info">
                        <div class="collection-title">${escapeHtml(collection.title)}</div>
                        <div class="collection-url">${escapeHtml(collection.url)}</div>
                        ${collection.tags && collection.tags.length > 0 ? `
                            <div class="collection-tags">
                                ${collection.tags.map(tag => `
                                    <span class="collection-tag">${escapeHtml(tag)}</span>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                    <div class="collection-actions">
                        <button class="btn btn-small btn-secondary" 
                                onclick="window.open('${collection.url}', '_blank')"
                                title="打开网页">
                            打开
                        </button>
                        <button class="btn btn-small btn-danger" 
                                onclick="deleteCollection('${collection.id}')"
                                title="删除收藏">
                            删除
                        </button>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('渲染收藏列表失败:', error);
            collectionsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">❌</div>
                    <div>加载失败：${error.message}</div>
                </div>
            `;
        }
    }

    // 搜索收藏
    function searchCollections() {
        const query = searchInput.value.trim();
        renderCollections(query);
    }

    // 按标签筛选
    function filterByTag() {
        const selectedTag = tagFilter.value;
        renderCollections('', selectedTag);
    }

    // 立即同步
    async function syncNow() {
        try {
            syncNowBtn.disabled = true;
            syncNowBtn.textContent = '同步中...';
            
            const response = await chrome.runtime.sendMessage({ action: 'syncNow' });
            
            if (response.success) {
                showStatus(response.message, 'success');
                await loadCollections();
                await refreshStats();
                renderCollections();
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            console.error('同步失败:', error);
            showStatus('同步失败: ' + error.message, 'error');
        } finally {
            syncNowBtn.disabled = false;
            syncNowBtn.textContent = '立即同步';
        }
    }

    // 删除收藏
    async function deleteCollection(id) {
        if (!confirm('确定要删除这个收藏吗？')) {
            return;
        }

        try {
            const response = await chrome.runtime.sendMessage({ 
                action: 'deleteCollection', 
                id: id 
            });
            
            if (response.success) {
                showStatus('删除成功', 'success');
                await loadCollections();
                await refreshStats();
                renderCollections();
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            console.error('删除失败:', error);
            showStatus('删除失败: ' + error.message, 'error');
        }
    }

    // 导出数据
    async function exportData() {
        try {
            const data = await storageManager.exportData();
            const blob = new Blob([JSON.stringify(data, null, 2)], {
                type: 'application/json'
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `feishu-collections-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showStatus('数据导出成功', 'success');
        } catch (error) {
            console.error('导出数据失败:', error);
            showStatus('导出数据失败: ' + error.message, 'error');
        }
    }

    // 导入数据
    async function importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            const result = await storageManager.importData(data);
            
            showStatus(`数据导入成功：导入 ${result.importedCollections} 条收藏`, 'success');
            await loadCollections();
            await refreshStats();
            renderCollections();
            
            // 清空文件输入
            event.target.value = '';
        } catch (error) {
            console.error('导入数据失败:', error);
            showStatus('导入数据失败: ' + error.message, 'error');
        }
    }

    // 清空本地数据
    async function clearLocalData() {
        if (!confirm('确定要清空所有本地收藏数据吗？此操作不可恢复！')) {
            return;
        }

        try {
            // 获取所有收藏并删除
            const allCollections = await storageManager.getCollections();
            for (const collection of allCollections) {
                await storageManager.deleteCollection(collection.id);
            }
            
            showStatus('本地数据已清空', 'success');
            await loadCollections();
            await refreshStats();
            renderCollections();
        } catch (error) {
            console.error('清空本地数据失败:', error);
            showStatus('清空本地数据失败: ' + error.message, 'error');
        }
    }

    // 清空同步队列
    async function clearSyncQueue() {
        if (!confirm('确定要清空同步队列吗？')) {
            return;
        }

        try {
            await storageManager.clearSyncQueue();
            showStatus('同步队列已清空', 'success');
        } catch (error) {
            console.error('清空同步队列失败:', error);
            showStatus('清空同步队列失败: ' + error.message, 'error');
        }
    }

    // 显示状态
    function showStatus(message, type = 'info') {
        statusBar.textContent = message;
        statusBar.className = `status-bar ${type}`;
        
        // 3秒后清除状态
        setTimeout(() => {
            statusBar.textContent = '';
            statusBar.className = 'status-bar';
        }, 3000);
    }

    // HTML转义
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 防抖函数
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
});