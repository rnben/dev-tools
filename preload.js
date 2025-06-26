const CryptoJS = require('crypto-js');

// 配置管理
const CONFIG_KEY = 'aes_crypto_config';

// 获取用户配置
function getUserConfig() {
  try {
    const config = window.utools.dbStorage.getItem(CONFIG_KEY);
    return config || {
      key: "1234567890123456", // 默认16字节key
      iv: "1234567890123456" // 默认16字节iv
    };
  } catch (error) {
    console.error('获取配置失败:', error);
    return {
      key: "1234567890123456",
      iv: "1234567890123456"
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

// AES-CBC 加密函数 (使用 CryptoJS)
function aesEncrypt(plainText, key, iv) {
  try {
    // 直接使用用户提供的 key 和 iv，不做长度限制
    const keyBytes = CryptoJS.enc.Utf8.parse(key);
    const ivBytes = CryptoJS.enc.Utf8.parse(iv);
    
    // 使用 CryptoJS 进行 AES-CBC 加密
    const encrypted = CryptoJS.AES.encrypt(plainText, keyBytes, {
      iv: ivBytes,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
      format: CryptoJS.format.OpenSSL
    });
    
    return encrypted.toString();
  } catch (error) {
    throw new Error(`加密失败: ${error.message}`);
  }
}

// AES-CBC 解密函数 (使用 CryptoJS)
function aesDecrypt(cipherText, key, iv) {
  try {
    // 直接使用用户提供的 key 和 iv，不做长度限制
    const keyBytes = CryptoJS.enc.Utf8.parse(key);
    const ivBytes = CryptoJS.enc.Utf8.parse(iv);
    
    // 使用 CryptoJS 进行 AES-CBC 解密
    const decrypted = CryptoJS.AES.decrypt(cipherText, keyBytes, {
      iv: ivBytes,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
      format: CryptoJS.format.OpenSSL
    });
    
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    throw new Error(`解密失败: ${error.message}`);
  }
}

// MD5 加密
function md5Encrypt(text) {
  return CryptoJS.MD5(text).toString();
}

// 生成随机 Key 和 IV
function generateRandomKey() {
  return CryptoJS.lib.WordArray.random(16).toString();
}

function generateRandomIV() {
  return CryptoJS.lib.WordArray.random(16).toString();
}

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
            }
          ]);
          return;
        }

        // 首先检查是否是设置配置的格式 (key=xxx iv=xxx)
        const keyMatch = searchWord.match(/key=([^\s]+)/i);
        const ivMatch = searchWord.match(/iv=([^\s]+)/i);
        
        if (keyMatch || ivMatch) {
          const currentConfig = getUserConfig();
          const newKey = keyMatch ? keyMatch[1] : currentConfig.key;
          const newIV = ivMatch ? ivMatch[1] : currentConfig.iv;
          
          callbackSetList([
            {
              title: "⚙️ 设置配置",
              description: `Key: ${newKey.substring(0, 16)}... IV: ${newIV.substring(0, 8)}...`,
              icon: "⚙️",
              action: "setConfig",
              key: newKey,
              iv: newIV
            }
          ]);
          return;
        }

        // 然后检查是否是配置命令（精确匹配）
        if (searchWord.toLowerCase() === 'key' || 
            searchWord.toLowerCase() === 'iv' || 
            searchWord.toLowerCase() === '配置' ||
            searchWord.toLowerCase() === 'config') {
          const config = getUserConfig();
          callbackSetList([
            {
              title: "⚙️ 查看当前配置",
              description: `Key: ${config.key} | IV: ${config.iv}`,
              icon: "⚙️",
              action: "showConfig"
            },
            {
              title: "🎲 生成随机配置",
              description: "生成新的随机 Key 和 IV",
              icon: "🎲",
              action: "generateConfig"
            }
          ]);
          return;
        }

        // 根据搜索词过滤选项
        const options = [
          {
            title: "🔐 加密: " + searchWord,
            description: "使用 AES-CBC 加密此文本",
            icon: "🔐",
            action: "aesEncrypt",
            text: searchWord
          },
          {
            title: "🔓 解密: " + searchWord,
            description: "尝试解密此文本",
            icon: "🔓", 
            action: "aesDecrypt",
            text: searchWord
          }
        ];
        
        callbackSetList(options);
      },
      
      // 用户选择列表项时调用
      select: (action, itemData, callbackSetList) => {
        const actionType = itemData.action;
        
        switch (actionType) {
          case 'aesEncrypt':
            handleAesEncrypt(itemData.text);
            break;
          case 'aesDecrypt':
            handleAesDecrypt(itemData.text);
            break;
          case 'config':
            handleConfig();
            break;
          case 'showConfig':
            handleShowConfig();
            break;
          case 'generateConfig':
            handleGenerateConfig();
            break;
          case 'setConfig':
            handleSetConfig(itemData.key, itemData.iv);
            break;
          case 'generateKey':
            const key = generateRandomKey();
            window.utools.copyText(key);
            window.utools.showNotification(`随机 Key 已复制到剪贴板: ${key}`);
            break;
          case 'generateIV':
            const iv = generateRandomIV();
            window.utools.copyText(iv);
            window.utools.showNotification(`随机 IV 已复制到剪贴板: ${iv}`);
            break;
        }
        
        window.utools.outPlugin();
      },
      
      // 占位符
      placeholder: "输入要加密/解密的文本，或选择操作"
    }
  },
  
  'md5': {
    mode: "list", // 列表模式
    args: {
      // 进入插件应用时调用
      enter: (action, callbackSetList) => {
        callbackSetList([
          {
            title: "🔐 MD5 加密",
            description: "对文本进行 MD5 加密",
            icon: "🔐",
            action: "md5Encrypt"
          }
        ]);
      },
      
      // 搜索功能
      search: (action, searchWord, callbackSetList) => {
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

        callbackSetList([
          {
            title: "🔐 MD5: " + searchWord,
            description: "对文本进行 MD5 加密",
            icon: "🔐",
            action: "md5Encrypt",
            text: searchWord
          }
        ]);
      },
      
      // 用户选择列表项时调用
      select: (action, itemData, callbackSetList) => {
        if (itemData.action === 'md5Encrypt') {
          handleMd5Encrypt(itemData.text);
        }
        window.utools.outPlugin();
      },
      
      // 占位符
      placeholder: "输入要 MD5 加密的文本"
    }
  }
};

