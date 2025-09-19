// 本地存储管理类
class StorageManager {
    constructor() {
        this.COLLECTIONS_KEY = 'feishu_collections';
        this.SETTINGS_KEY = 'feishu_settings';
        this.SYNC_QUEUE_KEY = 'sync_queue';
        this.MAX_LOCAL_STORAGE = 100; // 本地最多保存100条记录
    }

    // 保存收藏记录
    async saveCollection(collection) {
        try {
            const result = await chrome.storage.local.get([this.COLLECTIONS_KEY]);
            let collections = result[this.COLLECTIONS_KEY] || [];
            
            // 添加新记录到开头
            collections.unshift({
                ...collection,
                id: this.generateId(),
                localSavedAt: new Date().toISOString(),
                synced: false
            });
            
            // 限制本地存储数量
            if (collections.length > this.MAX_LOCAL_STORAGE) {
                collections = collections.slice(0, this.MAX_LOCAL_STORAGE);
            }
            
            await chrome.storage.local.set({
                [this.COLLECTIONS_KEY]: collections
            });
            
            return collections[0];
        } catch (error) {
            console.error('保存收藏记录失败:', error);
            throw error;
        }
    }

    // 获取所有收藏记录
    async getCollections(limit = null, offset = 0) {
        try {
            const result = await chrome.storage.local.get([this.COLLECTIONS_KEY]);
            let collections = result[this.COLLECTIONS_KEY] || [];
            
            // 按时间倒序排列
            collections.sort((a, b) => 
                new Date(b.localSavedAt || b.createdAt) - new Date(a.localSavedAt || a.createdAt)
            );
            
            if (limit !== null) {
                collections = collections.slice(offset, offset + limit);
            }
            
            return collections;
        } catch (error) {
            console.error('获取收藏记录失败:', error);
            throw error;
        }
    }

    // 根据ID获取收藏记录
    async getCollectionById(id) {
        try {
            const collections = await this.getCollections();
            return collections.find(item => item.id === id);
        } catch (error) {
            console.error('获取收藏记录失败:', error);
            throw error;
        }
    }

