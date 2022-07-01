(function() {
  // 引入外部依赖
  var $ = window.$; // jQuery
  var utils = window.plvUtils; // 工具函数
  var PolyvChatRoom = window.PolyvChatRoom; // 聊天室JS-SDK
  var PolyvLiveSdk = window.PolyvLiveSdk; // 直播JS-SDK
  var plvMenu = window.plvMenu; // 菜单栏
  var Tool = window.miniTool; // 小工具
  var Login = window.LoginModule; // 登陆模块

  // 用户 id。应设为用户系统中的用户 id，本 demo 生成方式仅供演示
  var userId = (new Date().getTime()).toString() +
    (10000 + parseInt(Math.random() * 90000));

  // 配置
  var config = {
    channelId: '', // 频道号
    appId: '', // 直播后台AppID(应用ID)
    appSecret: '', // ！！！不建议 appSecret 暴露在前端中

    // 以下三个值应设置为用户系统中的对应值，本 demo 生成方式仅供演示
    nickname: '观众' + userId, // 昵称, 可以设置为用户系统中的用户昵称
    avatar: 'https://livestatic.videocc.net/assets/wimages/missing_face.png', // 聊天室头像, 可以设置为用户系统中的用户头像
    userId: 'polyv' + userId, // 设置用户id, 可以设置为用户系统里的用户 id

    role: 'viewer', // 角色, 用于获取授权和连麦token http://api.polyv.net/live/v3/channel/common/get-chat-token
    chat: {
      userType: 'student', // 普通直播默认为student 三分屏为slice
      // 在 preRender 函数中，移动端会添加 ppt 的 tab。自定义菜单栏文档: https://help.polyv.net/index.html#/live/js/chat_js_sdk_api?id=自定义菜单栏
      tabData: [
        {
          name: '聊天', // 菜单栏名称
          type: 'chat' // 菜单栏类型, 有3个已有的内置类型(chat, user-list, ask),详情请参考文档
        },
        {
          name: '提问',
          type: 'ask'
        }
      ],
    },

    playerType: 'auto', // 播放器播放类型， 默认auto
    vid: '' // 回放id, 用于回放模式时设置对应的回放
  };

  var platform = utils.isMobile() ? 'mobile' : 'pc';
  var timestamp = +new Date(); // sign 生成所需的时间戳

  var $likeNum = ''; // 点赞按钮下的点赞数
  var $introLike = ''; // 移动端直播介绍点赞数

  // SDK用到的容器元素的选择器， 移动端和PC的容器不同， 在preRender上设置
  var els = {
    playerEl: '', // 播放器容器选择器, 移动端和PC的el参数设置不
    pptEl: '', // 文档容器选择器, 普通直播不需要设置pptEl
    controllerEl: '', // 三分屏控制栏的容器选择器， pc三分屏的场景才需要设置controllerEl,
    chatContainer: '' // 聊天室的容器选择器
  };

  // 保存一些对象实例和常用数据
  var plv = {
    liveSdk: null, // 保存直播 JS-SDK 实例
    socket: null, // 保存 WebSocket 实例
    scene: '', // 场景
    mainPosition: 'ppt' // 用于记录当前主屏幕是文档还是播放器
  };

  if (!config.channelId || !config.appId || !config.appSecret) {
    // 没有配置config内的channelId, appId, appSecret时, 通过Input获得参数并加载观看页
    // 加载登陆模块
    var login = new Login();
    // 点击按钮“打开观看页”
    login.onClickLogin(function(data) {
      config.appId = data.appId;
      config.appSecret = data.appSecret;
      config.channelId = data.channelId;

      // 设置回放模式后的参数设置
      if (data.playbackMode) {
        config.playerType = 'vod';
        config.vid = data.vid;
      }

      initWatch();
    });
  } else {
    // 观看页加载入口
    initWatch();
  }

  // 开始加载观看页
  function initWatch() {
    var channelInfoParams = {
      appId: config.appId,
      timestamp: timestamp,
      channelId: config.channelId
    };

    // 用于请求get-api-token接口的参数, 注意,ie不支持Object.assign, 需要做兼容处理
    var apiTokenParams = Object.assign(utils.deepCopy(channelInfoParams), {
      viewerId: config.userId
    });

    // ！！！不要在前端生成sign，此处仅供参考
    channelInfoParams.sign = utils.getSign(config.appSecret, channelInfoParams);
    apiTokenParams.sign = utils.getSign(config.appSecret, apiTokenParams);

    utils.getChannelInfo(channelInfoParams, function(res) {
      preRender(res);
      loadSdk(function() {
        // SDK设置接口token, 用于一些互动的功能接口的请求,如点赞.
        utils.getApiToken(apiTokenParams, function(data) {
          plv.liveSdk.setApiToken(data.token);
        });
      });
    });
  }

  // 不同场景和平台下的处理
  function preRender(channelInfo) {
    var scene = plv.scene = channelInfo.scene; // scene的值为 alone(普通直播)或ppt(三分屏)
    if (platform === 'mobile') {
      $('.plv-watch-mobile').css('display', '');
      els.playerEl = '#plv-mobile-player'; // 讲师区域元素
      els.chatContainer = '#plv-mobile-chat'; // DOM选择器，HTML元素，用于渲染聊天室
      config.chat.tabData.unshift({
        name: '直播介绍',
        type: 'intro'
      });
    } else {
      $('.plv-watch-pc').css('display', '');
      $('.plv-pc-menu').css('display', '');
      setChannelInfo(channelInfo);
    }

    if (scene === 'ppt') {
      // 三分屏聊天室的userType需要为slice
      config.chat.userType = 'slice';
    }

    if (scene === 'ppt' && platform === 'pc') {
      els.chatContainer = '#plv-pc-chat'; // DOM选择器，HTML元素，用于渲染聊天室
      els.pptEl = '#plv-pc-main'; // ppt文档元素选择器，非云课堂可不填
      els.playerEl = '#plv-pc-side'; // 讲师区域元素
      els.controllerEl = $('#plv-pc-top')[0]; // 控制栏父元素
    }

    if (scene === 'alone' && platform === 'pc') {
      $('.plv-watch-pc').addClass('plv-watch-pc--alone');
      els.chatContainer = '#plv-pc-chat'; // DOM选择器，HTML元素，用于渲染聊天室
      els.playerEl = '#plv-pc-main'; // 讲师区域元素
    }

    if (scene === 'ppt' && platform === 'mobile') {
      // 移动端的文档是显示在聊天室的tab中
      config.chat.tabData.unshift({
        name: '文档',
        type: 'ppt'
      });
      els.pptEl = '#tab-ppt'; // ppt文档元素选择器，非云课堂可不填
    }
  }

  // 写入直播的信息
  function setChannelInfo(channelInfo) {
    var pcInfo = $('#plv-pc-channel-info');
    pcInfo.find('.plv-watch-pc__info__desc__name').text(channelInfo.name);
    pcInfo.find('.plv-watch-pc__info__desc__publisher').text(channelInfo.publisher);
    pcInfo.find('.plv-watch-pc__info__desc__view').text(channelInfo.pageView + ' 次观看');
    pcInfo.show();
  }

  // 加载SDK
  // @param callback {sdkLoadCallback} 加载SDK实例后的回调.
  // 注意, 该回调触发只能说明SDK的实例化了, 直播JS-SDK的播放器不一定加载完了.
  // @callback sdkLoadCallback
  function loadSdk(sdkLoadCallback) {
    // 聊天室JS-SDK加载需要先请求校验码
    var chatApiParam = {
      appId: config.appId,
      timestamp: timestamp,
      channelId: config.channelId,
      userId: config.userId,
      role: config.role
    };
    // ！！！不要在前端生成sign，此处仅供参考
    chatApiParam.sign = utils.getSign(config.appSecret, chatApiParam);

    utils.getChatToken(chatApiParam, function(res) {
      createChatRoom(res);
      createLiveSdk();

      sdkLoadCallback();
    });
  }

  // 初始化聊天室, 聊天室参数的设置可以参考文档 https://help.polyv.net/index.html#/live/js/chat_js_sdk_api
  function createChatRoom(res) {
    var chatroom = new PolyvChatRoom({
      roomId: config.channelId,
      userId: config.userId,
      pic: config.avatar,
      // nick: config.nickname, // 固定昵称
      enableSetNickname: true, // 开启设置昵称功能
      userType: config.chat.userType, // 用户类型, 默认为student，三分屏场景下学员需设置为slice,
      width: '100%',
      height: '100%',
      version: '2.0',
      role: 'viewer', // 角色, 用于获取授权和连麦token http://api.polyv.net/live/v3/channel/common/get-chat-token
      token: res.token, // 授权校验码
      mediaChannelKey: res.mediaChannelKey, // 连麦token, 注， 目前聊天室JS-SDK还不支持连麦
      container: els.chatContainer,
      enableWelcome: true, // 是否开启欢迎语，默认为true
      enableFlower: true, // 是否开启送花功能，默认为true
      enableOnlyTeacher: true, // 是否开启只看讲师功能，默认为true
      tabData: config.chat.tabData,
      enableLike: false,
      roomMessage: function(data) {
        // data为聊天室socket消息，当有聊天室消息时会触发此方法
        var event = data.EVENT;
        if (event === 'sendMessage' || event === 'SPEAK') {
          sendBarrage(data.content);
        }
      },
      customChatColor: {
        selfBgColor: '#2b2c35',
        selfColor: '#fff',
        otherBgColor: '#2b2c35',
        otherColor: '#fff',
        specialBgColor: '#2b2c35',
        specialColor: '#fff'
      }
    });

    plv.socket = chatroom.chat.socket;
    plv.scene === 'ppt' && platform === 'mobile' && handlePptTabClick(); // 移动端三分屏场景，切换到文档tab时需要调用一下resize
  }

  // 初始化直播JS-SDK, 文档： https://help.polyv.net/index.html#/live/js/live_js_sdk/live_js_sdk
  function createLiveSdk() {
    // ！！！不要在前端生成sign，此处仅供参考
    var sign = utils.getSign(config.appSecret, {
      appId: config.appId,
      channelId: config.channelId,
      timestamp: timestamp
    });

    plv.liveSdk = new PolyvLiveSdk({
      channelId: config.channelId,
      sign: sign,
      timestamp: timestamp,
      appId: config.appId,
      socket: plv.socket, // 注：同时接入直播JS-SDK和聊天室JS-SDK需要设置该值， socket对象需要在聊天室初始化后才能拿到。
      user: {
        userId: config.userId,
        userName: config.nickname,
        pic: config.avatar
      },
      param4: '播放器自定义统计参数4',
      param5: '播放器自定义统计参数5'
    });

    // 监听直播JS-SDK的事件， 事件列表: https://help.polyv.net/index.html#/live/js/live_js_sdk/live_js_api?id=事件列表
    plv.liveSdk.on(PolyvLiveSdk.EVENTS.CHANNEL_DATA_INIT, createLiveSdkPlayer); // 监听频道信息并初始化播放器
    plv.liveSdk.on(PolyvLiveSdk.EVENTS.STREAM_UPDATE, handleStreamUpdate); // 监听流状态变化

  }

  // 创建播放器，文档: https://help.polyv.net/index.html#/live/js/live_js_sdk/live_js_api?id=实例方法
  function createLiveSdkPlayer(event, data) {
    plv.liveSdk.setupPlayer({
      el: els.playerEl,
      pptEl: els.pptEl,
      pptPlaceholder: true,
      switchPlayer: true,
      controllerPosition: 'ppt',
      fixedController: true,
      controllerEl: els.controllerEl,
      type: config.playerType,
      vid: config.vid,
      pptNavBottom: '80px',
      barrage: true, // 是否开启弹幕
      defaultBarrageStatus: true,
      autoplay: true
    });

    // 渲染菜单, 移动端只渲染直播介绍, pc端只渲染直播介绍与自定义图文菜单
    plvMenu.renderMenu(data, data.channelMenus);

    // 渲染点赞按钮
    renderLike(data.likes);

    // 渲染直播状态小控件
    renderLiveStatus(data);

    // 加载小工具
    new Tool({
      container: '#plv-pc-chat',
      liveSdkEl: plv.liveSdk
    });

    // 监听直播JS-SDK的播放器事件，请参考实例 player 对象的事件
    plv.liveSdk.player.on('fullscreenChange', handleFullscreenChange);
    plv.liveSdk.player.on('switchPlayer', handleSwitchPlayer); // 点击控制栏切换按钮触发
    plv.liveSdk.player.on('switchMainScreen', switchPlayer);
  }

  // 流状态更新
  function handleStreamUpdate(event, status) {
    if (status === 'live') {
      alert('直播开始了，马上前往直播');
      destroy(); // 销毁观看页
      initWatch(); // 重新初始化观看页
    }
  }

  // 控制栏切换按钮的点击处理函数，仅适用PC端
  function handleSwitchPlayer() {
    var switchPosition = plv.mainPosition === 'ppt' ? 'player' : 'ppt';
    switchPlayer(switchPosition);
  }

  // 点击到文档tab时调用播放器的resize方法，原因：
  // ppt父容器样式改变会导致ppt显示异常，需要调用resize刷新ppt尺寸，该函数用于移动端三分屏场景
  function handlePptTabClick() {
    $('[data-type=ppt]').click(function() {
      setTimeout(function() {
        plv.liveSdk.player.resize();
      }, 0);
    });
  }

  // 全屏/退出全屏回调
  function handleFullscreenChange(isFullScreen, fullScreenElement) {
    if (isFullScreen) {
      $(fullScreenElement).addClass('plv-watch-pc__top--fullscreen');
    } else {
      $(fullScreenElement).removeClass('plv-watch-pc__top--fullscreen');
    }
  }

  // 切换主副屏，如需兼容ie，建议通过css的方式去切换位置，dom操作可能导致播放器异常
  function switchPlayer(nextMainPosition) {
    var pcScreens = $('.plv-watch-pc__screen')
      .removeClass('plv-watch-pc__screen-main plv-watch-pc__screen-sub');

    switch (nextMainPosition) {
      case 'player':
        pcScreens.eq(0).addClass('plv-watch-pc__screen-sub');
        pcScreens.eq(1).addClass('plv-watch-pc__screen-main');
        break;

      case 'ppt':
        pcScreens.eq(0).addClass('plv-watch-pc__screen-main');
        pcScreens.eq(1).addClass('plv-watch-pc__screen-sub');
        break;
    }

    plv.mainPosition = nextMainPosition;
    plv.liveSdk.player.resize(); // ppt容器宽高修改，调用resize刷新ppt尺寸
    plv.liveSdk.player.resizeBarrage(); // 刷新弹幕显示区域尺寸
  }

  // 发送弹幕,封装了一下弹幕的方法
  function sendBarrage(text, color) {
    var barrageColor = color || '#000'; // 弹幕默认颜色 #000
    if (plv.liveSdk && plv.liveSdk.player) {
      plv.liveSdk.player.sendBarrage(text, barrageColor);
    }
  }

  // 销毁观看页
  function destroy() {
    var chatContainer = els.chatContainer;
    $(chatContainer).empty(); // 移除聊天室默认界面

    plv.liveSdk.destroy(); // 直播JS-SDK销毁, 默认销毁时会断开socket的连接
  }

  function createLikeBtnHTML(num) {
    return '' +
      '<div class="plv-watch__likes">' +
        '<span class="plv-watch__likes-icon"></span>' +
        '<p class="plv-watch__likes-num">' + num + '</p>' +
      '</div>';
  }

  // 渲染点赞按钮
  function renderLike(num) {
    var html = createLikeBtnHTML(num);
    var $like = $(html);
    $('#tab-chat').append($like);

    var timer = null;
    var totalLike = num;
    $introLike = platform === 'mobile' ? $('#intro-likes') : '';
    $likeNum = $('.plv-watch__likes-num');

    $like.children('.plv-watch__likes-icon').click(function() {
      if (timer) { return; }

      timer = setTimeout(function() {
        totalLike++;
        $likeNum.text(totalLike);
        $introLike && $introLike.text(totalLike);
        plv.liveSdk.sendLike(1);
        timer = null;
      }, 1000);
    });

  }

  function createLiveStatusHTML(status) {
    var statusClass = 'plv-watch__status--' + status;
    return '<div id="plv-watch__status" class="' + statusClass + '"></div>';
  }

  // 渲染直播状态控件
  function renderLiveStatus(data) {
    var status = data.status === 'Y' ? 'live' : 'end';
    var html = createLiveStatusHTML(status);
    var $status = $(html);
    if (platform === 'pc') {
      $('.plv-watch-pc__info__desc__name').append($status);
    } else {
      $('.tab-intro-info__inner').append($status);
    }

    // 绑定streamUpdate事件, 流状态改变时也改变显示状态
    plv.liveSdk.on(PolyvLiveSdk.EVENTS.STREAM_UPDATE, function(event, status) {
      $status.removeClass().addClass('plv-watch__status--' + status);
    });
  }
})();
