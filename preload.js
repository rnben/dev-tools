const crypto = require('./lib/crypto.js');

// 配置管理
const CONFIG_KEY = 'aes_crypto_config';

// 获取用户配置
function getUserConfig() {
    try {
        if (!window.utools || !window.utools.dbStorage) {
            console.error('uTools API 未初始化');
            return {
                key: "1234567890123456", // 16字节
                iv: "1234567890123456" // 16字节
            };
        }

        const config = window.utools.dbStorage.getItem(CONFIG_KEY);
        return config || {
            key: "1234567890123456", // 默认16字节key
            iv: "1234567890123456" // 默认16字节iv
        };
    } catch (error) {
        console.error('获取配置失败:', error);
        return {
            key: "1234567890123456", // 16字节
            iv: "1234567890123456" // 16字节
        };
    }
}

// 保存用户配置
function saveUserConfig(config) {
    try {
        if (!window.utools || !window.utools.dbStorage) {
            console.error('uTools API 未初始化');
            return false;
        }

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
function handleAesEncrypt(searchText) {
    try {
        console.log('开始处理 AES 加密');

        if (!window.utools) {
            console.error('uTools API 未初始化');
            return;
        }

        const config = getUserConfig();
        console.log('获取配置成功:', config);

        // 从搜索框获取文本
        const textToEncrypt = searchText || '';
        console.log('要加密的文本:', textToEncrypt);

        if (textToEncrypt) {
            try {
                console.log('开始加密，参数:', { text: textToEncrypt, key: config.key, iv: config.iv });
                const encrypted = crypto.aesEncrypt(textToEncrypt, config.key, config.iv);
                console.log('加密结果:', encrypted);

                window.utools.copyText(encrypted);
                window.utools.showNotification('加密完成，结果已复制到剪贴板');
                // 加密成功后退出插件
                window.utools.outPlugin();
            } catch (error) {
                console.error('加密失败:', error);
                window.utools.showNotification(`加密失败: ${error.message}`);
            }
        } else {
            console.log('搜索框为空');
            window.utools.showNotification('请在搜索框中输入要加密的文本');
        }
    } catch (error) {
        console.error('处理加密时出错:', error);
        if (window.utools && window.utools.showNotification) {
            window.utools.showNotification(`处理失败: ${error.message}`);
        }
    }
}

// 处理 AES 解密
function handleAesDecrypt(searchText) {
    try {
        console.log('开始处理 AES 解密');

        if (!window.utools) {
            console.error('uTools API 未初始化');
            return;
        }

        const config = getUserConfig();
        console.log('获取配置成功:', config);

        // 从搜索框获取文本
        const textToDecrypt = searchText || '';
        console.log('要解密的文本:', textToDecrypt);

        if (textToDecrypt) {
            try {
                console.log('开始解密，参数:', { text: textToDecrypt, key: config.key, iv: config.iv });
                const decrypted = crypto.aesDecrypt(textToDecrypt, config.key, config.iv);
                console.log('解密结果:', decrypted);

                window.utools.copyText(decrypted);
                window.utools.showNotification('解密完成，结果已复制到剪贴板');
                // 解密成功后退出插件
                window.utools.outPlugin();
            } catch (error) {
                console.error('解密失败:', error);
                window.utools.showNotification(`解密失败: ${error.message}`);
            }
        } else {
            console.log('搜索框为空');
            window.utools.showNotification('请在搜索框中输入要解密的文本');
        }
    } catch (error) {
        console.error('处理解密时出错:', error);
        if (window.utools && window.utools.showNotification) {
            window.utools.showNotification(`处理失败: ${error.message}`);
        }
    }
}

// 处理配置
function handleConfig() {
    try {
        if (!window.utools) {
            console.error('uTools API 未初始化');
            return;
        }

        const config = getUserConfig();
        const message = `当前配置:\nKey: ${config.key}\nIV: ${config.iv}`;
        window.utools.showNotification(message);
    } catch (error) {
        console.error('处理配置时出错:', error);
    }
}

// 处理配置更新
function handleConfigUpdate(searchText) {
    try {
        if (!window.utools) {
            console.error('uTools API 未初始化');
            return;
        }

        const config = getUserConfig();
        
        // 解析搜索文本，格式: key=新key值 iv=新iv值
        const parts = searchText.split(' ');
        let newKey = config.key;
        let newIV = config.iv;
        let hasUpdate = false;

        for (const part of parts) {
            if (part.startsWith('key=')) {
                newKey = part.substring(4);
                hasUpdate = true;
            } else if (part.startsWith('iv=')) {
                newIV = part.substring(3);
                hasUpdate = true;
            }
        }

        if (hasUpdate) {
            const newConfig = { key: newKey, iv: newIV };
            if (saveUserConfig(newConfig)) {
                window.utools.showNotification(`配置更新成功!\n新 Key: ${newKey}\n新 IV: ${newIV}`);
            } else {
                window.utools.showNotification('配置更新失败');
            }
        } else {
            // 如果没有更新，显示当前配置
            const message = `当前配置:\nKey: ${config.key}\nIV: ${config.iv}\n\n更新格式: key=新key值 iv=新iv值`;
            window.utools.showNotification(message);
        }
    } catch (error) {
        console.error('处理配置更新时出错:', error);
        window.utools.showNotification(`配置更新失败: ${error.message}`);
    }
}

// 生成随机 Key
function handleGenerateKey() {
    try {
        if (!window.utools) {
            console.error('uTools API 未初始化');
            return;
        }

        const randomKey = generateRandomKey();
        window.utools.copyText(randomKey);
        window.utools.showNotification('随机 Key 已生成并复制到剪贴板');
    } catch (error) {
        console.error('生成随机 Key 时出错:', error);
    }
}

// 生成随机 IV
function handleGenerateIV() {
    try {
        if (!window.utools) {
            console.error('uTools API 未初始化');
            return;
        }

        const randomIV = generateRandomIV();
        window.utools.copyText(randomIV);
        window.utools.showNotification('随机 IV 已生成并复制到剪贴板');
    } catch (error) {
        console.error('生成随机 IV 时出错:', error);
    }
}

// 处理 MD5 加密
function handleMd5Encrypt(searchText) {
    try {
        if (!window.utools) {
            console.error('uTools API 未初始化');
            return;
        }

        const textToEncrypt = searchText || '';

        if (textToEncrypt) {
            const md5Hash = crypto.md5Encrypt(textToEncrypt);
            window.utools.copyText(md5Hash);
            window.utools.showNotification('MD5 加密完成，结果已复制到剪贴板');
            // MD5加密成功后退出插件
            window.utools.outPlugin();
        } else {
            window.utools.showNotification('请在搜索框中输入要加密的文本');
        }
    } catch (error) {
        console.error('处理 MD5 加密时出错:', error);
    }
}

// uTools 插件配置
window.exports = {
    'aes-cbc': {
        mode: "list",
        args: {
            enter: (action, callbackSetList) => {
                console.log('进入 aes-cbc 插件');
                try {
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
                } catch (error) {
                    console.error('enter 函数出错:', error);
                }
            },

            search: (action, searchWord, callbackSetList) => {
                console.log('搜索:', searchWord);
                try {
                    if (!searchWord) {
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
                                description: "查看和修改配置",
                                icon: "⚙️",
                                action: "config"
                            }
                        ]);
                        return;
                    }

                    // 检查是否是配置更新格式
                    const isConfigUpdate = searchWord.includes('key=') || searchWord.includes('iv=');
                    if (isConfigUpdate) {
                        const config = getUserConfig();
                        const parts = searchWord.split(' ');
                        let newKey = config.key;
                        let newIV = config.iv;
                        let hasUpdate = false;

                        for (const part of parts) {
                            if (part.startsWith('key=')) {
                                newKey = part.substring(4);
                                hasUpdate = true;
                            } else if (part.startsWith('iv=')) {
                                newIV = part.substring(3);
                                hasUpdate = true;
                            }
                        }

                        if (hasUpdate) {
                            callbackSetList([
                                {
                                    title: `⚙️ 更新配置: Key=${newKey.substring(0, 8)}... IV=${newIV.substring(0, 8)}...`,
                                    description: "点击确认更新配置",
                                    icon: "⚙️",
                                    action: "configUpdate",
                                    text: searchWord
                                },
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
                                }
                            ]);
                            return;
                        }
                    }

                    // 如果有搜索文本，直接显示加密/解密结果
                    const config = getUserConfig();
                    const options = [];
                    let hasEncryptResult = false;
                    let hasDecryptResult = false;

                    try {
                        // 尝试加密
                        const encrypted = crypto.aesEncrypt(searchWord, config.key, config.iv);
                        options.push({
                            title: `🔐 加密结果: ${encrypted}`,
                            description: "点击复制到剪贴板",
                            icon: "🔐",
                            action: "copyResult",
                            text: encrypted
                        });
                        hasEncryptResult = true;
                    } catch (error) {
                        console.log('加密失败，可能是密文:', error.message);
                    }

                    try {
                        // 尝试解密
                        const decrypted = crypto.aesDecrypt(searchWord, config.key, config.iv);
                        options.push({
                            title: `🔓 解密结果: ${decrypted}`,
                            description: "点击复制到剪贴板",
                            icon: "🔓",
                            action: "copyResult",
                            text: decrypted
                        });
                        hasDecryptResult = true;
                    } catch (error) {
                        console.log('解密失败，可能是明文:', error.message);
                    }

                    // 如果没有加密结果，添加强制加密选项
                    if (!hasEncryptResult) {
                        options.push({
                            title: `🔐 强制加密: ${searchWord}`,
                            description: "使用 AES-CBC 加密此文本",
                            icon: "🔐",
                            action: "aesEncrypt",
                            text: searchWord
                        });
                    }

                    // 如果没有解密结果，添加强制解密选项
                    if (!hasDecryptResult) {
                        options.push({
                            title: `🔓 强制解密: ${searchWord}`,
                            description: "尝试解密此文本",
                            icon: "🔓",
                            action: "aesDecrypt",
                            text: searchWord
                        });
                    }

                    options.push({
                        title: "⚙️ 配置 Key & IV",
                        description: "查看和修改配置",
                        icon: "⚙️",
                        action: "config"
                    });

                    callbackSetList(options);
                } catch (error) {
                    console.error('search 函数出错:', error);
                }
            },

            select: (action, itemData, callbackSetList) => {
                console.log('选择项目:', itemData);
                try {
                    const actionType = itemData.action;
                    const searchText = itemData.text || '';

                    switch (actionType) {
                        case 'aesEncrypt':
                            handleAesEncrypt(searchText);
                            break;
                        case 'aesDecrypt':
                            handleAesDecrypt(searchText);
                            break;
                        case 'copyResult':
                            // 复制结果到剪贴板
                            window.utools.copyText(searchText);
                            window.utools.outPlugin();
                            window.utools.hideMainWindow();
                            break;
                        case 'config':
                            handleConfig();
                            break;
                        case 'configUpdate':
                            handleConfigUpdate(searchText);
                            break;
                        case 'generateKey':
                            handleGenerateKey();
                            break;
                        case 'generateIV':
                            handleGenerateIV();
                            break;
                        default:
                            console.log('未知操作:', actionType);
                    }
                } catch (error) {
                    console.error('select 函数出错:', error);
                }
            }
        }
    },

    'md5': {
        mode: "list",
        args: {
            enter: (action, callbackSetList) => {
                console.log('进入 md5 插件');
                try {
                    callbackSetList([
                        {
                            title: "🔐 MD5 加密",
                            description: "对文本进行 MD5 加密",
                            icon: "🔐",
                            action: "md5Encrypt"
                        }
                    ]);
                } catch (error) {
                    console.error('md5 enter 函数出错:', error);
                }
            },

            search: (action, searchWord, callbackSetList) => {
                console.log('MD5 搜索:', searchWord);
                try {
                    if (!searchWord) {
                        callbackSetList([
                            {
                                title: "🔐 MD5 加密",
                                description: "对文本进行 MD5 加密",
                                icon: "🔐",
                                action: "md5Encrypt"
                            }
                        ]);
                        return;
                    }

                    // 如果有搜索文本，直接显示 MD5 加密结果
                    try {
                        const md5Hash = crypto.md5Encrypt(searchWord);
                        callbackSetList([
                            {
                                title: `🔐 MD5: ${md5Hash}`,
                                description: "点击复制到剪贴板",
                                icon: "🔐",
                                action: "copyResult",
                                text: md5Hash
                            }
                        ]);
                    } catch (error) {
                        console.error('MD5 加密失败:', error);
                        callbackSetList([
                            {
                                title: "🔐 MD5 加密失败",
                                description: "请检查输入文本",
                                icon: "❌",
                                action: "md5Encrypt",
                                text: searchWord
                            }
                        ]);
                    }
                } catch (error) {
                    console.error('md5 search 函数出错:', error);
                }
            },

            select: (action, itemData, callbackSetList) => {
                console.log('MD5 选择项目:', itemData);
                try {
                    window.utools.copyText(itemData.text);
                    window.utools.outPlugin();
                    window.utools.hideMainWindow();
                } catch (error) {
                    console.error('md5 select 函数出错:', error);
                }
            }
        }
    }
};
