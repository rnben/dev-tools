const { contextBridge, ipcRenderer } = require('electron');
const crypto = require('./lib/crypto.js');

// 配置管理
const CONFIG_KEY = 'aes_crypto_config';

// 获取用户配置
function getUserConfig() {
    try {
        const config = window.utools.dbStorage.getItem(CONFIG_KEY);
        return config || {
            key: "12345678901234567890123456789012", // 默认32字节key
            iv: "1234567890123456" // 默认16字节iv
        };
    } catch (error) {
        console.error('获取配置失败:', error);
        return {
            key: "12345678901234567890123456789012", // 32字节
            iv: "1234567890123456" // 16字节
        };
    }
}

// 保存用户配置
function saveUserConfig(config) {
    try {
        window.utools.dbStorage.setItem(CONFIG_KEY, config);
        return true;
    } catch (error) {
        console.error('保存配置失败:', error);
        return false;
    }
}

// AES-CBC 加密函数
function aesEncrypt(plainText, key, iv) {
    try {
        return crypto.aesEncrypt(plainText, key, iv);
    } catch (error) {
        throw new Error(`加密失败: ${error.message}`);
    }
}

// AES-CBC 解密函数
function aesDecrypt(cipherText, key, iv) {
    try {
        return crypto.aesDecrypt(cipherText, key, iv);
    } catch (error) {
        throw new Error(`解密失败: ${error.message}`);
    }
}

// MD5 加密
function md5Encrypt(text) {
    return crypto.md5Encrypt(text);
}

// 生成随机 Key 和 IV
function generateRandomKey() {
    return crypto.generateRandomKey();
}

function generateRandomIV() {
    return crypto.generateRandomIV();
}

// 处理 AES 加密
function handleAesEncrypt() {
    const config = getUserConfig();
    
    // 检查剪贴板内容
    const clipboardText = window.utools.readText();
    
    if (clipboardText) {
        try {
            const encrypted = aesEncrypt(clipboardText, config.key, config.iv);
            window.utools.copyText(encrypted);
            window.utools.showNotification('加密完成，结果已复制到剪贴板');
        } catch (error) {
            window.utools.showNotification(`加密失败: ${error.message}`);
        }
    } else {
        // 如果没有剪贴板内容，提示用户
        window.utools.showNotification('请先复制要加密的文本到剪贴板');
    }
}

// 处理 AES 解密
function handleAesDecrypt() {
    const config = getUserConfig();
    
    // 检查剪贴板内容
    const clipboardText = window.utools.readText();
    
    if (clipboardText) {
        try {
            const decrypted = aesDecrypt(clipboardText, config.key, config.iv);
            window.utools.copyText(decrypted);
            window.utools.showNotification('解密完成，结果已复制到剪贴板');
        } catch (error) {
            window.utools.showNotification(`解密失败: ${error.message}`);
        }
    } else {
        // 如果没有剪贴板内容，提示用户
        window.utools.showNotification('请先复制要解密的文本到剪贴板');
    }
}

// 处理配置
function handleConfig() {
    const config = getUserConfig();
    
    // 显示当前配置
    const message = `当前配置:\nKey: ${config.key}\nIV: ${config.iv}\n\n请复制新的 Key 和 IV 到剪贴板，格式为:\nkey:your_new_key\niv:your_new_iv`;
    
    window.utools.showNotification(message);
    
    // 监听剪贴板变化
    let checkCount = 0;
    const maxChecks = 30; // 最多检查30次（15秒）
    
    const checkClipboard = () => {
        checkCount++;
        const clipboardText = window.utools.readText();
        
        if (clipboardText && clipboardText.includes('key:') && clipboardText.includes('iv:')) {
            // 解析新的配置
            const lines = clipboardText.split('\n');
            let newKey = config.key;
            let newIV = config.iv;
            
            for (const line of lines) {
                if (line.startsWith('key:')) {
                    newKey = line.substring(4).trim();
                } else if (line.startsWith('iv:')) {
                    newIV = line.substring(3).trim();
                }
            }
            
            // 保存新配置
            const newConfig = { key: newKey, iv: newIV };
            if (saveUserConfig(newConfig)) {
                window.utools.showNotification('配置已更新');
            } else {
                window.utools.showNotification('配置更新失败');
            }
            return;
        }
        
        if (checkCount < maxChecks) {
            setTimeout(checkClipboard, 500);
        }
    };
    
    setTimeout(checkClipboard, 500);
}