    // 更新收藏记录
    async updateCollection(id, updates) {
        try {
            const collections = await this.getCollections();
            const index = collections.findIndex(item => item.id === id);
            
            if (index === -1) {
                throw new Error('收藏记录不存在');
            }
            
            collections[index] = {
                ...collections[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            
            await chrome.storage.local.set({
                [this.COLLECTIONS_KEY]: collections
            });
            
            return collections[index];
        } catch (error) {
            console.error('更新收藏记录失败:', error);
            throw error;
        }
    }

    // 删除收藏记录
    async deleteCollection(id) {
        try {
            const collections = await this.getCollections();
            const filteredCollections = collections.filter(item => item.id !== id);
            
            await chrome.storage.local.set({
                [this.COLLECTIONS_KEY]: filteredCollections
            });
            
            return true;
        } catch (error) {
            console.error('删除收藏记录失败:', error);
            throw error;
        }
    }

    // 标记记录为已同步
    async markAsSynced(id, feishuRecordId) {
        try {
            return await this.updateCollection(id, {
                synced: true,
                feishuRecordId: feishuRecordId,
                syncedAt: new Date().toISOString()
            });
        } catch (error) {
            console.error('标记同步状态失败:', error);
            throw error;
        }
    }

    // 获取未同步的记录
    async getUnsyncedCollections() {
        try {
            const collections = await this.getCollections();
            return collections.filter(item => !item.synced);
        } catch (error) {
            console.error('获取未同步记录失败:', error);
            throw error;
        }
    }

    // 保存设置
    async saveSettings(settings) {
        try {
            await chrome.storage.sync.set({
                [this.SETTINGS_KEY]: settings
            });
            return settings;
        } catch (error) {
            console.error('保存设置失败:', error);
            throw error;
        }
    }

    // 获取设置
    async getSettings() {
        try {
            const result = await chrome.storage.sync.get([this.SETTINGS_KEY]);
            return result[this.SETTINGS_KEY] || {};
        } catch (error) {
            console.error('获取设置失败:', error);
            throw error;
        }
    }

    // 添加到同步队列
    async addToSyncQueue(record) {
        try {
            const result = await chrome.storage.local.get([this.SYNC_QUEUE_KEY]);
            let queue = result[this.SYNC_QUEUE_KEY] || [];
            
            queue.push({
                ...record,
                queueId: this.generateId(),
                addedAt: new Date().toISOString()
            });
            
            await chrome.storage.local.set({
                [this.SYNC_QUEUE_KEY]: queue
            });
            
            return queue;
        } catch (error) {
            console.error('添加到同步队列失败:', error);
            throw error;
        }
    }

    // 获取同步队列
    async getSyncQueue() {
        try {
            const result = await chrome.storage.local.get([this.SYNC_QUEUE_KEY]);
            return result[this.SYNC_QUEUE_KEY] || [];
        } catch (error) {
            console.error('获取同步队列失败:', error);
            throw error;
        }
    }

    // 从同步队列移除
    async removeFromSyncQueue(queueId) {
        try {
            const queue = await this.getSyncQueue();
            const filteredQueue = queue.filter(item => item.queueId !== queueId);
            
            await chrome.storage.local.set({
                [this.SYNC_QUEUE_KEY]: filteredQueue
            });
            
            return true;
        } catch (error) {
            console.error('从同步队列移除失败:', error);
            throw error;
        }
    }

    // 清空同步队列
    async clearSyncQueue() {
        try {
            await chrome.storage.local.set({
                [this.SYNC_QUEUE_KEY]: []
            });
            return true;
        } catch (error) {
            console.error('清空同步队列失败:', error);
            throw error;
        }
    }

    // 搜索收藏记录
    async searchCollections(query) {
        try {
            const collections = await this.getCollections();
            const lowerQuery = query.toLowerCase();
            
            return collections.filter(item => {
                return (
                    (item.title && item.title.toLowerCase().includes(lowerQuery)) ||
                    (item.url && item.url.toLowerCase().includes(lowerQuery)) ||
                    (item.description && item.description.toLowerCase().includes(lowerQuery)) ||
                    (item.tags && item.tags.some(tag => tag.toLowerCase().includes(lowerQuery))) ||
                    (item.notes && item.notes.toLowerCase().includes(lowerQuery))
                );
            });
        } catch (error) {
            console.error('搜索收藏记录失败:', error);
            throw error;
        }
    }

    // 按标签筛选
    async getCollectionsByTag(tag) {
        try {
            const collections = await this.getCollections();
            return collections.filter(item => 
                item.tags && item.tags.includes(tag)
            );
        } catch (error) {
            console.error('按标签筛选失败:', error);
            throw error;
        }
    }

    // 获取所有标签
    async getAllTags() {
        try {
            const collections = await this.getCollections();
            const tagSet = new Set();
            
            collections.forEach(item => {
                if (item.tags) {
                    item.tags.forEach(tag => tagSet.add(tag));
                }
            });
            
            return Array.from(tagSet).sort();
        } catch (error) {
            console.error('获取所有标签失败:', error);
            throw error;
        }
    }

    // 获取统计信息
    async getStats() {
        try {
            const collections = await this.getCollections();
            const tags = await this.getAllTags();
            const unsynced = await this.getUnsyncedCollections();
            
            return {
                total: collections.length,
                tags: tags.length,
                unsynced: unsynced.length,
                lastSync: collections.find(item => item.syncedAt)?.syncedAt || null
            };
        } catch (error) {
            console.error('获取统计信息失败:', error);
            throw error;
        }
    }

    // 生成唯一ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // 导出数据
    async exportData() {
        try {
            const collections = await this.getCollections();
            const settings = await this.getSettings();
            
            return {
                version: '1.0.0',
                exportTime: new Date().toISOString(),
                collections: collections,
                settings: settings
            };
        } catch (error) {
            console.error('导出数据失败:', error);
            throw error;
        }
    }

    // 导入数据
    async importData(data) {
        try {
            if (!data.collections || !Array.isArray(data.collections)) {
                throw new Error('无效的数据格式');
            }

            // 验证数据版本
            if (data.version && data.version !== '1.0.0') {
                console.warn('数据版本不匹配，可能存在问题');
            }

            // 导入收藏记录
            if (data.collections.length > 0) {
                const existingCollections = await this.getCollections();
                const newCollections = data.collections.filter(newItem => 
                    !existingCollections.some(existingItem => existingItem.url === newItem.url)
                );
                
                const allCollections = [...newCollections, ...existingCollections];
                await chrome.storage.local.set({
                    [this.COLLECTIONS_KEY]: allCollections
                });
            }

            // 导入设置
            if (data.settings) {
                await this.saveSettings(data.settings);
            }

            return {
                importedCollections: data.collections.length,
                newCollections: data.collections.filter(newItem => 
                    !data.collections.some(existingItem => existingItem.url === newItem.url)
                ).length
            };
        } catch (error) {
            console.error('导入数据失败:', error);
            throw error;
        }
    }
}

// 创建StorageManager实例
window.StorageManager = StorageManager;