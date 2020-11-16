/**
 * @file 小工具
 * 用于测试一些接口或功能, 可移除
 */

(function(utils, $) {
  /**
   *
   * @param {Object} options 工具设置
   * @param {String} options.container 工具的容器 css选择器
   * @param {Object} options.liveSdkEl 直播JS-SDK的实例
   */
  function Tool(options) {
    if (!options.container || !options.liveSdkEl) return;

    this.$entrance = '';
    this.$main = '';
    this.toolLists = {};
    this.mainShow = false;
    this.$purposeDom = $(options.container);

    this.liveSdk = options.liveSdkEl;
    this.renderEnterance();
    this.renderMain();
    this.registerLiveSDK();
    this.renderTool();
  }

  /**
   * 渲染工具入口entrance
   */
  Tool.prototype.renderEnterance = function() {
    var self = this;
    this.$entrance = $('<div class="tool-entrance">小工具<span class="tool-entrance__close">x</span></div>');
    this.$purposeDom.append(this.$entrance);

    this.$entrance.click(function() {
      self.toggle();
    });

    this.$entrance.find('.tool-entrance__close').click(function(e) {
      e.stopPropagation();
      self.$entrance.hide();
      self.hide();
    });
  };

  /**
     * 渲染主界面
     */
  Tool.prototype.renderMain = function() {
    var htmlMain = '<div class="tool-main" style="display:none"></div>';
    this.$main = $(htmlMain);
    this.$purposeDom.append(this.$main);
  };

  Tool.prototype.toggle = function() {
    this.$main.toggle();
  };

  /**
   *
   */
  Tool.prototype.show = function() {
    this.$main.show();
  };

  Tool.prototype.hide = function() {
    this.$main.hide();
  };

  /**
   * 解析并渲染工具列表
   */
  Tool.prototype.renderTool = function() {
    var $list = $('<div class="tool-list"></div>');
    var list = Object.keys(this.toolLists);
    for (var i = 0; i < list.length; i++) {
      var key = list[i];
      var item = this.toolLists[key];
      var type = item.type;
      var $btn = '';
      var $dom = '';

      if (type === 'btn') {
        $dom = $(getBtnHtml(key, item));
        $dom.click(item.handler);
      } else if (type === 'input') {
        $dom = $(getInputHtml(key, item));
        var $input = $dom.children('#input_' + key);
        $btn = $dom.children('#' + key);
        $btn.click($input, item.handler);
      }

      $list.append($dom);
    }

    this.$main.append($list);

    function getBtnHtml(key, item) {
      return '<button class="tool-btn" id=' + key + '>' + item.name + '</button>';
    }

    function getInputHtml(key, item) {
      var btn = getBtnHtml(key, item);
      return '<div class="tool-input-group"><input id="input_' + key + '" placeholder="' + (item.placeHolder || '') + '" />' + btn + '</div>';
    }
  };

  /**
   * 注册小工具的功能
   * @param {String} key 注册的工具key值, 用作对象存储和作为元素的id
   * @param {Object} options 工具的设置
   * @param {String} options.name 按钮的显示的名称
   * @param {String} options.type 功能的类型 btn | input (btn为纯按钮, input为按钮 + 输入框的组合)
   * @param {function} options.handler 按钮点击事件回调函数
   */
  Tool.prototype.register = function(key, options) {
    if (!options.name || !options.type || !options.handler) return;
    this.toolLists[key] = options;
  };

  /**
   *
   * 注册直播SDK的功能
   */
  Tool.prototype.registerLiveSDK = function() {
    var liveSdk = this.liveSdk;

    this.register('getPlayBackList', {
      name: '获取回放列表',
      type: 'btn',
      handler: function() {
        liveSdk.getPlaybackLists(1, 10).then(function(data) {
          console.info(data);
        });
      }
    });

    this.register('sendChat', {
      name: '发送聊天信息',
      type: 'input',
      handler: function(event) {
        var $input = event.data;
        var value = $input.val();
        liveSdk.send(value);
        console.info('发送信息(webscoket可见):' + value);
        $input.val('');
      }
    });

    this.register('sendCustomMessage', {
      name: '发送自定义消息',
      type: 'input',
      handler: function(event) {
        // 绑定事件
        liveSdk.once(window.PolyvLiveSdk.EVENTS.CUSTOM_MESSAGE, function(data) {
          console.info(data);
        });

        var $input = event.data;
        var value = $input.val();
        liveSdk.sendCustomMessage({
          EVENT: 'custom',
          data: value
        });
        console.info('发送自定义信息(webscoket可见):' + value);
        $input.val('');
      }
    });

    this.register('getHistory', {
      name: '获取历史聊天记录',
      type: 'btn',
      handler: function() {
        liveSdk.once(window.PolyvLiveSdk.EVENTS.HISTORY_MESSAGE, function(event, data) {
          console.info('历史聊天记录数据');
          console.info(data);
        });
        liveSdk.getHistoryMessage();
      }
    });

    this.register('pausePlay', {
      name: '暂停播放',
      type: 'btn',
      handler: function() {
        liveSdk.player.pause();
      }
    });

    this.register('resumePlay', {
      name: '恢复播放',
      type: 'btn',
      handler: function() {
        liveSdk.player.play();
      }
    });

    this.register('togglePlay', {
      name: 'toggle播放',
      type: 'btn',
      handler: function() {
        liveSdk.player.togglePlay();
      }
    });

    this.register('toolSeek', {
      name: '跳转',
      type: 'input',
      placeHolder: '输入数字(单位秒)',
      handler: function(event) {
        var $input = event.data;
        var value = $input.val();
        liveSdk.player.seek(value);
        $input.val('');
      }
    });

    this.register('toolSwitchVod', {
      name: '切换回放(回放模式才有效)',
      type: 'input',
      placeHolder: '输入vid',
      handler: function(event) {
        var $input = event.data;
        var value = $input.val();
        liveSdk.switchVod({
          vid: value
        });
        console.info('切换回放:' + value);
      }
    });

    this.register('toolSendQuestion', {
      name: '发送问答私聊',
      type: 'input',
      handler: function(event) {
        var $input = event.data;
        var value = $input.val();
        liveSdk.sendQuestion(value);
        console.info('发送私聊:' + value);
        $input.val('');
      }
    });

  };

  window.miniTool = Tool;

})(window.plvUtils, window.jQuery);
