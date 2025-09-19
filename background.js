// 后台服务脚本
importScripts('lib/feishu-api.js', 'lib/storage.js');

// 全局变量
let feishuAPI = null;
let storageManager = null;

// 初始化
chrome.runtime.onInstalled.addListener(() => {
  console.log('飞书收藏插件已安装');
  initializeServices();
});

chrome.runtime.onStartup.addListener(() => {
  initializeServices();
});

// 初始化服务
async function initializeServices() {
  try {
    // 初始化存储管理器
    storageManager = new StorageManager();
    
    // 获取设置
    const settings = await storageManager.getSettings();
    
    // 如果有飞书设置，初始化API
    if (settings.appId && settings.appSecret && settings.appToken && settings.tableId) {
      feishuAPI = new FeishuAPI();
      await feishuAPI.init(settings);
      
      // 启动同步任务
      startSyncTask();
    }
  } catch (error) {
    console.error('初始化服务失败:', error);
  }
}

// 监听来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getTabInfo') {
    // 获取当前标签页信息
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs[0]) {
        sendResponse({
          title: tabs[0].title,
          url: tabs[0].url,
          favicon: tabs[0].favicon
        });
      }
    });
    return true; // 保持消息通道开放
  }
  
  if (request.action === 'saveToFeishu') {
    // 处理保存到飞书的逻辑
    handleSaveToFeishu(request.data).then(result => {
      sendResponse(result);
    }).catch(error => {
      sendResponse({success: false, error: error.message});
    });
    return true;
  }
  
  if (request.action === 'getCollections') {
    // 获取收藏记录
    handleGetCollections(request.params).then(result => {
      sendResponse(result);
    }).catch(error => {
      sendResponse({success: false, error: error.message});
    });
    return true;
  }
  
  if (request.action === 'deleteCollection') {
    // 删除收藏记录
    handleDeleteCollection(request.id).then(result => {
      sendResponse(result);
    }).catch(error => {
      sendResponse({success: false, error: error.message});
    });
    return true;
  }
  
  if (request.action === 'syncNow') {
    // 立即同步
    handleSyncNow().then(result => {
      sendResponse(result);
    }).catch(error => {
      sendResponse({success: false, error: error.message});
    });
    return true;
  }
});

// 处理保存到飞书的逻辑
async function handleSaveToFeishu(data) {
  try {
    if (!storageManager) {
      throw new Error('存储管理器未初始化');
    }
    
    // 先保存到本地
    const localRecord = await storageManager.saveCollection(data);
    
    // 如果有飞书API，尝试同步到飞书
    if (feishuAPI) {
      try {
        const settings = await storageManager.getSettings();
        const feishuRecord = await saveToFeishuTable(localRecord, settings);
        
        // 标记为已同步
        await storageManager.markAsSynced(localRecord.id, feishuRecord.record_id);
        
        return {
          success: true,
          message: '收藏成功并已同步到飞书',
          data: localRecord,
          feishuRecord: feishuRecord
        };
      } catch (syncError) {
        console.error('同步到飞书失败:', syncError);
        // 同步失败但本地保存成功
        return {
          success: true,
          message: '收藏成功（本地保存，同步失败）',
          data: localRecord,
          warning: '同步到飞书失败: ' + syncError.message
        };
      }
    } else {
      return {
        success: true,
        message: '收藏成功（本地保存）',
        data: localRecord,
        info: '请在设置中配置飞书信息以启用同步'
      };
    }
  } catch (error) {
    console.error('保存失败:', error);
    throw new Error('保存失败: ' + error.message);
  }
}

