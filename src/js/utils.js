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
   * https://help.polyv.net/index.html#/live/api/channel/operate/get_channel_detail_setting
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
   * 获取观众观看调用接口token, 部分SDK的接口会用到这个token
   * @param {Object} params 参与sign生成的参数，详细请看sign生成规则
   * @param {Function} callback 接口请求成功后的回调
   */
  function getApiToken(params, callback) {
    var api = getProtocol() + '//api.polyv.net/live/v3/channel/watch/get-api-token';
    request({
      url: api,
      method: 'POST',
      data: params,
      success: function(res) {
        callback(res.data);
      }
    });
  }

  /**
   * 获得聊天室的校验token
   * https://help.polyv.net/index.html#/live/api/channel/operate/get_chat_token
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

  /**
   * 简单的对象深拷贝, 有些情况的深拷贝可能不支持
   * @param obj {Object} 对象
   */
  function deepCopy(obj) {
    var rs;
    try {
      rs = JSON.parse(JSON.stringify(obj));
    } catch (e) {
      rs = {};
      console.warn('JSON parse error');
    }
    return rs;
  }

  /**
   * 简单的polyfill
   */
  function simplePolyfill() {
    // IE支持assign
    if (typeof Object.assign != 'function') {
      Object.assign = function(target) {
        'use strict';
        if (target == null) {
          throw new TypeError('Cannot convert undefined or null to object');
        }

        target = Object(target);
        for (var index = 1; index < arguments.length; index++) {
          var source = arguments[index];
          if (source != null) {
            for (var key in source) {
              if (Object.prototype.hasOwnProperty.call(source, key)) {
                target[key] = source[key];
              }
            }
          }
        }
        return target;
      };
    }
  }

  simplePolyfill();

  return {
    getSign: getSign,
    isMobile: isMobile,
    getChannelInfo: getChannelInfo,
    getChatToken: getChatToken,
    getApiToken: getApiToken,
    deepCopy: deepCopy
  };
})(window.jQuery, window.md5);