// 处理 AES 加密
function handleAesEncrypt(text) {
  const config = getUserConfig();
  
  try {
    window.utools.showNotification(`Key: ${config.key}\nIV: ${config.iv}\ntext:${text}`);
    const encrypted = aesEncrypt(text || "Hello World", config.key, config.iv);
    window.utools.copyText(encrypted);
    window.utools.showNotification(`AES-CBC 加密成功！结果已复制到剪贴板\nKey: ${config.key}\nIV: ${config.iv}`);
  } catch (error) {
    window.utools.showNotification(`AES-CBC 加密失败: ${error.message}`);
  }
}

// 处理 AES 解密
function handleAesDecrypt(text) {
  const config = getUserConfig();
  
  try {
    const decrypted = aesDecrypt(text, config.key, config.iv);
    window.utools.copyText(decrypted);
    window.utools.showNotification(`AES-CBC 解密成功！结果已复制到剪贴板`);
  } catch (error) {
    window.utools.showNotification(`AES-CBC 解密失败: ${error.message}`);
  }
}

// 处理配置
function handleConfig() {
  const config = getUserConfig();
  
  // 显示当前配置
  const currentInfo = `当前配置：
Key: ${config.key}
IV: ${config.iv}

请输入新的配置：`;

  window.utools.copyText(`Key: ${config.key}\nIV: ${config.iv}`);
  window.utools.showNotification(currentInfo);
  
  // 提示用户输入新的 Key
  setTimeout(() => {
    window.utools.showNotification('请在剪贴板中修改 Key 和 IV，然后按回车确认。');
    
    // 监听剪贴板变化（简单实现）
    const checkClipboard = () => {
      // 这里我们使用一个简单的方法：让用户手动输入
      // 由于 uTools 的限制，我们通过通知来指导用户
      window.utools.showNotification('配置说明：\n1. Key 需要32字符\n2. IV 需要16字符\n3. 请使用"生成随机 Key"和"生成随机 IV"来获取随机值');
    };
    
    setTimeout(checkClipboard, 1000);
  }, 1000);
}

// 显示配置
function handleShowConfig() {
  const config = getUserConfig();
  window.utools.copyText(`Key: ${config.key}\nIV: ${config.iv}`);
  window.utools.showNotification(`当前配置已复制到剪贴板！\nKey: ${config.key}\nIV: ${config.iv}`);
}

// 生成新配置
function handleGenerateConfig() {
  const newKey = generateRandomKey();
  const newIV = generateRandomIV();
  
  const newConfig = {
    key: newKey,
    iv: newIV
  };
  
  if (saveUserConfig(newConfig)) {
    window.utools.copyText(`Key: ${newKey}\nIV: ${newIV}`);
    window.utools.showNotification(`新配置已保存并复制到剪贴板！\nKey: ${newKey}\nIV: ${newIV}`);
  } else {
    window.utools.showNotification('配置保存失败！');
  }
}

// 设置配置
function handleSetConfig(key, iv) {
  // 验证 Key 和 IV 不为空
  if (!key || key.trim() === '') {
    window.utools.showNotification('Key 不能为空！');
    return;
  }
  
  if (!iv || iv.trim() === '') {
    window.utools.showNotification('IV 不能为空！');
    return;
  }
  
  const newConfig = {
    key: key,
    iv: iv
  };
  
  if (saveUserConfig(newConfig)) {
    window.utools.showNotification(`配置已保存！\nKey: ${newConfig.key}\nIV: ${newConfig.iv}`);
  } else {
    window.utools.showNotification('配置保存失败！');
  }
}

// 处理 MD5 加密
function handleMd5Encrypt(text) {
  try {
    const md5Hash = md5Encrypt(text || "Hello World");
    window.utools.copyText(md5Hash);
    window.utools.showNotification(`MD5 加密成功！结果已复制到剪贴板: ${md5Hash}`);
  } catch (error) {
    window.utools.showNotification(`MD5 加密失败: ${error.message}`);
  }
}

// 暴露给前端的 API（如果需要自定义界面）
window.cryptoAPI = {
  aesEncrypt: aesEncrypt,
  aesDecrypt: aesDecrypt,
  md5Encrypt: md5Encrypt,
  generateKey: generateRandomKey,
  generateIV: generateRandomIV,
  getUserConfig: getUserConfig,
  saveUserConfig: saveUserConfig
};
