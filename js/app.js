/* 澳門升學平台 - 主應用程序 */

class MEPApp {
    constructor() {
        this.navigation = null;
        this.simulator = null;
        this.countdown = null;
        this.currentTheme = 'light';
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeComponents();
            this.setupEventListeners();
            this.setupTheme();
            this.setupAnalytics();
            this.showWelcomeMessage();
        });
    }

    initializeComponents() {
        // 初始化導航系統
        this.navigation = new MEPNavigation();
        
        // 初始化智能測評
        this.simulator = new MEPSimulator();
        
        // 初始化倒數計時
        this.countdown = new MEPCountdown();
        
        console.log('✅ 澳門升學平台應用程序已初始化');
    }

    setupEventListeners() {
        // 主題切換
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // 頁面切換事件監聽
        document.addEventListener('mep-page-change', (e) => {
            this.handlePageChange(e.detail.page);
        });

        // 窗口大小變化
        window.addEventListener('resize', () => this.handleResize());

        // 鍵盤快捷鍵
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }

    setupTheme() {
        // 檢查本地存儲的主題設置
        const savedTheme = localStorage.getItem('mep-theme');
        if (savedTheme) {
            this.currentTheme = savedTheme;
            this.applyTheme(savedTheme);
        } else {
            // 檢查系統主題偏好
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.currentTheme = prefersDark ? 'dark' : 'light';
            this.applyTheme(this.currentTheme);
        }
    }

    applyTheme(theme) {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        localStorage.setItem('mep-theme', theme);
        
        // 更新主題切換按鈕
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('.material-symbols-outlined');
            if (icon) {
                icon.textContent = theme === 'dark' ? 'light_mode' : 'dark_mode';
            }
            themeToggle.setAttribute('aria-label', 
                theme === 'dark' ? '切換到淺色模式' : '切換到深色模式'
            );
        }
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(this.currentTheme);
        
        // 發送主題切換事件
        const event = new CustomEvent('mep-theme-change', {
            detail: { theme: this.currentTheme }
        });
        document.dispatchEvent(event);
    }

    handlePageChange(pageId) {
        console.log(`📄 頁面切換到: ${pageId}`);
        
        // 根據頁面執行特定操作
        switch (pageId) {
            case 'simulator':
                this.initializeSimulatorPage();
                break;
            case 'baosong':
                this.initializeBaosongPage();
                break;
            case 'four-uni':
                this.initializeFourUniPage();
                break;
            case 'dashboard':
                this.initializeDashboardPage();
                break;
        }
        
        // 更新頁面標題
        this.updatePageTitle(pageId);
        
        // 發送頁面瀏覽事件（用於分析）
        this.trackPageView(pageId);
    }

    initializeSimulatorPage() {
        // 確保測評表單正確初始化
        setTimeout(() => {
            const modeSelect = document.getElementById('mode-select');
            if (modeSelect && this.simulator) {
                this.simulator.toggleMode(modeSelect.value);
            }
        }, 100);
    }

    initializeBaosongPage() {
        // 保送生頁面特定初始化
        console.log('初始化保送生頁面');
    }

    initializeFourUniPage() {
        // 四校聯考頁面特定初始化
        console.log('初始化四校聯考頁面');
    }

    initializeDashboardPage() {
        // 儀表板頁面特定初始化
        console.log('初始化儀表板頁面');
        
        // 刷新倒數計時
        if (this.countdown) {
            setTimeout(() => {
                this.countdown.loadDeadlines();
            }, 500);
        }
    }

    updatePageTitle(pageId) {
        const pageTitles = {
            'home': '首頁 - 澳門升學平台',
            'intro': '平台介紹 - 澳門升學平台',
            'dashboard': '儀表板 - 澳門升學平台',
            'baosong': '保送生計劃 - 澳門升學平台',
            'four-uni': '四校聯考 - 澳門升學平台',
            'simulator': '智能測評 - 澳門升學平台'
        };
        
        const title = pageTitles[pageId] || '澳門升學平台';
        document.title = title;
    }

    handleResize() {
        // 響應式設計處理
        const width = window.innerWidth;
        
        // 根據屏幕大小調整佈局
        if (width < 768) {
            document.body.classList.add('mobile-view');
            document.body.classList.remove('desktop-view');
        } else {
            document.body.classList.add('desktop-view');
            document.body.classList.remove('mobile-view');
        }
    }

    handleKeyboardShortcuts(e) {
        // 鍵盤快捷鍵
        if (e.ctrlKey || e.metaKey) {
            switch (e.key.toLowerCase()) {
                case '1':
                    e.preventDefault();
                    this.navigation.showPage('home');
                    break;
                case '2':
                    e.preventDefault();
                    this.navigation.showPage('dashboard');
                    break;
                case '3':
                    e.preventDefault();
                    this.navigation.showPage('simulator');
                    break;
                case 'd':
                    e.preventDefault();
                    this.toggleTheme();
                    break;
            }
        }
        
        // Escape鍵返回首頁
        if (e.key === 'Escape' && this.navigation.getCurrentPage() !== 'home') {
            this.navigation.showPage('home');
        }
    }

    setupAnalytics() {
        // 簡單的分析追蹤
        window.addEventListener('beforeunload', () => {
            const sessionData = {
                startTime: performance.timing.navigationStart,
                endTime: Date.now(),
                pagesVisited: this.getVisitedPages(),
                theme: this.currentTheme
            };
            
            localStorage.setItem('mep-last-session', JSON.stringify(sessionData));
        });
    }

    getVisitedPages() {
        // 獲取訪問過的頁面（簡化實現）
        return [this.navigation?.getCurrentPage() || 'home'];
    }

    showWelcomeMessage() {
        // 顯示歡迎消息（僅首次訪問）
        const hasVisited = localStorage.getItem('mep-has-visited');
        
        if (!hasVisited) {
            setTimeout(() => {
                console.log('🎓 歡迎使用澳門升學平台！');
                console.log('💡 提示：使用 Ctrl+1/2/3 快速切換頁面');
                
                // 可以顯示一個歡迎提示
                this.showNotification('歡迎使用澳門升學平台！', 'info');
                
                localStorage.setItem('mep-has-visited', 'true');
            }, 1000);
        }
    }

    showNotification(message, type = 'info') {
        // 創建通知元素
        const notification = document.createElement('div');
        notification.className = `mep-notification mep-notification-${type}`;
        notification.innerHTML = `
            <span class="material-symbols-outlined">
                ${type === 'info' ? 'info' : type === 'success' ? 'check_circle' : 'warning'}
            </span>
            <span>${message}</span>
            <button class="mep-notification-close">
                <span class="material-symbols-outlined">close</span>
            </button>
        `;
        
        // 添加到頁面
        document.body.appendChild(notification);
        
        // 添加樣式
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .mep-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: white;
                    border-radius: 8px;
                    padding: 16px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    z-index: 10000;
                    animation: slideIn 0.3s ease;
                    max-width: 400px;
                }
                
                .dark .mep-notification {
                    background: #1a2230;
                    color: white;
                }
                
                .mep-notification-info {
                    border-left: 4px solid #1890FF;
                }
                
                .mep-notification-success {
                    border-left: 4px solid #52C41A;
                }
                
                .mep-notification-warning {
                    border-left: 4px solid #FAAD14;
                }
                
                .mep-notification-close {
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    padding: 4px;
                    margin-left: auto;
                }
                
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
        
        // 關閉按鈕事件
        const closeBtn = notification.querySelector('.mep-notification-close');
        closeBtn.addEventListener('click', () => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        });
        
        // 自動關閉
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    // 公共方法
    navigateTo(pageId) {
        if (this.navigation) {
            this.navigation.showPage(pageId);
        }
    }

    getCurrentPage() {
        return this.navigation ? this.navigation.getCurrentPage() : 'home';
    }

    runSimulation(data) {
        if (this.simulator) {
            return this.simulator.runQuiz(data);
        }
        return null;
    }

    getDeadlineInfo(type) {
        if (this.countdown) {
            return this.countdown.getDeadlineInfo(type);
        }
        return null;
    }

    trackPageView(pageId) {
        // 頁面瀏覽追蹤（可以擴展到Google Analytics等）
        const analyticsData = {
            page: pageId,
            timestamp: new Date().toISOString(),
            referrer: document.referrer,
            userAgent: navigator.userAgent.substring(0, 100)
        };
        
        console.log('📊 頁面瀏覽:', analyticsData);
        
        // 這裡可以添加實際的分析代碼
        // 例如: gtag('config', 'GA_MEASUREMENT_ID', { page_path: pageId });
    }
}

// 初始化應用程序
window.addEventListener('DOMContentLoaded', () => {
    window.MEPApp = new MEPApp();
    
    // 全局快捷訪問
    window.mep = {
        app: window.MEPApp,
        navigate: (page) => window.MEPApp.navigateTo(page),
        theme: () => window.MEPApp.toggleTheme(),
        simulator: window.MEPSimulator ? new MEPSimulator() : null
    };
    
    console.log('🚀 澳門升學平台已準備就緒');
});