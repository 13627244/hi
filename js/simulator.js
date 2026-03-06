/* 澳門升學平台 - 智能測評系統 */

class MEPSimulator {
    constructor() {
        this.quizData = {
            majors: {
                science: {
                    name: "理工科類",
                    description: "計算機、電子工程、數據科學、機械工程等",
                    topSchools: ["清華大學", "北京大學", "上海交通大學", "浙江大學"],
                    midSchools: ["同濟大學", "華南理工大學", "澳門大學", "澳門科技大學"],
                    strategy: "排名優秀！主攻清北復交保送面試，準備奧賽級數理題。"
                },
                arts: {
                    name: "人文社科類",
                    description: "新聞、法律、中文、國際關係、歷史等",
                    topSchools: ["北京大學", "復旦大學", "中國人民大學", "南京大學"],
                    midSchools: ["廈門大學", "中山大學", "暨南大學", "澳門大學"],
                    strategy: "頂尖名校看重面試表達與社會洞察力，多練時事評論。"
                },
                business: {
                    name: "商業管理類",
                    description: "金融、會計、工商管理、市場營銷等",
                    topSchools: ["清華經管", "北大光華", "交大安泰", "復旦經院"],
                    midSchools: ["對外經貿", "上海財經", "澳門大學", "澳門科技大學商學院"],
                    strategy: "商科競爭大，建議參加商業競賽豐富履歷，考取語言證書加分。"
                },
                creative: {
                    name: "藝術創意類",
                    description: "設計、建築、電影、音樂、美術等",
                    topSchools: ["中央美術學院", "中國傳媒大學", "同濟大學", "清華美院"],
                    midSchools: ["廣州美術學院", "澳門理工", "澳門旅遊大學", "澳門科技大學"],
                    strategy: "作品集是關鍵，提前準備高質量作品，參加相關競賽。"
                }
            },
            
            pathways: {
                baosong: {
                    name: "保送生計劃",
                    description: "憑校內排名 + 面試，免筆試進入內地名校",
                    requirements: "校內排名前20%，綜合素質優秀",
                    timeline: "每年11月-12月報名"
                },
                liankao: {
                    name: "全國聯考",
                    description: "針對澳門學生的獨立試卷，競爭相對較小",
                    requirements: "高中畢業，通過聯考分數線",
                    timeline: "每年3月-4月報名"
                },
                fouru: {
                    name: "四校聯考",
                    description: "澳門大學、理工、旅遊、科大聯合考試",
                    requirements: "澳門居民，高中畢業",
                    timeline: "每年11月-12月報名"
                }
            }
        };
        
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.bindSimulatorEvents();
            this.setupFormValidation();
        });
    }

    bindSimulatorEvents() {
        // 模式切換
        const modeSelect = document.getElementById('mode-select');
        if (modeSelect) {
            modeSelect.addEventListener('change', (e) => this.toggleMode(e.target.value));
        }

        // 問卷提交
        const quizButton = document.getElementById('quiz-submit');
        if (quizButton) {
            quizButton.addEventListener('click', () => this.runQuiz());
        }

        // 分數模擬提交
        const scoreButton = document.getElementById('score-submit');
        if (scoreButton) {
            scoreButton.addEventListener('click', () => this.runScoreSim());
        }
    }

    setupFormValidation() {
        // 表單驗證邏輯
        const forms = document.querySelectorAll('.mep-simulator-form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                if (this.validateForm(form)) {
                    this.processForm(form);
                }
            });
        });
    }

    toggleMode(mode) {
        const quizForm = document.getElementById('quiz-form');
        const scoreForm = document.getElementById('score-form');
        const resultArea = document.getElementById('result-area');

        if (quizForm) quizForm.style.display = mode === 'quiz' ? 'block' : 'none';
        if (scoreForm) scoreForm.style.display = mode === 'score' ? 'block' : 'none';
        if (resultArea) resultArea.style.display = 'none';
    }

    runQuiz() {
        const q1 = document.getElementById('q1')?.value || 'science';
        const q2 = document.getElementById('q2')?.value || 'logic';
        const rank = document.getElementById('q4')?.value || 'top30';

        // 確定專業方向
        let majorType = 'science';
        if (q1 === 'arts' || q2 === 'creative') majorType = 'arts';
        else if (q1 === 'business') majorType = 'business';
        else if (q1 === 'art_design') majorType = 'creative';

        const major = this.quizData.majors[majorType];
        
        // 根據排名選擇學校
        const isTopRank = rank === 'top5' || rank === 'top15';
        const schools = isTopRank ? major.topSchools : major.midSchools;

        // 生成策略建議
        let strategy = major.strategy;
        if (rank === 'top5') {
            strategy = "排名頂尖！全力衝刺清北復交，準備高難度面試題目。";
        } else if (rank === 'top15') {
            strategy = "排名優秀，鎖定華東五校及中堅985，廣撒網申請3-5所。";
        } else if (rank === 'top30') {
            strategy = "穩紮穩打，重點準備聯考/四校聯考，保送可嘗試中等985高校。";
        } else {
            strategy = "建議保守策略，重點考慮暨大或轉向四校聯考，加強基礎學習。";
        }

        // 顯示結果
        this.displayResult({
            major: `${major.name} (${major.description})`,
            schools: schools,
            strategy: strategy,
            pathway: isTopRank ? '保送生計劃' : '聯考/四校聯考'
        });
    }

    runScoreSim() {
        const path = document.getElementById('s-path')?.value || 'baosong';
        const rank = parseInt(document.getElementById('s-rank')?.value) || 50;

        const pathway = this.quizData.pathways[path];
        let schools = [];
        let strategy = "";

        if (path === 'baosong') {
            if (rank <= 10) {
                schools = ["清華大學", "北京大學", "復旦大學", "上海交通大學"];
                strategy = "排名頂尖！全力準備面試，展現綜合素質。";
            } else if (rank <= 25) {
                schools = ["浙江大學", "南京大學", "同濟大學", "中山大學"];
                strategy = "排名優秀，鎖定華東五校及中堅985，廣撒網申請3-5所。";
            } else {
                schools = ["暨南大學", "廈門大學", "澳門大學", "華南理工大學"];
                strategy = "建議保守策略，重點考慮暨大或轉向四校聯考。";
            }
        } else if (path === '4u') {
            schools = ["澳門大學", "澳門理工大學", "澳門旅遊大學", "澳門科技大學"];
            strategy = "紮實基礎，確保中英文不失分，可考慮特色專業。";
        } else {
            schools = ["中山大學", "暨南大學", "華南師範大學", "廣東外語外貿大學"];
            strategy = "穩紮穩打確保過線，暨南大學是熱門選擇。";
        }

        this.displayResult({
            major: `根據${pathway.name}推薦`,
            schools: schools,
            strategy: strategy,
            pathway: pathway.name
        });
    }

    displayResult(result) {
        const majorEl = document.getElementById('res-major');
        const schoolsEl = document.getElementById('res-unis');
        const strategyEl = document.getElementById('res-strategy');
        const resultArea = document.getElementById('result-area');

        if (majorEl) majorEl.textContent = result.major;
        if (strategyEl) strategyEl.textContent = result.strategy;

        if (schoolsEl) {
            schoolsEl.innerHTML = '';
            result.schools.forEach(school => {
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

        // 記錄分析結果
        this.logAnalysis(result);
    }

    validateForm(form) {
        const required = form.querySelectorAll('[required]');
        let isValid = true;

        required.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                this.showError(input, '此欄位為必填');
            } else {
                this.clearError(input);
            }
        });

        return isValid;
    }

    showError(input, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'mep-error';
        errorDiv.textContent = message;
        errorDiv.style.cssText = 'color:#ff4d4f;font-size:0.8rem;margin-top:4px;';

        const parent = input.parentElement;
        const existingError = parent.querySelector('.mep-error');
        if (existingError) existingError.remove();

        parent.appendChild(errorDiv);
        input.style.borderColor = '#ff4d4f';
    }

    clearError(input) {
        const parent = input.parentElement;
        const error = parent.querySelector('.mep-error');
        if (error) error.remove();
        input.style.borderColor = '';
    }

    processForm(form) {
        // 處理表單提交
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        console.log('表單數據:', data);
        // 這裡可以添加API調用或其他處理邏輯
    }

    logAnalysis(result) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            result: result,
            userAgent: navigator.userAgent
        };

        // 這裡可以添加日誌記錄邏輯
        console.log('測評分析結果:', logEntry);
    }

    // 獲取專業建議
    getMajorRecommendation(answers) {
        // 根據答案計算最適合的專業
        const scores = {
            science: 0,
            arts: 0,
            business: 0,
            creative: 0
        };

        // 計算分數邏輯
        if (answers.q1 === 'science') scores.science += 3;
        if (answers.q2 === 'logic') scores.science += 2;
        if (answers.q1 === 'arts') scores.arts += 3;
        if (answers.q2 === 'creative') scores.creative += 2;
        if (answers.q1 === 'business') scores.business += 3;
        if (answers.q2 === 'people') scores.business += 2;

        // 找出最高分
        let maxScore = 0;
        let recommendedMajor = 'science';
        
        for (const [major, score] of Object.entries(scores)) {
            if (score > maxScore) {
                maxScore = score;
                recommendedMajor = major;
            }
        }

        return this.quizData.majors[recommendedMajor];
    }
}

// 導出測評實例
window.MEPSimulator = MEPSimulator;