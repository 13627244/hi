/* 澳門升學平台 - 主入口腳本 */

// 頁面導航函數
function showPage(pageId) {
    // 隱藏所有頁面
    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // 顯示目標頁面
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // 更新導航按鈕狀態
    document.querySelectorAll('.mep-nav-button').forEach(button => {
        button.classList.remove('active');
    });
    
    const navButton = document.getElementById('nav-' + pageId);
    if (navButton) {
        navButton.classList.add('active');
    }
    
    // 滾動到頂部
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // 觸發頁面特定初始化
    initializePage(pageId);
}

// 頁面初始化
function initializePage(pageId) {
    switch(pageId) {
        case 'dashboard':
            initializeDashboard();
            break;
        case 'simulator':
            initializeSimulator();
            break;
        case 'baosong':
            initializeBaosong();
            break;
    }
}

// 儀表板初始化
function initializeDashboard() {
    console.log('初始化儀表板');
    // 這裡可以添加倒數計時初始化
}

// 測評初始化
function initializeSimulator() {
    console.log('初始化智能測評');
    // 確保表單正確顯示
    toggleMode();
}

// 保送生頁面初始化
function initializeBaosong() {
    console.log('初始化保送生頁面');
}

// 測評模式切換
function toggleMode() {
    const modeSelect = document.getElementById('mode-select');
    if (!modeSelect) return;
    
    const mode = modeSelect.value;
    const quizForm = document.getElementById('quiz-form');
    const scoreForm = document.getElementById('score-form');
    const resultArea = document.getElementById('result-area');
    
    if (quizForm) quizForm.style.display = mode === 'quiz' ? 'block' : 'none';
    if (scoreForm) scoreForm.style.display = mode === 'score' ? 'block' : 'none';
    if (resultArea) resultArea.style.display = 'none';
}

// 運行問卷測評
function runQuiz() {
    const q1 = document.getElementById('q1')?.value || 'science';
    const q2 = document.getElementById('q2')?.value || 'logic';
    const rank = document.getElementById('q4')?.value || 'top30';
    
    let major = "", unis = [], strategy = "";
    
    if (q1 === 'science' || q2 === 'logic') {
        major = "理工科類 (計算機、電子工程、數據科學)";
        unis = rank <= 'top15' ? 
            ["清華大學", "北京大學", "上海交通大學", "澳門大學"] : 
            ["同濟大學", "華南理工大學", "澳門科技大學"];
        strategy = rank <= 'top15' ? 
            "排名優秀！主攻清北復交保送面試，準備奧賽級數理題。" : 
            "建議重點準備聯考/四校聯考，保送可嘗試中等 985 高校。";
    } else if (q1 === 'arts' || q2 === 'creative') {
        major = "人文社科類 (新聞、法律、中文、國際關係)";
        unis = rank <= 'top15' ? 
            ["北京大學", "復旦大學", "中國人民大學", "澳門大學"] : 
            ["廈門大學", "中山大學", "暨南大學"];
        strategy = rank <= 'top15' ? 
            "頂尖名校看重面試表達與社會洞察力，多練時事評論。" : 
            "發揮寫作特長，準備優秀 PS，聯考/四校聯考文科專業也不錯。";
    } else {
        major = "商業管理類 (金融、會計、工商管理)";
        unis = rank <= 'top15' ? 
            ["清華經管", "北大光華", "交大安泰", "澳門大學"] : 
            ["對外經貿", "澳門科技大學商學院"];
        strategy = "商科競爭大，建議參加商業競賽豐富履歷，考取語言證書加分。";
    }
    
    // 顯示結果
    displayResult(major, unis, strategy);
}

// 顯示結果
function displayResult(major, unis, strategy) {
    const majorEl = document.getElementById('res-major');
    const schoolsEl = document.getElementById('res-unis');
    const strategyEl = document.getElementById('res-strategy');
    const resultArea = document.getElementById('result-area');
    
    if (majorEl) majorEl.textContent = major;
    if (strategyEl) strategyEl.textContent = strategy;
    
    if (schoolsEl) {
        schoolsEl.innerHTML = '';
        unis.forEach(school => {
            const span = document.createElement('span');
            span.className = 'mep-tag';
            span.style.cssText = 'background:#e6f7ff;color:#1890ff;border-color:#91d5ff';
            span.textContent = school;
            schoolsEl.appendChild(span);
        });
    }
    
    if (resultArea) {
        resultArea.style.display = 'block';
        resultArea.scrollIntoView({ behavior: 'smooth' });
    }
}

// 主題切換
function setupTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;
    
    themeToggle.addEventListener('click', () => {
        const isDark = document.documentElement.classList.contains('dark');
        if (isDark) {
            document.documentElement.classList.remove('dark');
            themeToggle.querySelector('.material-symbols-outlined').textContent = 'dark_mode';
            localStorage.setItem('mep-theme', 'light');
        } else {
            document.documentElement.classList.add('dark');
            themeToggle.querySelector('.material-symbols-outlined').textContent = 'light_mode';
            localStorage.setItem('mep-theme', 'dark');
        }
    });
    
    // 檢查保存的主題
    const savedTheme = localStorage.getItem('mep-theme');
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
        themeToggle.querySelector('.material-symbols-outlined').textContent = 'light_mode';
    }
}

// 加載完成處理
document.addEventListener('DOMContentLoaded', () => {
    console.log('澳門升學平台加載完成');
    
    // 隱藏加載動畫
    const loading = document.getElementById('loading');
    if (loading) {
        setTimeout(() => {
            loading.style.opacity = '0';
            setTimeout(() => {
                loading.style.display = 'none';
            }, 300);
        }, 500);
    }
    
    // 設置主題切換
    setupTheme();
    
    // 綁定導航按鈕
    document.querySelectorAll('.mep-nav-button').forEach(button => {
        const pageId = button.id.replace('nav-', '');
        button.addEventListener('click', () => showPage(pageId));
    });
    
    // 綁定CTA按鈕
    document.querySelectorAll('button[data-page]').forEach(button => {
        const pageId = button.getAttribute('data-page');
        button.addEventListener('click', () => showPage(pageId));
    });
    
    // 初始化第一個頁面
    showPage('home');
});

// 全局導出
window.showPage = showPage;
window.toggleMode = toggleMode;
window.runQuiz = runQuiz;