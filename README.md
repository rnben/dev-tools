# README

基于 utools 模版插件应用实现的加解密工具: aes、md5

AES 加密结果太长的主要原因是：
CryptoJS 默认行为：CryptoJS 的 AES.encrypt 方法默认会生成一个随机的 salt，这会导致每次加密结果都不同且很长
Key 处理方式：CryptoJS 会将 key 进行 PBKDF2 处理，这也会增加复杂度