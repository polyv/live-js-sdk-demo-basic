/**
 * @file 工具函数
 */

window.plvUtils = (function($, md5) {
  /**
   * 参数排序，按字典顺序排序，详细请看sign生成规则
   * https://dev.polyv.net/2018/liveproduct/l-api/notice/sign/
   * @param {Object} params 待排序的参数
   *
   */
  function sortParams(params) {
    var keys = Object.keys(params).sort();
    var paramsString = '';
    for (var i = 0; i < keys.length; i++) {
      paramsString += keys[i] + params[keys[i]];
    }
    return paramsString;
  }

  /**
   * 生成直播API的sign
   * 重要！！不建议在前端生成sign。该demo仅供参考。  @resolved 注释的最后一句不太通顺。
   * @param {String} appSecret 直播账号的appSecret
   * @param {Object} params 参与sign生成的参数，详细请看sign生成规则
   */
  function getSign(appSecret, params) {
    var paramString = sortParams(params);
    var signString = appSecret + paramString + appSecret;
    return md5(signString).toUpperCase();
  }

  /**
   * 检查当前UA是否为移动端
   */
  function isMobile() {
    var ua = navigator.userAgent;
    return /mobile|android/i.test(ua) || !/\b(Windows\sNT|Macintosh|Linux)\b/.test(ua);
  }

  /**
   * 获得当前的协议
   */
  function getProtocol() {
    return window.location.protocol === 'http:' ? 'http:' : 'https:';
  }

  /**
   * 获得频道基础信息
   * https://dev.polyv.net/2019/liveproduct/l-api/zbglgn/pdcz/get-detail-setting/
   * @param {Object} params 参与sign生成的参数，详细请看sign生成规则
   * @param {Function} callback 接口请求成功后的回调
   */
  function getChannelInfo(params, callback) {
    var api = getProtocol() + '//api.polyv.net/live/v3/channel/basic/get';
    request({
      url: api,
      method: 'GET',
      data: params,
      success: function(res) {
        callback(res.data);
      }
    });
  }

  /**
   * 获得聊天室的校验token
   * http://dev.polyv.net/2019/liveproduct/l-api/zbglgn/pdcz/get-chat-token/
   * @param {Object} params 参与sign生成的参数，详细请看sign生成规则
   * @param {Function} callback 接口请求成功后的回调
   */
  function getChatToken(params, callback) {
    var api = getProtocol() + '//api.polyv.net/live/v3/channel/common/get-chat-token';
    request({
      url: api,
      method: 'GET',
      data: params,
      success: function(res) {
        callback(res.data);
      }
    });
  }

  /**
   * 封装了一下ajax, 加上一些特殊情况的处理
   * todo 干掉layer
   * @param {Object} options ajax请求的参数
   */
  function request(options) {
    var config = options;
    typeof config.error === 'function' || (config.error = error); // 默认给接口设置一个error的回调处理  @resolved 缺少出错时的回调以及对应处理

    function error(xhr) {
      var errorText = xhr.responseText;
      alert(errorText);
    }

    $.ajax(config);
  }

  return {
    getSign: getSign,
    isMobile: isMobile,
    getChannelInfo: getChannelInfo,
    getChatToken: getChatToken
  };
})(window.jQuery, window.md5);
