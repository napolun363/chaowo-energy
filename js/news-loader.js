/**
 * 电池资讯动态加载器
 * 从 data/news-data.json 读取资讯数据并渲染到页面
 * 支持自动化定期更新 JSON 文件实现内容刷新
 */
(function () {
    'use strict';

    var NEWS_JSON_PATH = 'data/news-data.json';
    var CONTAINER_ID = 'news-container';
    var UPDATE_TIME_ID = 'news-update-time';

    /**
     * 格式化日期为友好显示
     */
    function formatDate(dateStr) {
        if (!dateStr) return '';
        var d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        var now = new Date();
        var diffMs = now - d;
        var diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return '今天';
        if (diffDays === 1) return '昨天';
        if (diffDays < 7) return diffDays + '天前';
        if (diffDays < 30) return Math.floor(diffDays / 7) + '周前';
        var m = d.getMonth() + 1;
        var day = d.getDate();
        return m + '月' + day + '日';
    }

    /**
     * 渲染新闻列表
     */
    function renderNews(data) {
        var container = document.getElementById(CONTAINER_ID);
        if (!container || !data || !data.categories) return;

        var html = '';
        data.categories.forEach(function (cat) {
            html += '<div class="news-item">';
            html += '<h3>' + cat.icon + ' ' + cat.title + '</h3>';
            html += '<ul>';
            cat.items.forEach(function (item) {
                var dateLabel = formatDate(item.date);
                var dateTag = dateLabel ? ' <span class="news-date">' + dateLabel + '</span>' : '';
                html += '<li><a href="' + item.url + '" target="_blank" rel="noopener">' + item.title + dateTag + '</a></li>';
            });
            html += '</ul>';
            html += '</div>';
        });
        container.innerHTML = html;

        // 显示更新时间
        if (data.lastUpdated) {
            var timeEl = document.getElementById(UPDATE_TIME_ID);
            if (timeEl) {
                timeEl.textContent = '资讯更新于 ' + data.lastUpdated;
            }
        }
    }

    /**
     * 加载 JSON 数据
     */
    function loadNews() {
        fetch(NEWS_JSON_PATH + '?t=' + Date.now())
            .then(function (res) {
                if (!res.ok) throw new Error('HTTP ' + res.status);
                return res.json();
            })
            .then(function (data) {
                renderNews(data);
            })
            .catch(function (err) {
                console.warn('[news-loader] 加载资讯数据失败:', err);
                // 加载失败时不做任何操作，保留容器空白
            });
    }

    // 页面加载后执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadNews);
    } else {
        loadNews();
    }
})();
