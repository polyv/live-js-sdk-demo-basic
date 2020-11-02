# 直播JS-SDK DEMO


## 介绍

为了帮助客户更好地理解、接入「**POLYV 直播 JavaScript SDK**」，本项目提供了一个标准的 demo 以供参考。

### Demo 功能点
| 分类 | 功能 | 支持情况 |
|---|---|---|
| 聊天室 | 欢迎语 | ✔ |
| | 点赞 | ✔ |
| | 送花 | ✔ |
| | 聊天信息 | ✔ |
| | 只看主持人 | ✔ |
| | 设置昵称 | ✔ |
| | 连接超时提醒 | ✔ |
| | 在线列表 | ✔ |
| | 提问 | ✔ |
| 播放器 | 音量设置 | ✔ |
| | 暂停/恢复播放 | ✔ |
| | seek | ✔ |
| | 切换倍速 | ✔ |
| | 关闭或显示讲师摄像头 | ✔ |
| | 切换当前线路 | ✔ |
| | PPT翻页 | ✔ |
| | 发送弹幕 | ✔ |
| | 隐藏/恢复弹幕 | ✔ |
| | 切换清晰度(需支持多码率) | ✔ |
| | 支持回放 | ✔ |
| 互动功能 | 公告(聊天室显示) | ✔ |
| | 签到 | ✘ |
| | 答题卡 | ✘ |
| | 问卷 | ✘ |
| | 抽奖 | ✘ |
| 其他 |  |  |
| | 直播介绍 | ✔ |
| | 自定义图文菜单 | ✔ |
| | 直播间状态显示 | ✔ |
| | 纯回放模式 | ✔ |

### 浏览器兼容性
- 支持主流 PC 浏览器，包括 Chrome、Safari、Edge、Firefox、IE(>=10) 等 。
- 支持主流移动端浏览器或 WebView，包括 UC 浏览器、QQ 浏览器、微信浏览器、各厂商自带浏览器等。


## 运行 demo

Demo 的源码位于项目的 src 目录下。注意，直接双击 index.html *无法* 完全正常运行。请通过 Nginx、Apache 或 IIS 等应用程序服务器配置一个本地 http 地址进行访问。

您还可以结合 POLYV 官方文档查阅 demo 源码：

- [直播 JavaScript SDK 使用文档](https://dev.polyv.net/2019/liveproduct/l-sdk/web-sdk/)
- [直播聊天室JS-SDK](https://dev.polyv.net/2019/liveproduct/zblts/chat_js_sdk/)
- [直播API签名规则](https://dev.polyv.net/2018/liveproduct/l-api/notice/sign/)


## 补充说明

### 已知问题
- 切换主副屏后，弹幕无法在主屏幕上显示。

### 安全性说明（重要）
- 实际使用时，请*不要*将 appSecret 暴露在前端，本 demo 仅为演示。

### 关于自动播放
设置了 autoplay 参数后, 使用 PC Chrome 浏览器打开 demo 页可能会出现静音自动播放的情况, 这是浏览器的自动播放策略导致的。关于 Chrome 的自动播放策略请参考 [Autoplay Policy Changes(国内网络可能打不开)](https://developers.google.com/web/updates/2017/09/autoplay-policy-changes)。
 
此外， 移动端不支持自动播放。

### 关于回放
播放器的配置参数[type](https://dev.polyv.net/2019/liveproduct/l-sdk/web-sdk/#i-7)会影响播放器的回放：
- 设置为 `auto` 时，根据频道的实际设置自动选择播放类型，也是 demo 页的设置。此时播放器会按以下优先级播放视频：
  1. 直播；
  2. 回放列表视频；
  3. 第一个暂存视频。
- 设置为 `live` 时，不播放回放。
- 设置为 `vod` 时，需要设置 vid 参数去指定某个回放。vid 的值可以通过 SDK 的实例方法 getPlaybackLists 获取。

### Demo 使用的第三方库
- [blueimp-md5](https://github.com/blueimp/JavaScript-MD5) 版本 2.11.0
- [jquery](https://github.com/jquery/jquery) 版本 2.2.4
- [Cross-Domain AJAX](https://github.com/MoonScript/jQuery-ajaxTransport-XDomainRequest) 兼容IE9

### 版本更新
#### v1.1.0
  - 增加直播介绍
  - 配置页(或登录页)支持设置纯回放模式
  - 增加直播间状态显示
  - 新增点赞按钮
  - 新增"小工具", 用于调试一些功能
#### V1.0.0