// 生成随机 Key
function handleGenerateKey() {
    const randomKey = generateRandomKey();
    window.utools.copyText(randomKey);
    window.utools.showNotification('随机 Key 已生成并复制到剪贴板');
}

// 生成随机 IV
function handleGenerateIV() {
    const randomIV = generateRandomIV();
    window.utools.copyText(randomIV);
    window.utools.showNotification('随机 IV 已生成并复制到剪贴板');
}

// 处理 MD5 加密
function handleMd5Encrypt() {
    const clipboardText = window.utools.readText();
    
    if (clipboardText) {
        const md5Hash = md5Encrypt(clipboardText);
        window.utools.copyText(md5Hash);
        window.utools.showNotification('MD5 加密完成，结果已复制到剪贴板');
    } else {
        window.utools.showNotification('请先复制要加密的文本到剪贴板');
    }
}

// 暴露给渲染进程的 API
contextBridge.exposeInMainWorld('cryptoAPI', {
    // AES 加密
    aesEncrypt: (text, key, iv) => {
        try {
            return crypto.aesEncrypt(text, key, iv);
        } catch (error) {
            throw new Error(`加密失败: ${error.message}`);
        }
    },

    // AES 解密
    aesDecrypt: (text, key, iv) => {
        try {
            return crypto.aesDecrypt(text, key, iv);
        } catch (error) {
            throw new Error(`解密失败: ${error.message}`);
        }
    },

    // MD5 加密
    md5Encrypt: (text) => {
        return crypto.md5Encrypt(text);
    },

    // 生成随机 Key
    generateRandomKey: () => {
        return crypto.generateRandomKey();
    },

    // 生成随机 IV
    generateRandomIV: () => {
        return crypto.generateRandomIV();
    }
});

// 配置管理
contextBridge.exposeInMainWorld('configAPI', {
    // 保存配置
    saveConfig: (config) => {
        return ipcRenderer.invoke('save-config', config);
    },

    // 读取配置
    loadConfig: () => {
        return ipcRenderer.invoke('load-config');
    }
});

