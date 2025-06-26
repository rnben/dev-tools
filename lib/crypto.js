const crypto = require('crypto');

// AES-CBC 加密函数
function aesEncrypt(plainText, key, iv) {
  try {
    if (!plainText || !key || !iv) {
      throw new Error('明文、密钥和初始向量都不能为空');
    }

    // 确保 key 和 iv 长度正确
    const keyBuffer = Buffer.from(key, 'utf8');
    const ivBuffer = Buffer.from(iv, 'utf8');
    
    // 使用 Node.js 原生 crypto 模块
    const cipher = crypto.createCipheriv('aes-256-cbc', keyBuffer, ivBuffer);
    let encrypted = cipher.update(plainText, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
  } catch (error) {
    throw new Error(`加密失败: ${error.message}`);
  }
}

// AES-CBC 解密函数
function aesDecrypt(cipherText, key, iv) {
  try {
    if (!cipherText || !key || !iv) {
      throw new Error('密文、密钥和初始向量都不能为空');
    }

    // 确保 key 和 iv 长度正确
    const keyBuffer = Buffer.from(key, 'utf8');
    const ivBuffer = Buffer.from(iv, 'utf8');
    
    // 使用 Node.js 原生 crypto 模块
    const decipher = crypto.createDecipheriv('aes-256-cbc', keyBuffer, ivBuffer);
    let decrypted = decipher.update(cipherText, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    throw new Error(`解密失败: ${error.message}`);
  }
}

// MD5 加密
function md5Encrypt(text) {
  if (!text) {
    throw new Error('输入文本不能为空');
  }
  return crypto.createHash('md5').update(text).digest('hex');
}

// 生成随机 Key 和 IV
function generateRandomKey() {
  return crypto.randomBytes(32).toString('hex');
}

function generateRandomIV() {
  return crypto.randomBytes(16).toString('hex');
}

module.exports = {
  aesEncrypt,
  aesDecrypt,
  md5Encrypt,
  generateRandomKey,
  generateRandomIV
}; 