/* 澳門升學平台 - 頁面導航系統 */

class MEPNavigation {
    constructor() {
        this.currentPage = 'home';
        this.pages = ['home', 'intro', 'dashboard', 'baosong', 'four-uni', 'simulator'];
        this.init();
    }

    init() {
        // 綁定導航按鈕事件
        document.addEventListener('DOMContentLoaded', () => {
            this.bindNavigationEvents();
            this.setupSmoothTransitions();
            this.updateActiveNav();
            
            // 初始化頁面
            this.showPage(this.currentPage);
        });
    }

    bindNavigationEvents() {
        // 綁定主導航
        this.pages.forEach(page => {
            const button = document.getElementById(`nav-${page}`);
            if (button) {
                button.addEventListener('click', () => this.showPage(page));
            }
        });

        // 綁定CTA按鈕
        const ctaButtons = document.querySelectorAll('[data-page]');
        ctaButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const page = e.target.getAttribute('data-page');
                if (page) this.showPage(page);
            });
        });
    }

    setupSmoothTransitions() {
        // 添加頁面切換動畫
        const style = document.createElement('style');
        style.textContent = `
            .page-transition {
                opacity: 0;
                transform: translateY(20px);
                transition: opacity 0.4s ease, transform 0.4s ease;
            }
            
            .page-transition.active {
                opacity: 1;
                transform: translateY(0);
            }
        `;
        document.head.appendChild(style);
    }

    showPage(pageId) {
        if (!this.pages.includes(pageId)) {
            console.warn(`頁面 ${pageId} 不存在`);
            return;
        }

        // 隱藏所有頁面
        this.pages.forEach(p => {
            const pageElement = document.getElementById(p);
            if (pageElement) {
                pageElement.classList.remove('active');
                pageElement.classList.remove('page-transition', 'active');
            }
        });

        // 顯示目標頁面
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('page-transition');
            setTimeout(() => {
                targetPage.classList.add('active');
            }, 10);
        }

        // 更新導航狀態
        this.currentPage = pageId;
        this.updateActiveNav();

        // 滾動到頂部
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // 觸發頁面切換事件
        this.dispatchPageChange(pageId);
    }

    updateActiveNav() {
        // 更新導航按鈕狀態
        this.pages.forEach(page => {
            const button = document.getElementById(`nav-${page}`);
            if (button) {
                button.classList.toggle('active', page === this.currentPage);
            }
        });
    }

    dispatchPageChange(pageId) {
        const event = new CustomEvent('mep-page-change', {
            detail: { page: pageId, timestamp: Date.now() }
        });
        document.dispatchEvent(event);
    }

    // 獲取當前頁面
    getCurrentPage() {
        return this.currentPage;
    }

    // 檢查頁面是否存在
    pageExists(pageId) {
        return this.pages.includes(pageId);
    }

    // 添加新頁面
    addPage(pageId, elementId) {
        if (!this.pages.includes(pageId)) {
            this.pages.push(pageId);
            
            // 創建頁面元素（如果不存在）
            if (!document.getElementById(elementId || pageId)) {
                const pageElement = document.createElement('div');
                pageElement.id = elementId || pageId;
                pageElement.className = 'page-section';
                document.querySelector('main').appendChild(pageElement);
            }
            
            // 重新綁定事件
            this.bindNavigationEvents();
        }
    }
}

// 導出導航實例
window.MEPNavigation = MEPNavigation;