// uTools 插件配置
window.exports = {
    'aes-cbc': {
        mode: "list", // 列表模式
        args: {
            // 进入插件应用时调用
            enter: (action, callbackSetList) => {
                const config = getUserConfig();
                callbackSetList([
                    {
                        title: "🔐 AES-CBC 加密",
                        description: "对文本进行 AES-CBC 加密",
                        icon: "🔐",
                        action: "aesEncrypt"
                    },
                    {
                        title: "🔓 AES-CBC 解密",
                        description: "对密文进行 AES-CBC 解密",
                        icon: "🔓",
                        action: "aesDecrypt"
                    },
                    {
                        title: "⚙️ 配置 Key & IV",
                        description: `当前 Key: ${config.key.substring(0, 8)}... IV: ${config.iv.substring(0, 8)}...`,
                        icon: "⚙️",
                        action: "config"
                    },
                    {
                        title: "🎲 生成随机 Key",
                        description: "生成随机密钥",
                        icon: "🎲",
                        action: "generateKey"
                    },
                    {
                        title: "🎲 生成随机 IV",
                        description: "生成随机向量",
                        icon: "🎲",
                        action: "generateIV"
                    }
                ]);
            },

            // 搜索功能
            search: (action, searchWord, callbackSetList) => {
                if (!searchWord) {
                    // 如果搜索词为空，显示默认选项
                    const config = getUserConfig();
                    callbackSetList([
                        {
                            title: "🔐 AES-CBC 加密",
                            description: "对文本进行 AES-CBC 加密",
                            icon: "🔐",
                            action: "aesEncrypt"
                        },
                        {
                            title: "🔓 AES-CBC 解密",
                            description: "对密文进行 AES-CBC 解密",
                            icon: "🔓",
                            action: "aesDecrypt"
                        },
                        {
                            title: "⚙️ 配置 Key & IV",
                            description: `当前 Key: ${config.key.substring(0, 8)}... IV: ${config.iv.substring(0, 8)}...`,
                            icon: "⚙️",
                            action: "config"
                        },
                        {
                            title: "🎲 生成随机 Key",
                            description: "生成随机密钥",
                            icon: "🎲",
                            action: "generateKey"
                        },
                        {
                            title: "🎲 生成随机 IV",
                            description: "生成随机向量",
                            icon: "🎲",
                            action: "generateIV"
                        }
                    ]);
                    return;
                }

                // 根据搜索词过滤选项
                const options = [];
                const searchLower = searchWord.toLowerCase();

                if (searchLower.includes('加密') || searchLower.includes('encrypt')) {
                    options.push({
                        title: "🔐 AES-CBC 加密",
                        description: "对文本进行 AES-CBC 加密",
                        icon: "🔐",
                        action: "aesEncrypt"
                    });
                }

                if (searchLower.includes('解密') || searchLower.includes('decrypt')) {
                    options.push({
                        title: "🔓 AES-CBC 解密",
                        description: "对密文进行 AES-CBC 解密",
                        icon: "🔓",
                        action: "aesDecrypt"
                    });
                }

                if (searchLower.includes('配置') || searchLower.includes('config') || searchLower.includes('key') || searchLower.includes('iv')) {
                    const config = getUserConfig();
                    options.push({
                        title: "⚙️ 配置 Key & IV",
                        description: `当前 Key: ${config.key.substring(0, 8)}... IV: ${config.iv.substring(0, 8)}...`,
                        icon: "⚙️",
                        action: "config"
                    });
                }

                if (searchLower.includes('生成') || searchLower.includes('generate') || searchLower.includes('随机')) {
                    options.push(
                        {
                            title: "🎲 生成随机 Key",
                            description: "生成随机密钥",
                            icon: "🎲",
                            action: "generateKey"
                        },
                        {
                            title: "🎲 生成随机 IV",
                            description: "生成随机向量",
                            icon: "🎲",
                            action: "generateIV"
                        }
                    );
                }

                // 如果没有匹配的选项，显示默认选项
                if (options.length === 0) {
                    const config = getUserConfig();
                    callbackSetList([
                        {
                            title: "🔐 AES-CBC 加密",
                            description: "对文本进行 AES-CBC 加密",
                            icon: "🔐",
                            action: "aesEncrypt"
                        },
                        {
                            title: "🔓 AES-CBC 解密",
                            description: "对密文进行 AES-CBC 解密",
                            icon: "🔓",
                            action: "aesDecrypt"
                        },
                        {
                            title: "⚙️ 配置 Key & IV",
                            description: `当前 Key: ${config.key.substring(0, 8)}... IV: ${config.iv.substring(0, 8)}...`,
                            icon: "⚙️",
                            action: "config"
                        }
                    ]);
                } else {
                    callbackSetList(options);
                }
            },

            // 选择列表项时调用
            select: (action, itemData, callbackSetList) => {
                const actionType = itemData.action;

                switch (actionType) {
                    case 'aesEncrypt':
                        handleAesEncrypt();
                        break;
                    case 'aesDecrypt':
                        handleAesDecrypt();
                        break;
                    case 'config':
                        handleConfig();
                        break;
                    case 'generateKey':
                        handleGenerateKey();
                        break;
                    case 'generateIV':
                        handleGenerateIV();
                        break;
                }
            }
        }
    },

    'md5': {
        mode: "none",
        args: {
            enter: (action) => {
                handleMd5Encrypt();
            }
        }
    }
};
