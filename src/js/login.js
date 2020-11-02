(function($) {
  function Login() {
    this.appSecret = '';
    this.appId = '';
    this.channelId = '';
    this.playbackMode = false;
    this.vid = '';

    this.$login = ''; // 登陆窗口
    this.$playbackCheckbox = ''; // 回放模式checkbox

    this.init();
  }

  /**
   * 显示登陆模块
   */
  Login.prototype.show = function() {
    this.$login.show();
  };

  /**
   * 隐藏登陆模块
   */
  Login.prototype.hide = function() {
    this.$login.hide();
  };

  /**
   * 登陆模块初始化
   */
  Login.prototype.init = function() {
    var self = this;
    this.$login = $('#plv-config');
    this.$playbackCheckbox = this.$login.find('#plabackMode');
    this.$inputVid = this.$login.find('[name=plv-playback-vid]');

    this.addListener();
    this.show();
    $('.plv-config__button').click(function() {
      var appId = self.$login.find('[name=plv-app-id]').val();
      var appSecret = self.$login.find('[name=plv-app-secret]').val();
      var channelId = self.$login.find('[name=plv-channel-id]').val();
      var vid = self.$inputVid.val();

      if (appId && appSecret && channelId && ((self.playbackMode && vid) || !self.playbackMode)) {
        self.appId = appId;
        self.appSecret = appSecret;
        self.channelId = channelId;
        self.vid = vid;

        self.hide();
        self.handleClickLogin();
      } else {
        alert('请检查参数');
      }
    });
  };

  /**
   * 绑定事件
   */
  Login.prototype.addListener = function() {
    var self = this;
    this.$playbackCheckbox.change(function() {
      var checked = $(this).prop('checked');
      if (checked) {
        self.playbackMode = true;
        self.$inputVid.show();
      } else {
        self.playbackMode = false;
        self.$inputVid.hide();
      }
    });
  };

  /**
   * 绑定点击事件
   * @param {Function} callback 点击“打开观看页”按钮后的需要触发的回调函数
   */
  Login.prototype.onClickLogin = function(callback) {
    this.clickCallback = callback;
  };
  /**
   * 触发回调并传入参数
   * @returns {String} appSecret 应用密匙
   * @returns {String} appId 应用ID
   * @returns {String} channelId 频道id
   * @returns {Boolean}} playbackMode 是否为纯回放模式
   * @returns {String} vid 回放id
   */
  Login.prototype.handleClickLogin = function() {
    this.clickCallback({
      appSecret: this.appSecret,
      appId: this.appId,
      channelId: this.channelId,
      playbackMode: this.playbackMode,
      vid: this.vid
    });
  };

  window.LoginModule = Login;

})(window.jQuery);
