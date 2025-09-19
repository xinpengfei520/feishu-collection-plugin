// 飞书API封装类
class FeishuAPI {
    constructor() {
        this.baseURL = 'https://open.feishu.cn/open-apis';
        this.appId = null;
        this.appSecret = null;
        this.accessToken = null;
        this.tokenExpiry = null;
    }

    // 初始化配置
    async init(config) {
        this.appId = config.appId;
        this.appSecret = config.appSecret;
        
        // 尝试从存储中获取token
        const result = await chrome.storage.local.get(['feishuToken', 'tokenExpiry']);
        if (result.feishuToken && result.tokenExpiry && new Date(result.tokenExpiry) > new Date()) {
            this.accessToken = result.feishuToken;
            this.tokenExpiry = new Date(result.tokenExpiry);
        } else {
            // 获取新的access token
            await this.getAccessToken();
        }
    }

    // 获取访问令牌
    async getAccessToken() {
        try {
            const response = await fetch(`${this.baseURL}/auth/v3/tenant_access_token/internal`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    app_id: this.appId,
                    app_secret: this.appSecret
                })
            });

            const data = await response.json();
            
            if (data.code === 0) {
                this.accessToken = data.tenant_access_token;
                // 设置过期时间（提前5分钟过期）
                this.tokenExpiry = new Date(Date.now() + (data.expire - 300) * 1000);
                
                // 保存到本地存储
                await chrome.storage.local.set({
                    feishuToken: this.accessToken,
                    tokenExpiry: this.tokenExpiry.toISOString()
                });
                
                return this.accessToken;
            } else {
                throw new Error(`获取访问令牌失败: ${data.msg}`);
            }
        } catch (error) {
            console.error('获取访问令牌错误:', error);
            throw error;
        }
    }

    // 确保有有效的访问令牌
    async ensureAccessToken() {
        if (!this.accessToken || new Date() >= this.tokenExpiry) {
            await this.getAccessToken();
        }
    }

    // 获取多维表格元数据
    async getTableMeta(appToken, tableId) {
        await this.ensureAccessToken();
        
        try {
            const response = await fetch(
                `${this.baseURL}/bitable/v1/apps/${appToken}/tables/${tableId}/fields`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const data = await response.json();
            
            if (data.code === 0) {
                return data.data.items;
            } else {
                throw new Error(`获取表格元数据失败: ${data.msg}`);
            }
        } catch (error) {
            console.error('获取表格元数据错误:', error);
            throw error;
        }
    }

    // 添加记录到多维表格
    async addRecord(appToken, tableId, fields) {
        await this.ensureAccessToken();
        
        try {
            const response = await fetch(
                `${this.baseURL}/bitable/v1/apps/${appToken}/tables/${tableId}/records`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        fields: fields
                    })
                }
            );

            const data = await response.json();
            
            if (data.code === 0) {
                return data.data.record;
            } else {
                throw new Error(`添加记录失败: ${data.msg}`);
            }
        } catch (error) {
            console.error('添加记录错误:', error);
            throw error;
        }
    }

    // 批量添加记录
    async batchAddRecords(appToken, tableId, records) {
        await this.ensureAccessToken();
        
        try {
            const response = await fetch(
                `${this.baseURL}/bitable/v1/apps/${appToken}/tables/${tableId}/records/batch_create`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        records: records
                    })
                }
            );

            const data = await response.json();
            
            if (data.code === 0) {
                return data.data.records;
            } else {
                throw new Error(`批量添加记录失败: ${data.msg}`);
            }
        } catch (error) {
            console.error('批量添加记录错误:', error);
            throw error;
        }
    }

    // 查询记录
    async queryRecords(appToken, tableId, params = {}) {
        await this.ensureAccessToken();
        
        try {
            const queryString = new URLSearchParams(params).toString();
            const response = await fetch(
                `${this.baseURL}/bitable/v1/apps/${appToken}/tables/${tableId}/records?${queryString}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const data = await response.json();
            
            if (data.code === 0) {
                return {
                    records: data.data.items,
                    total: data.data.total,
                    hasMore: data.data.has_more
                };
            } else {
                throw new Error(`查询记录失败: ${data.msg}`);
            }
        } catch (error) {
            console.error('查询记录错误:', error);
            throw error;
        }
    }

    // 更新记录
    async updateRecord(appToken, tableId, recordId, fields) {
        await this.ensureAccessToken();
        
        try {
            const response = await fetch(
                `${this.baseURL}/bitable/v1/apps/${appToken}/tables/${tableId}/records/${recordId}`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        fields: fields
                    })
                }
            );

            const data = await response.json();
            
            if (data.code === 0) {
                return data.data.record;
            } else {
                throw new Error(`更新记录失败: ${data.msg}`);
            }
        } catch (error) {
            console.error('更新记录错误:', error);
            throw error;
        }
    }

    // 删除记录
    async deleteRecord(appToken, tableId, recordId) {
        await this.ensureAccessToken();
        
        try {
            const response = await fetch(
                `${this.baseURL}/bitable/v1/apps/${appToken}/tables/${tableId}/records/${recordId}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const data = await response.json();
            
            if (data.code === 0) {
                return true;
            } else {
                throw new Error(`删除记录失败: ${data.msg}`);
            }
        } catch (error) {
            console.error('删除记录错误:', error);
            throw error;
        }
    }
}

// 创建FeishuAPI实例
window.FeishuAPI = FeishuAPI;