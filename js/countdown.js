/* 澳門升學平台 - 倒數計時系統 */

class MEPCountdown {
    constructor() {
        this.deadlines = {
            baosong: '2025-11-15',
            fourUni: '2025-12-20',
            liankao: '2026-03-15'
        };
        
        this.googleSheetsURL = 'https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv&gid=0';
        this.timers = {};
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.loadDeadlines();
            this.setupAutoRefresh();
        });
    }

    async loadDeadlines() {
        const statusEl = document.getElementById('data-status');
        
        try {
            // 嘗試從Google Sheets讀取
            const response = await fetch(this.googleSheetsURL);
            if (!response.ok) throw new Error('網絡錯誤');
            
            const csvText = await response.text();
            const dates = this.parseCSV(csvText);
            
            // 更新截止日期
            if (dates['保送截止']) this.deadlines.baosong = dates['保送截止'];
            if (dates['四校截止']) this.deadlines.fourUni = dates['四校截止'];
            if (dates['聯考截止']) this.deadlines.liankao = dates['聯考截止'];
            
            // 更新UI
            this.updateUIStatus('success', '✅ 實時同步中');
            console.log('✅ 日期已從雲端同步:', dates);
            
        } catch (error) {
            // 使用本地備用日期
            console.warn('⚠️ 無法讀取雲端日期，使用本地備用值:', error);
            this.updateUIStatus('warning', '⚠️ 離線模式');
        }
        
        // 啟動所有倒數計時
        this.startAllCountdowns();
    }

    parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        const result = {};
        
        lines.forEach(line => {
            const [key, value] = line.split(',').map(s => s.trim());
            if (key && value) result[key] = value;
        });
        
        return result;
    }

    updateUIStatus(type, message) {
        const sourceEl = document.getElementById('data-source');
        const statusEl = document.getElementById('data-status');
        const updateEl = document.getElementById('baosong-last-update');
        
        if (sourceEl) {
            sourceEl.textContent = type === 'success' ? 
                'Google Sheets (已同步)' : '本地備用配置';
        }
        
        if (statusEl) {
            statusEl.textContent = message;
            statusEl.className = 'mep-status ' + (type === 'success' ? 'live' : 'demo');
        }
        
        if (updateEl && type === 'success') {
            updateEl.textContent = new Date().toLocaleString('zh-HK');
        }
    }

    startAllCountdowns() {
        // 保送生截止
        this.startCountdown('timer-baosong', this.deadlines.baosong, {
            expiredText: '已截止',
            expiredColor: '#FF4D4F',
            warningDays: 30
        });
        
        // 四校聯考截止
        this.startCountdown('timer-4u', this.deadlines.fourUni, {
            expiredText: '已截止',
            expiredColor: '#FF4D4F',
            warningDays: 30
        });
        
        // 全國聯考截止
        this.startCountdown('timer-liankao', this.deadlines.liankao, {
            expiredText: '已截止',
            expiredColor: '#FF4D4F',
            warningDays: 60
        });
    }

    startCountdown(elementId, targetDateStr, options = {}) {
        const el = document.getElementById(elementId);
        if (!el) return;
        
        const target = new Date(targetDateStr).getTime();
        const now = new Date().getTime();
        const diff = target - now;
        
        // 如果已經過期
        if (diff <= 0) {
            el.innerHTML = options.expiredText || '已截止';
            el.style.color = options.expiredColor || '#FF4D4F';
            return;
        }
        
        // 計算初始時間
        this.updateCountdownDisplay(el, diff, options);
        
        // 設置定時器
        const timerId = setInterval(() => {
            const now = new Date().getTime();
            const diff = target - now;
            
            if (diff <= 0) {
                el.innerHTML = options.expiredText || '已截止';
                el.style.color = options.expiredColor || '#FF4D4F';
                clearInterval(timerId);
                delete this.timers[elementId];
                return;
            }
            
            this.updateCountdownDisplay(el, diff, options);
        }, 1000);
        
        this.timers[elementId] = timerId;
    }

    updateCountdownDisplay(element, diff, options) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        // 警告檢查
        if (options.warningDays && days <= options.warningDays) {
            element.style.color = '#FAAD14';
            element.style.fontWeight = 'bold';
        } else {
            element.style.color = '';
            element.style.fontWeight = '';
        }
        
        // 顯示格式
        if (days > 30) {
            element.innerHTML = `${days}天`;
        } else if (days > 0) {
            element.innerHTML = `${days}天 ${hours}小時`;
        } else if (hours > 0) {
            element.innerHTML = `${hours}小時 ${minutes}分鐘`;
        } else {
            element.innerHTML = `${minutes}分鐘 ${seconds}秒`;
        }
    }

    setupAutoRefresh() {
        // 每小時檢查一次日期更新
        setInterval(() => {
            this.loadDeadlines();
        }, 60 * 60 * 1000); // 每小時
        
        // 每天凌晨3點強制刷新
        const now = new Date();
        const nextRefresh = new Date(now);
        nextRefresh.setDate(nextRefresh.getDate() + 1);
        nextRefresh.setHours(3, 0, 0, 0);
        
        const timeUntilRefresh = nextRefresh.getTime() - now.getTime();
        
        setTimeout(() => {
            this.loadDeadlines();
            this.setupAutoRefresh(); // 重新設置定時器
        }, timeUntilRefresh);
    }

    calculateTimeRemaining(targetDate) {
        const now = new Date();
        const target = new Date(targetDate);
        const diff = target.getTime() - now.getTime();
        
        if (diff <= 0) {
            return {
                expired: true,
                days: 0,
                hours: 0,
                minutes: 0,
                seconds: 0,
                totalSeconds: 0
            };
        }
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        return {
            expired: false,
            days,
            hours,
            minutes,
            seconds,
            totalSeconds: Math.floor(diff / 1000)
        };
    }

    formatTimeRemaining(timeObj, format = 'full') {
        if (timeObj.expired) {
            return '已截止';
        }
        
        switch (format) {
            case 'short':
                return `${timeObj.days}天`;
            case 'medium':
                return `${timeObj.days}天 ${timeObj.hours}小時`;
            case 'full':
            default:
                return `${timeObj.days}天 ${timeObj.hours}小時 ${timeObj.minutes}分鐘 ${timeObj.seconds}秒`;
        }
    }

    getDeadlineInfo(deadlineType) {
        const deadlines = {
            baosong: {
                name: '保送生報名截止',
                date: this.deadlines.baosong,
                description: '內地高校保送生計劃報名截止日期',
                officialLink: 'https://www.dsedj.gov.mo/webdsejspace/internet/Inter_main_page.jsp?id=4739'
            },
            fourUni: {
                name: '四校聯考報名截止',
                date: this.deadlines.fourUni,
                description: '澳門四校聯合入學考試報名截止日期',
                officialLink: 'https://www.4uaexams.edu.mo'
            },
            liankao: {
                name: '全國聯考報名截止',
                date: this.deadlines.liankao,
                description: '全國聯招考試（港澳台僑）報名截止日期',
                officialLink: 'https://www.dsedj.gov.mo/webdsejspace/internet/Inter_main_page.jsp?id=8760'
            }
        };
        
        return deadlines[deadlineType] || null;
    }

    // 停止所有計時器
    stopAllTimers() {
        Object.values(this.timers).forEach(timerId => {
            clearInterval(timerId);
        });
        this.timers = {};
    }

    // 更新截止日期
    updateDeadline(type, newDate) {
        if (this.deadlines[type]) {
            this.deadlines[type] = newDate;
            
            // 停止舊計時器
            const timerId = `timer-${type}`;
            if (this.timers[timerId]) {
                clearInterval(this.timers[timerId]);
                delete this.timers[timerId];
            }
            
            // 啟動新計時器
            this.startCountdown(timerId, newDate);
            
            return true;
        }
        return false;
    }
}

// 導出倒數計時實例
window.MEPCountdown = MEPCountdown;