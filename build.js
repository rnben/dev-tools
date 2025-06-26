const fs = require('fs');
const path = require('path');

// 构建脚本 - 用于模板插件应用
function buildPlugin() {
  const distDir = 'dist';
  
  // 确保 dist 目录存在
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }
  
  // 需要复制的文件列表
  const filesToCopy = [
    'plugin.json',
    'preload.js',
    'logo.png'
  ];
  
  // 复制文件到 dist 目录
  filesToCopy.forEach(file => {
    if (fs.existsSync(file)) {
      const destPath = path.join(distDir, file);
      fs.copyFileSync(file, destPath);
      console.log(`✅ 已复制: ${file} -> ${destPath}`);
    } else {
      console.warn(`⚠️  文件不存在: ${file}`);
    }
  });
  
  // 复制 node_modules 中的 crypto-js（如果存在）
  const cryptoJsPath = 'node_modules/crypto-js';
  const distCryptoJsPath = path.join(distDir, 'node_modules/crypto-js');
  
  if (fs.existsSync(cryptoJsPath)) {
    if (!fs.existsSync(path.join(distDir, 'node_modules'))) {
      fs.mkdirSync(path.join(distDir, 'node_modules'), { recursive: true });
    }
    
    // 复制整个 crypto-js 目录
    copyDir(cryptoJsPath, distCryptoJsPath);
    console.log(`✅ 已复制: ${cryptoJsPath} -> ${distCryptoJsPath}`);
  }
  
  console.log('🎉 构建完成！dist 目录已准备好用于 uTools 插件打包。');
}

// 递归复制目录
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// 执行构建
buildPlugin(); 