// 保存到飞书多维表格
async function saveToFeishuTable(collection, settings) {
  if (!feishuAPI) {
    throw new Error('飞书API未初始化');
  }
  
  try {
    // 准备字段数据
    const fields = {
      '标题': collection.title,
      '网址': collection.url,
      '描述': collection.description || '',
      '标签': collection.tags ? collection.tags.join(',') : '',
      '备注': collection.notes || '',
      '图标': collection.icon || '',
      '关键词': collection.keywords ? collection.keywords.join(',') : '',
      '收藏时间': collection.createdAt,
      '来源': '浏览器插件'
    };
    
    // 添加自定义字段（如果配置了）
    if (settings.customFields) {
      Object.assign(fields, settings.customFields);
    }
    
    // 添加到飞书多维表格
    const record = await feishuAPI.addRecord(settings.appToken, settings.tableId, fields);
    
    return record;
  } catch (error) {
    console.error('保存到飞书表格失败:', error);
    throw error;
  }
}

// 处理获取收藏记录
async function handleGetCollections(params = {}) {
  try {
    if (!storageManager) {
      throw new Error('存储管理器未初始化');
    }
    
    let collections;
    
    if (params.search) {
      // 搜索
      collections = await storageManager.searchCollections(params.search);
    } else if (params.tag) {
      // 按标签筛选
      collections = await storageManager.getCollectionsByTag(params.tag);
    } else {
      // 获取所有记录
      collections = await storageManager.getCollections(params.limit, params.offset);
    }
    
    return {
      success: true,
      data: collections,
      total: collections.length
    };
  } catch (error) {
    console.error('获取收藏记录失败:', error);
    throw error;
  }
}

// 处理删除收藏记录
async function handleDeleteCollection(id) {
  try {
    if (!storageManager) {
      throw new Error('存储管理器未初始化');
    }
    
    // 获取记录信息
    const collection = await storageManager.getCollectionById(id);
    if (!collection) {
      throw new Error('收藏记录不存在');
    }
    
    // 如果已同步到飞书，也删除飞书中的记录
    if (collection.synced && collection.feishuRecordId && feishuAPI) {
      try {
        const settings = await storageManager.getSettings();
        await feishuAPI.deleteRecord(settings.appToken, settings.tableId, collection.feishuRecordId);
      } catch (error) {
        console.error('删除飞书记录失败:', error);
        // 继续删除本地记录
      }
    }
    
    // 删除本地记录
    await storageManager.deleteCollection(id);
    
    return {
      success: true,
      message: '删除成功'
    };
  } catch (error) {
    console.error('删除收藏记录失败:', error);
    throw error;
  }
}

// 处理立即同步
async function handleSyncNow() {
  try {
    if (!feishuAPI || !storageManager) {
      throw new Error('服务未初始化，请检查飞书设置');
    }
    
    const unsyncedRecords = await storageManager.getUnsyncedCollections();
    
    if (unsyncedRecords.length === 0) {
      return {
        success: true,
        message: '没有需要同步的记录',
        syncedCount: 0
      };
    }
    
    const settings = await storageManager.getSettings();
    let syncedCount = 0;
    let failedCount = 0;
    
    for (const record of unsyncedRecords) {
      try {
        const feishuRecord = await saveToFeishuTable(record, settings);
        await storageManager.markAsSynced(record.id, feishuRecord.record_id);
        syncedCount++;
      } catch (error) {
        console.error(`同步记录失败: ${record.title}`, error);
        failedCount++;
      }
    }
    
    return {
      success: true,
      message: `同步完成：成功 ${syncedCount} 条，失败 ${failedCount} 条`,
      syncedCount: syncedCount,
      failedCount: failedCount
    };
  } catch (error) {
    console.error('同步失败:', error);
    throw error;
  }
}

// 启动同步任务
function startSyncTask() {
  // 每30分钟执行一次同步
  chrome.alarms.create('syncToFeishu', { delayInMinutes: 30, periodInMinutes: 30 });
}

// 监听定时器
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'syncToFeishu') {
    try {
      await handleSyncNow();
    } catch (error) {
      console.error('定时同步失败:', error);
    }
  }
});

// 监听网络连接变化
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'syncService') {
    port.onMessage.addListener(async (msg) => {
      if (msg.action === 'sync') {
        try {
          const result = await handleSyncNow();
          port.postMessage({ success: true, result });
        } catch (error) {
          port.postMessage({ success: false, error: error.message });
        }
      }
    });
  }
});