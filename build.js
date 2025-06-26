const fs = require('fs-extra');
const path = require('path');

// 清理 dist 目录
fs.removeSync('dist');

// 复制必要文件
const filesToCopy = [
  'plugin.json',
  'preload.js',
  'logo.png'
];

filesToCopy.forEach(file => {
  if (fs.existsSync(file)) {
    fs.copySync(file, `dist/${file}`);
    console.log(`✅ 已复制: ${file}`);
  }
});

// 复制 lib 目录（包含我们的自定义加解密库）
if (fs.existsSync('lib')) {
  fs.copySync('lib', 'dist/lib');
  console.log('✅ 已复制: lib/');
}

console.log('🎉 构建完成！dist 目录已准备好用于 uTools 插件打包。'); 