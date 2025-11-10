// 页面加载完成后初始化应用
window.onload = function () {
    // 初始化应用
    initApp();
};

// 初始化应用
function initApp() {
    // 模拟加载过程
    simulateLoading();
}

// 模拟加载过程
function simulateLoading() {
    var progress = 0;
    var interval = setInterval(function() {
        progress += Math.random() * 10;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            onLoadingComplete();
        }
        $('.number').html(Math.floor(progress) + "%");
    }, 200);
}

// 加载完成后的处理
function onLoadingComplete() {
    $('.shade').hide();
    $(".flipbook-viewport").show();
    
    // 检测屏幕方向并调整显示
    checkOrientationAndAdjust();
    
    // 初始化翻页书
    initializeFlipbook();
    
    // 监听屏幕方向变化
    $(window).on('resize orientationchange', function() {
        checkOrientationAndAdjust();
    });
}

// 检测屏幕方向并调整显示
function checkOrientationAndAdjust() {
    var isPortrait = window.innerHeight > window.innerWidth;
    
    if (isPortrait) {
        // 竖屏模式 - 创建镜像页
        createMirrorPages();
        
        // 将flipboox宽度设为屏幕宽度的两倍
        var screenWidth = $(window).width();
        $('.flipboox').css({
            'width': (screenWidth * 2) + 'px',
            'transform': 'translateX(-50%)'
        });
        
        // 调整turn.js大小
        if ($('.flipbook').data('turn')) {
            $('.flipbook').turn('size', screenWidth * 2, $(window).height());
        }
    } else {
        // 横屏模式 - 删除镜像页
        removeMirrorPages();
        
        // 恢复正常宽度
        $('.flipboox').css({
            'width': '100%',
            'transform': 'none'
        });
        
        // 调整turn.js大小
        if ($('.flipbook').data('turn')) {
            $('.flipbook').turn('size', $(window).width(), $(window).height());
        }
    }
}

// 创建镜像页
function createMirrorPages() {
    // 如果已经存在镜像页，先删除
    removeMirrorPages();
    
    // 获取所有原始页面
    var originalPages = $('.flipbook .page').not('.mirror-page');
    
    // 为每个原始页面创建镜像页，但跳过最后一页
    originalPages.each(function(index) {
        // 如果是最后一页，则不创建镜像页
        if (index === originalPages.length - 1) {
            return;
        }
        
        var originalPage = $(this);
        var mirrorPage = originalPage.clone();
        
        // 添加镜像类名
        mirrorPage.addClass('mirror-page');
        
        // 将镜像页插入到原始页之后
        originalPage.after(mirrorPage);
    });
}

// 删除镜像页
function removeMirrorPages() {
    $('.flipbook .mirror-page').remove();
}

// 初始化翻页书
function initializeFlipbook() {
    var w = $(window).width();
    var h = $(window).height();
    
    // 根据屏幕方向设置初始宽度
    var isPortrait = h > w;
    if (isPortrait) {
        $('.flipboox').css({
            'width': (w * 2) + 'px',
            'transform': 'translateX(-50%)'
        });
        w = w * 2; // 在竖屏模式下，书本宽度为屏幕宽度的两倍
    } else {
        $('.flipboox').css({
            'width': '100%',
            'transform': 'none'
        });
    }
    
    $('.flipboox').height(h);
    
    // 窗口大小改变时重新调整
    $(window).resize(function () {
        w = $(window).width();
        h = $(window).height();
        
        var isPortrait = h > w;
        if (isPortrait) {
            $('.flipboox').css({
                'width': (w * 2) + 'px',
                'transform': 'translateX(-50%)'
            });
            w = w * 2;
        } else {
            $('.flipboox').css({
                'width': '100%',
                'transform': 'none'
            });
        }
        
        $('.flipboox').height(h);
        
        if ($('.flipbook').data('turn')) {
            $('.flipbook').turn('size', w, h);
        }
    });
    
    // 初始化turn.js
    $('.flipbook').turn({
        width: w,
        height: h,
        elevation: 50,
        display: 'double',
        direction: 'ltr',
        gradients: true,
        autoCenter: false,
        when: {
            turned: function (e, page, view) {
                updateNavigation();
            }
        }
    });
    
    // 初始化导航状态
    updateNavigation();
    
    // 添加点击翻页事件 - 点击页面两侧翻页，中间显示/隐藏导航
    $('.flipbook-viewport').on('click', function(e) {
        // 如果导航已显示，则忽略所有点击事件（除了导航按钮）
        if (!$('#navigation').hasClass('navigation-hidden')) {
            return;
        }
        
        var viewportWidth = $(this).width();
        var clickX = e.pageX - $(this).offset().left;
        var currentPage = $('.flipbook').turn('page');
        var totalPages = $('.flipbook').turn('pages');
        
        // 检查是否点击了图片
        var isImageClick = $(e.target).closest('.image-item').length > 0 || 
                          $(e.target).closest('.main-image').length > 0;
        
        // 如果点击了图片，不触发导航显示/隐藏
        if (isImageClick) {
            return;
        }
        
        // 将页面分为三部分，左右各1/5用于翻页，中间3/5用于显示/隐藏导航
        if (clickX < viewportWidth / 5) {
            // 点击左侧，翻到上一页
            if (currentPage > 1) {
                $('.flipbook').turn('previous');
            }
        } else if (clickX > viewportWidth * 4 / 5) {
            // 点击右侧，翻到下一页
            if (currentPage < totalPages) {
                $('.flipbook').turn('next');
            }
        } else {
            // 点击中间区域，显示/隐藏导航
            toggleNavigation();
        }
    });
}

