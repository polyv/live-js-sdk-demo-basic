/**
 * @file 菜单栏
 * 在PC端上能显示直播介绍和自定义的图文菜单
 * 在移动端上只渲染直播介绍
 */

window.plvMenu = (function() {
  // 依赖
  var utils = window.plvUtils;

  var $menuTab = null;
  var $menuContent = null;
  var $tabIntro = null;

  function createTabDomHTML(menu, active) {
    return '<li class="' + (active ? 'active' : '') + '" data-menuId="' + menu.menuId + '" >' + menu.name + '</li>';
  }

  function createContentbDomHTML(menu, active) {
    return '<div class="' + (active ? 'active' : '') + '" data-menuId="' + menu.menuId + '" >' + (menu.content || '') + ' </div>';
  }

  /**
   * pc端菜单tab绑定点击事件
   */
  function initListener() {
    var activeClass = 'active';
    $menuTab.addEventListener('click', function(event) {
      var target = event.target;
      var menuId = target.getAttribute('data-menuId');
      while (!menuId && $menuTab !== target) {
        target = target.parentNode;
        menuId = target.getAttribute('data-menuId');
      }

      if (menuId) {
        if (target.classList.contains(activeClass)) return;
        $menuTab.querySelector('.' + activeClass).classList.remove(activeClass);
        $menuContent.querySelector('.' + activeClass).classList.remove(activeClass);
        target.classList.add(activeClass);
        $menuContent.querySelector('[data-menuId="' + menuId + '"]').classList.add(activeClass);
      }
    });
  }

  /**
   * 渲染PC端的菜单
   * @param {Array} menuArray 菜单数据
   */
  function renderPcMenu(menuArray) {
    $menuTab = document.querySelector('#plv-menu-tab');
    $menuContent = document.querySelector('#plv-menu-content');
    var tabDomHTML = '';
    var contentDomHTML = '';
    menuArray.forEach(function(menu) {
      // 非直播介绍与自定义图文菜单不处理，其他类型只表示在后台是否添加了该菜单，需不需要响应按实际需要处理
      if (menu.menuType !== 'desc' && menu.menuType !== 'text') {
        return;
      }

      tabDomHTML = tabDomHTML + createTabDomHTML(menu, !tabDomHTML);
      contentDomHTML = contentDomHTML + createContentbDomHTML(menu, !contentDomHTML);
    });
    $menuTab.innerHTML = tabDomHTML;
    // 内容为富文本，所以要添加html
    $menuContent.innerHTML = contentDomHTML;
  }

  /**
   * 创建html字符串
   * @param {Object} data 频道数据
   * @param {Array} menuArray 菜单数据
   */
  function createIntroDOMHTML(data, menuArray) {
    var descContent = '';
    for (var i = 0; i < menuArray.length; i++) {
      if (menuArray[i].menuType === 'desc') {
        descContent = menuArray[i].content;
        break;
      }
    }
    return '' +
      '<div class="tab-intro-info">' +
        '<img class="tab-intro-info__logo" src="' + data.coverImage + '" />' +
        '<div class="tab-intro-info__inner">' +
          '<p class="tab-intro-info__title">' + data.name + '</p>' +
          '<p class="tab-intro-info__time">' + (data.startTime || '— —') + '|' + data.pageView + '次观看</p>' +
        '</div>' +
      '</div>' +
      '<div class="tab-intro-author">' +
        '<div class="tab-intro-author__publisher">' +
          '<span class="tab-intro-author__publisher-ico"></span>' +
          '<span>' + data.publisher + '</span>' +
        '</div>' +
        '<div class="tab-intro-author__like">' +
          '<span class="tab-intro-author__like-ico"></span><span id="intro-likes">' + data.likes + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="tab-intro-desc">' + descContent + '</div>';
  }

  // 渲染移动端的直播介绍
  function renderMobileIntro(data, menus) {
    var tabContent = '';
    $tabIntro = document.querySelector('#tab-intro');

    tabContent = createIntroDOMHTML(data, menus);
    $tabIntro.innerHTML = tabContent;
  }

  /**
   * 渲染菜单,PC端会渲染自定义的图文菜单
   * 移动端只渲染直播介绍的tab的内容
   * @param {Object} data 频道信息 移动端必须
   * @param {Array} menus 频道菜单 必须
   */
  function renderMenu(data, menus) {
    if (utils.isMobile()) {
      renderMobileIntro(data, menus);
    } else {
      renderPcMenu(menus);
      // 绑定点击菜单切换内容的事件
      initListener();
    }
  }

  return {
    renderMenu: renderMenu,
  };
})();