// 显示/隐藏导航
function toggleNavigation() {
    var navigation = $('#navigation');
    var overlayMask = $('#overlayMask');
    
    if (navigation.hasClass('navigation-hidden')) {
        navigation.removeClass('navigation-hidden');
        overlayMask.show(); // 显示遮罩层
    } else {
        navigation.addClass('navigation-hidden');
        overlayMask.hide(); // 隐藏遮罩层
    }
}

// 更新导航状态
function updateNavigation() {
    var currentPage = $('.flipbook').turn('page');
    var totalPages = $('.flipbook').turn('pages');
    
    $('#prevBtn').prop('disabled', currentPage === 1);
    $('#nextBtn').prop('disabled', currentPage === totalPages);
}

// 绑定图片点击事件
function bindImageClickEvents() {
    const modal = $('#imageModal');
    const modalImg = $('#modalImage');
    const modalCaption = $('#modalCaption');
    const closeBtn = $('#closeModal');
    
    // 使用事件委托，确保动态添加的元素也能响应点击
    $(document).on('click', '.image-item img, .main-image img', function(e) {
        // 如果导航已显示，则忽略图片点击
        if (!$('#navigation').hasClass('navigation-hidden')) {
            return;
        }
        
        // 阻止事件冒泡，防止触发导航显示
        e.stopPropagation();
        
        modal.show();
        modalImg.attr('src', $(this).attr('src'));
        modalCaption.text($(this).attr('alt') || '工作记事照片');
        
        // 确保导航在图片放大时保持隐藏
        $('#navigation').addClass('navigation-hidden');
        $('#overlayMask').hide(); // 隐藏遮罩层
    });
    
    // 关闭模态框
    closeBtn.click(function(e) {
        // 阻止事件冒泡
        e.stopPropagation();
        modal.hide();
    });
    
    // 点击模态框背景关闭
    modal.click(function(e) {
        if (e.target === modal[0]) {
            modal.hide();
        }
    });
    
    // ESC键关闭模态框
    $(document).keydown(function(e) {
        if (e.keyCode === 27) { // ESC键
            modal.hide();
        }
    });
}

// 初始化事件绑定
$(document).ready(function() {
    // 绑定图片点击事件
    bindImageClickEvents();
    
    // 绑定导航按钮事件
    $('#prevBtn').on('click', function(e) {
        e.stopPropagation(); // 阻止事件冒泡
        $('.flipbook').turn('previous');
    });
    
    $('#nextBtn').on('click', function(e) {
        e.stopPropagation(); // 阻止事件冒泡
        $('.flipbook').turn('next');
    });
    
    // 绑定遮罩层点击事件 - 点击遮罩层只隐藏导航
    $('#overlayMask').on('click', function(e) {
        e.stopPropagation();
        $('#navigation').addClass('navigation-hidden');
        $(this).hide();
    });
});

// 键盘导航
$(document).keydown(function(e) {
    if (e.keyCode == 37) { // 左箭头
        $('.flipbook').turn('previous');
    } else if (e.keyCode == 39 || e.keyCode == 32) { // 右箭头或空格
        $('.flipbook').turn('next');
    }

});