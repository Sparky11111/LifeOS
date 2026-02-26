// Dziennik Życia - Advanced JavaScript Application
class LifeJournal {
    constructor() {
        this.entries = [];
        this.goals = [];
        this.currentEntry = null;
        this.selectedMood = null;
        this.tags = [];
        this.gratitudeList = [];
        this.charts = {};
        this.eventListenersSetup = false; // Flag to prevent multiple setups
        
        // Gamification system
        this.userData = {
            level: 1,
            xp: 0,
            points: 0,
            streak: 0,
            badges: [],
            achievements: [],
            completedChallenges: [],
            lastActiveDate: null
        };
        
        this.achievements = this.initializeAchievements();
        this.badges = this.initializeBadges();
        this.challenges = this.initializeChallenges();
        
        // Habits system
        this.habits = [];
        this.habitTemplates = [
            { id: 'exercise', name: 'Ćwiczenia', icon: '💪', color: '#ff6b6b' },
            { id: 'meditation', name: 'Medytacja', icon: '🧘', color: '#4ecdc4' },
            { id: 'reading', name: 'Czytanie', icon: '📚', color: '#45b7d1' },
            { id: 'water', name: 'Picie wody', icon: '💧', color: '#96ceb4' },
            { id: 'sleep', name: 'Sen 8h+', icon: '😴', color: '#9b59b6' },
            { id: 'journal', name: 'Pisanie dziennika', icon: '📝', color: '#f39c12' }
        ];
        
        this.initializeApp();
    }

    initializeApp() {
        this.loadData();
        this.updateCurrentDate();
        this.updateStatistics();
        
        // Restore last visited page or default to 'today'
        const savedPage = localStorage.getItem('journalCurrentPage') || 'today';
        this.switchPage(savedPage);
        
        this.initializeCharts();
        
        // Setup event listeners after all elements are ready
        this.setupEventListeners();
    }

    // Data Management
    loadData() {
        const savedEntries = localStorage.getItem('journalEntries');
        const savedGoals = localStorage.getItem('journalGoals');
        const savedUserData = localStorage.getItem('journalUserData');
        
        if (savedEntries) {
            this.entries = JSON.parse(savedEntries);
        }
        
        if (savedGoals) {
            this.goals = JSON.parse(savedGoals);
        }
        
        if (savedUserData) {
            this.userData = JSON.parse(savedUserData);
        }
        
        const savedHabits = localStorage.getItem('journalHabits');
        if (savedHabits) {
            this.habits = JSON.parse(savedHabits);
        }
        
        // Load today's entry if exists
        const today = new Date().toISOString().split('T')[0];
        this.currentEntry = this.entries.find(entry => entry.date === today) || null;
        
        if (this.currentEntry) {
            this.loadTodaysEntry();
        }
        
        // Check streak
        this.updateStreak();
    }

    saveData() {
        localStorage.setItem('journalEntries', JSON.stringify(this.entries));
        localStorage.setItem('journalGoals', JSON.stringify(this.goals));
        localStorage.setItem('journalUserData', JSON.stringify(this.userData));
        localStorage.setItem('journalHabits', JSON.stringify(this.habits));
    }

    // Event Listeners
    setupEventListeners() {
        // Prevent multiple event listener setup
        if (this.eventListenersSetup) {
            return;
        }
        this.eventListenersSetup = true;
        
        console.log('Setting up event listeners...');
        
        // Navigation
        const navItems = document.querySelectorAll('.nav-item');
        if (navItems.length > 0) {
            console.log(`Found ${navItems.length} navigation items`);
            navItems.forEach(item => {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    const navItem = e.currentTarget;
                    console.log('Navigation clicked:', navItem.dataset.page);
                    this.switchPage(navItem.dataset.page);
                });
            });
        } else {
            console.error('No navigation items found');
        }

        // Keyboard navigation with Alt+number keys
        document.addEventListener('keydown', (e) => {
            if (e.altKey && e.key >= '1' && e.key <= '9') {
                e.preventDefault();
                const navItems = document.querySelectorAll('.nav-item');
                const index = parseInt(e.key) - 1;
                if (navItems[index]) {
                    this.switchPage(navItems[index].dataset.page);
                }
            }
            
            // Alt+0 for last tab
            if (e.altKey && e.key === '0') {
                e.preventDefault();
                const navItems = document.querySelectorAll('.nav-item');
                if (navItems.length > 0) {
                    this.switchPage(navItems[navItems.length - 1].dataset.page);
                }
            }
        });

        // Mood Selection
        const moodBtns = document.querySelectorAll('.mood-btn');
        if (moodBtns.length > 0) {
            console.log(`Found ${moodBtns.length} mood buttons`);
            moodBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const mood = parseInt(e.target.dataset.mood);
                    console.log('Mood selected:', mood);
                    this.selectMood(mood);
                });
            });
        } else {
            console.error('No mood buttons found');
        }

        // Tags
        const tagInput = document.getElementById('tagInput');
        if (tagInput) {
            console.log('Tag input found');
            tagInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    console.log('Tag added:', e.target.value.trim());
                    this.addTag(e.target.value.trim());
                    e.target.value = '';
                }
            });
        } else {
            console.error('Tag input not found');
        }

        // Goals
        const addGoalBtn = document.getElementById('addGoalBtn');
        const goalInput = document.getElementById('goalInput');
        if (addGoalBtn) {
            console.log('Add goal button found');
            addGoalBtn.addEventListener('click', () => {
                console.log('Add goal button clicked');
                this.addGoal();
            });
        } else {
            console.error('Add goal button not found');
        }
        if (goalInput) {
            console.log('Goal input found');
            goalInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    console.log('Enter key pressed in goal input');
                    this.addGoal();
                }
            });
        } else {
            console.error('Goal input not found');
        }

        // Gratitude
        const addGratitudeBtn = document.getElementById('addGratitudeBtn');
        const gratitudeInput = document.getElementById('gratitudeInput');
        if (addGratitudeBtn) {
            console.log('Add gratitude button found');
            addGratitudeBtn.addEventListener('click', () => {
                console.log('Add gratitude button clicked');
                this.addGratitude();
            });
        } else {
            console.error('Add gratitude button not found');
        }
        if (gratitudeInput) {
            console.log('Gratitude input found');
            gratitudeInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    console.log('Enter key pressed in gratitude input');
                    this.addGratitude();
                }
            });
        } else {
            console.error('Gratitude input not found');
        }

        // Save Day
        const saveDayBtn = document.getElementById('saveDayBtn');
        if (saveDayBtn) {
            console.log('Save day button found');
            saveDayBtn.addEventListener('click', () => {
                console.log('Save day button clicked');
                this.saveDay();
            });
        } else {
            console.error('Save day button not found');
        }

        // History Filters
        const monthFilter = document.getElementById('monthFilter');
        const moodFilter = document.getElementById('moodFilter');
        if (monthFilter) {
            monthFilter.addEventListener('change', () => this.renderHistory());
        }
        if (moodFilter) {
            moodFilter.addEventListener('change', () => this.renderHistory());
        }

        // Modal
        const closeBtn = document.querySelector('.close');
        if (closeBtn) {
            console.log('Modal close button found');
            closeBtn.addEventListener('click', () => {
                console.log('Modal close button clicked');
                this.closeModal();
            });
        } else {
            console.error('Modal close button not found');
        }
        
        // Level up modal close button
        const levelUpCloseBtn = document.querySelector('.level-up-content .btn-primary');
        if (levelUpCloseBtn) {
            levelUpCloseBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Level up modal close clicked');
                this.closeLevelUpModal();
            });
        } else {
            console.error('Level up modal close button not found');
        }
        
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal();
            }
        });
        
        // Notification close button
        const notificationClose = document.querySelector('.notification-close');
        if (notificationClose) {
            console.log('Notification close button found');
            notificationClose.addEventListener('click', () => {
                console.log('Notification close button clicked');
                this.hideNotification();
            });
        } else {
            console.error('Notification close button not found');
        }
        
        // Heatmap year selector
        document.addEventListener('change', (e) => {
            if (e.target.id === 'heatmapYear') {
                this.renderHeatmap();
            }
        });
        
        // Productivity period selector
        document.addEventListener('change', (e) => {
            if (e.target.id === 'productivityPeriod') {
                this.renderProductivityMood();
            }
        });
        
        // Search functionality
        const searchInput = document.getElementById('globalSearch');
        const searchBtn = document.getElementById('searchBtn');
        const searchResults = document.getElementById('searchResults');
        
        if (searchInput && searchBtn && searchResults) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
            searchInput.addEventListener('focus', (e) => this.handleSearch(e.target.value));
            searchBtn.addEventListener('click', () => this.handleSearch(searchInput.value));
            
            // Close search results when clicking outside
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.header-search')) {
                    searchResults.classList.remove('show');
                }
            });
            
            // Keyboard shortcut for search (Ctrl+K or Ctrl+/)
            document.addEventListener('keydown', (e) => {
                if ((e.ctrlKey && (e.key === 'k' || e.key === '/')) || (e.metaKey && (e.key === 'k' || e.key === '/'))) {
                    e.preventDefault();
                    searchInput.focus();
                }
            });
        }
    }

    // Navigation
    switchPage(pageName) {
        if (!pageName) {
            console.error('No page name provided');
            return;
        }

        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeNavItem = document.querySelector(`[data-page="${pageName}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        } else {
            console.error(`Navigation item not found for page: ${pageName}`);
            return;
        }

        // Update pages with smooth transition
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        const targetPage = document.getElementById(`${pageName}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
        } else {
            console.error(`Page not found: ${pageName}-page`);
            return;
        }

        // Render page content only if the method exists
        if (this.renderCurrentPage) {
            this.renderCurrentPage();
        }
        
        // Save current page to localStorage for persistence
        localStorage.setItem('journalCurrentPage', pageName);
    }

    renderCurrentPage() {
        const activePageElement = document.querySelector('.page.active');
        if (!activePageElement) {
            console.error('No active page found');
            return;
        }
        
        const activePage = activePageElement.id;
        
        switch(activePage) {
            case 'today-page':
                // Today page is already rendered
                break;
            case 'history-page':
                this.renderHistory();
                break;
            case 'goals-page':
                this.renderGoals();
                break;
            case 'statistics-page':
                this.renderStatistics();
                break;
            case 'insights-page':
                this.renderInsights();
                break;
            case 'achievements-page':
                this.renderAchievements();
                break;
            case 'challenges-page':
                this.renderChallenges();
                break;
            case 'habits-page':
                this.renderHabits();
                break;
            case 'heatmap-page':
                this.renderHeatmap();
                break;
            case 'productivity-page':
                this.renderProductivityMood();
                break;
            default:
                console.error(`Unknown page: ${activePage}`);
        }
    }

    // Today Page Functions
    updateCurrentDate() {
        const today = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        document.getElementById('currentDate').textContent = today.toLocaleDateString('pl-PL', options);
    }

    selectMood(mood) {
        this.selectedMood = mood;
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        const moodButton = document.querySelector(`[data-mood="${mood}"]`);
        if (moodButton) {
            moodButton.classList.add('selected');
        }
    }

    addTag(tagText) {
        if (tagText && !this.tags.includes(tagText)) {
            this.tags.push(tagText);
            this.renderTags();
        }
    }

    removeTag(tagText) {
        this.tags = this.tags.filter(tag => tag !== tagText);
        this.renderTags();
    }

    renderTags() {
        const container = document.getElementById('tagsContainer');
        if (!container) return;
        container.innerHTML = this.tags.map(tag => `
            <span class="tag">
                ${tag}
                <span class="tag-remove" onclick="journal.removeTag('${tag}')">&times;</span>
            </span>
        `).join('');
    }

    addGoal() {
        const input = document.getElementById('goalInput');
        const priority = document.getElementById('goalPriority').value;
        const text = input.value.trim();
        
        if (text) {
            const goal = {
                id: Date.now(),
                text: text,
                priority: priority,
                completed: false,
                createdDate: new Date().toISOString().split('T')[0],
                targetDate: null
            };
            
            this.goals.push(goal);
            this.renderGoalsList();
            input.value = '';
            this.saveData();
        }
    }

    renderGoalsList() {
        const container = document.getElementById('goalsList');
        if (!container) return;
        const todayGoals = this.goals.filter(goal => goal.createdDate === new Date().toISOString().split('T')[0]);
        
        container.innerHTML = todayGoals.map(goal => `
            <div class="goal-item ${goal.completed ? 'completed' : ''}">
                <input type="checkbox" ${goal.completed ? 'checked' : ''} 
                       onchange="journal.toggleGoal(${goal.id})">
                <span>${goal.text}</span>
                <span class="goal-priority priority-${goal.priority}">${this.getPriorityText(goal.priority)}</span>
                <button onclick="journal.removeGoal(${goal.id})" class="remove-btn">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
    }

    getPriorityText(priority) {
        const texts = {
            'low': 'Niski',
            'medium': 'Średni',
            'high': 'Wysoki'
        };
        return texts[priority] || 'Niski';
    }

    toggleGoal(goalId) {
        const goal = this.goals.find(g => g.id === goalId);
        if (goal) {
            goal.completed = !goal.completed;
            this.renderGoalsList();
            this.saveData();
        }
    }

    removeGoal(goalId) {
        this.goals = this.goals.filter(g => g.id !== goalId);
        this.renderGoalsList();
        this.saveData();
    }

    addGratitude() {
        const input = document.getElementById('gratitudeInput');
        const text = input.value.trim();
        
        if (text) {
            this.gratitudeList.push(text);
            this.renderGratitudeList();
            input.value = '';
        }
    }

    renderGratitudeList() {
        const container = document.getElementById('gratitudeList');
        if (!container) return;
        container.innerHTML = this.gratitudeList.map((item, index) => `
            <div class="gratitude-item">
                <i class="fas fa-heart"></i>
                <span>${item}</span>
                <button onclick="journal.removeGratitude(${index})" class="remove-btn">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }

    removeGratitude(index) {
        this.gratitudeList.splice(index, 1);
        this.renderGratitudeList();
    }

    saveDay() {
        const today = new Date().toISOString().split('T')[0];
        const entry = {
            date: today,
            mood: this.selectedMood,
            content: document.getElementById('dailyEntry').value,
            tags: this.tags,
            goals: this.goals.filter(g => g.createdDate === today),
            gratitude: this.gratitudeList,
            activities: {
                steps: parseInt(document.getElementById('stepsInput').value) || 0,
                water: parseInt(document.getElementById('waterInput').value) || 0,
                sleep: parseFloat(document.getElementById('sleepInput').value) || 0,
                exercise: parseInt(document.getElementById('exerciseInput').value) || 0
            },
            timestamp: new Date().toISOString()
        };

        // Remove existing entry for today
        this.entries = this.entries.filter(e => e.date !== today);
        
        // Add new entry
        this.entries.push(entry);
        
        // Award XP and points for daily entry
        this.awardDailyEntryXP(entry);
        
        // Check achievements
        this.checkAchievements();
        
        // Save and update
        this.saveData();
        this.updateStatistics();
        this.showMessage('Dzień został pomyślnie zapisany!', 'success');
        
        // Clear form for next day
        setTimeout(() => {
            if (confirm('Czy chcesz wyczyścić formularz na jutro?')) {
                this.clearTodaysForm();
            }
        }, 1000);
    }

    loadTodaysEntry() {
        if (this.currentEntry) {
            this.selectMood(this.currentEntry.mood);
            document.getElementById('dailyEntry').value = this.currentEntry.content || '';
            this.tags = this.currentEntry.tags || [];
            this.renderTags();
            this.gratitudeList = this.currentEntry.gratitude || [];
            this.renderGratitudeList();
            
            if (this.currentEntry.activities) {
                document.getElementById('stepsInput').value = this.currentEntry.activities.steps || '';
                document.getElementById('waterInput').value = this.currentEntry.activities.water || '';
                document.getElementById('sleepInput').value = this.currentEntry.activities.sleep || '';
                document.getElementById('exerciseInput').value = this.currentEntry.activities.exercise || '';
            }
        }
    }

    clearTodaysForm() {
        this.selectedMood = null;
        this.tags = [];
        this.gratitudeList = [];
        
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        document.getElementById('dailyEntry').value = '';
        document.getElementById('stepsInput').value = '';
        document.getElementById('waterInput').value = '';
        document.getElementById('sleepInput').value = '';
        document.getElementById('exerciseInput').value = '';
        
        this.renderTags();
        this.renderGratitudeList();
    }

    // History Page Functions
    renderHistory() {
        const container = document.getElementById('historyContent');
        if (!container) return;
        
        const monthFilter = document.getElementById('monthFilter');
        const moodFilter = document.getElementById('moodFilter');
        const monthValue = monthFilter ? monthFilter.value : '';
        const moodValue = moodFilter ? moodFilter.value : '';
        
        let filteredEntries = [...this.entries].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Apply filters
        if (monthValue) {
            filteredEntries = filteredEntries.filter(entry => {
                const entryDate = new Date(entry.date);
                const filterDate = new Date(monthValue);
                return entryDate.getMonth() === filterDate.getMonth() && 
                       entryDate.getFullYear() === filterDate.getFullYear();
            });
        }
        
        if (moodValue) {
            filteredEntries = filteredEntries.filter(entry => entry.mood === parseInt(moodValue));
        }
        
        container.innerHTML = filteredEntries.map(entry => `
            <div class="history-item" onclick="journal.showEntryDetails('${entry.date}')">
                <div class="history-date">${this.formatDate(entry.date)}</div>
                <div class="history-mood">${this.getMoodEmoji(entry.mood)}</div>
                <div class="history-content-text">${this.truncateText(entry.content, 200)}</div>
                <div class="history-tags">
                    ${entry.tags ? entry.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
                </div>
            </div>
        `).join('');
    }

    showEntryDetails(date) {
        const entry = this.entries.find(e => e.date === date);
        if (entry) {
            const modal = document.getElementById('entryModal');
            const modalBody = document.getElementById('modalBody');
            
            if (!modal || !modalBody) return;
            
            modalBody.innerHTML = `
                <h2>${this.formatDate(date)}</h2>
                <div class="history-mood">${this.getMoodEmoji(entry.mood)}</div>
                
                <h3>Wpis dzienny</h3>
                <p>${entry.content || 'Brak wpisu'}</p>
                
                ${entry.tags && entry.tags.length > 0 ? `
                    <h3>Tagi</h3>
                    <div class="history-tags">
                        ${entry.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                ` : ''}
                
                ${entry.gratitude && entry.gratitude.length > 0 ? `
                    <h3>Wdzięczność</h3>
                    <ul>
                        ${entry.gratitude.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                ` : ''}
                
                ${entry.activities ? `
                    <h3>Aktywności</h3>
                    <div class="activities-grid">
                        <div class="activity-item">
                            <label>Kroki:</label>
                            <span>${entry.activities.steps}</span>
                        </div>
                        <div class="activity-item">
                            <label>Woda:</label>
                            <span>${entry.activities.water}ml</span>
                        </div>
                        <div class="activity-item">
                            <label>Sleep:</label>
                            <span>${entry.activities.sleep}h</span>
                        </div>
                        <div class="activity-item">
                            <label>Ćwiczenia:</label>
                            <span>${entry.activities.exercise}min</span>
                        </div>
                    </div>
                ` : ''}
            `;
            
            modal.style.display = 'block';
        }
    }

    closeModal() {
        const modal = document.getElementById('entryModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // Goals Page Functions
    renderGoals() {
        this.updateGoalsStatistics();
        
        const container = document.getElementById('goalsContent');
        if (!container) return;
        
        const activeGoals = this.goals.filter(g => !g.completed);
        const completedGoals = this.goals.filter(g => g.completed);
        
        container.innerHTML = `
            <div class="goals-section">
                <h3>Aktywne cele</h3>
                <div class="goals-list">
                    ${activeGoals.length > 0 ? activeGoals.map(goal => `
                        <div class="goal-item">
                            <input type="checkbox" onchange="journal.toggleGoal(${goal.id})">
                            <span>${goal.text}</span>
                            <span class="goal-priority priority-${goal.priority}">${this.getPriorityText(goal.priority)}</span>
                            <small>Data: ${this.formatDate(goal.createdDate)}</small>
                        </div>
                    `).join('') : '<p>Brak aktywnych celów</p>'}
                </div>
            </div>
            
            <div class="goals-section">
                <h3>Ukończone cele</h3>
                <div class="goals-list">
                    ${completedGoals.length > 0 ? completedGoals.map(goal => `
                        <div class="goal-item completed">
                            <input type="checkbox" checked onchange="journal.toggleGoal(${goal.id})">
                            <span>${goal.text}</span>
                            <span class="goal-priority priority-${goal.priority}">${this.getPriorityText(goal.priority)}</span>
                            <small>Data: ${this.formatDate(goal.createdDate)}</small>
                        </div>
                    `).join('') : '<p>Brak ukończonych celów</p>'}
                </div>
            </div>
        `;
    }

    updateGoalsStatistics() {
        const totalGoals = this.goals.length;
        const completedGoals = this.goals.filter(g => g.completed).length;
        const efficiency = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;
        
        const activeGoalsEl = document.getElementById('activeGoalsCount');
        const completedGoalsEl = document.getElementById('completedGoalsCount');
        const efficiencyEl = document.getElementById('goalsEfficiency');
        
        if (activeGoalsEl) activeGoalsEl.textContent = totalGoals - completedGoals;
        if (completedGoalsEl) completedGoalsEl.textContent = completedGoals;
        if (efficiencyEl) efficiencyEl.textContent = `${efficiency}%`;
    }

    // Statistics Page Functions
    renderStatistics() {
        this.updateCharts();
    }

    initializeCharts() {
        // Mood Chart
        const moodCanvas = document.getElementById('moodChart');
        if (moodCanvas) {
            const moodCtx = moodCanvas.getContext('2d');
            this.charts.mood = new Chart(moodCtx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Nastrój',
                        data: [],
                        borderColor: '#6366f1',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 5
                        }
                    }
                }
            });
        }

        // Activity Chart
        const activityCanvas = document.getElementById('activityChart');
        if (activityCanvas) {
            const activityCtx = activityCanvas.getContext('2d');
            this.charts.activity = new Chart(activityCtx, {
                type: 'bar',
                data: {
                    labels: ['Kroki', 'Woda (ml)', 'Sen (h)', 'Ćwiczenia (min)'],
                    datasets: [{
                        label: 'Średnia',
                        data: [0, 0, 0, 0],
                        backgroundColor: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b']
                    }]
                },
                options: {
                    responsive: true
                }
            });
        }

        // Goals Chart
        const goalsCanvas = document.getElementById('goalsChart');
        if (goalsCanvas) {
            const goalsCtx = goalsCanvas.getContext('2d');
            this.charts.goals = new Chart(goalsCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Ukończone', 'Aktywne'],
                    datasets: [{
                        data: [0, 0],
                        backgroundColor: ['#10b981', '#ef4444']
                    }]
                },
                options: {
                    responsive: true
                }
            });
        }

        // Tags Chart
        const tagsCanvas = document.getElementById('tagsChart');
        if (tagsCanvas) {
            const tagsCtx = tagsCanvas.getContext('2d');
            this.charts.tags = new Chart(tagsCtx, {
                type: 'bar',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Popularność tagów',
                        data: [],
                        backgroundColor: '#ec4899'
                    }]
                },
                options: {
                    responsive: true
                }
            });
        }
    }

    updateCharts() {
        // Update Mood Chart
        if (this.charts.mood) {
            const last30Days = this.entries.slice(-30);
            this.charts.mood.data.labels = last30Days.map(e => this.formatDate(e.date, true));
            this.charts.mood.data.datasets[0].data = last30Days.map(e => e.mood || 0);
            this.charts.mood.update();
        }

        // Update Activity Chart
        if (this.charts.activity) {
            const activities = this.entries.filter(e => e.activities).slice(-7);
            if (activities.length > 0) {
                const avgSteps = Math.round(activities.reduce((sum, e) => sum + e.activities.steps, 0) / activities.length);
                const avgWater = Math.round(activities.reduce((sum, e) => sum + e.activities.water, 0) / activities.length);
                const avgSleep = (activities.reduce((sum, e) => sum + e.activities.sleep, 0) / activities.length).toFixed(1);
                const avgExercise = Math.round(activities.reduce((sum, e) => sum + e.activities.exercise, 0) / activities.length);
                
                this.charts.activity.data.datasets[0].data = [avgSteps, avgWater, avgSleep, avgExercise];
                this.charts.activity.update();
            }
        }

        // Update Goals Chart
        if (this.charts.goals) {
            const completedGoals = this.goals.filter(g => g.completed).length;
            const activeGoals = this.goals.filter(g => !g.completed).length;
            this.charts.goals.data.datasets[0].data = [completedGoals, activeGoals];
            this.charts.goals.update();
        }

        // Update Tags Chart
        if (this.charts.tags) {
            const tagCounts = {};
            this.entries.forEach(entry => {
                if (entry.tags) {
                    entry.tags.forEach(tag => {
                        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                    });
                }
            });
            
            const sortedTags = Object.entries(tagCounts)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 10);
            
            this.charts.tags.data.labels = sortedTags.map(([tag]) => tag);
            this.charts.tags.data.datasets[0].data = sortedTags.map(([,count]) => count);
            this.charts.tags.update();
        }
    }

    // Insights Page Functions
    renderInsights() {
        this.renderMoodInsights();
        this.renderAchievementsInsights();
        this.renderPatternsInsights();
        this.renderRecommendationsInsights();
    }

    renderMoodInsights() {
        const container = document.getElementById('moodInsights');
        if (!container) return;
        
        const avgMood = this.calculateAverageMood();
        const bestDay = this.findBestDay();
        const worstDay = this.findWorstDay();
        
        container.innerHTML = `
            <p><strong>Średni nastrój:</strong> ${avgMood.toFixed(1)}/5 ${this.getMoodEmoji(Math.round(avgMood))}</p>
            <p><strong>Najlepszy dzień:</strong> ${bestDay ? `${this.formatDate(bestDay.date)} (${this.getMoodEmoji(bestDay.mood)})` : 'Brak danych'}</p>
            <p><strong>Najgorszy dzień:</strong> ${worstDay ? `${this.formatDate(worstDay.date)} (${this.getMoodEmoji(worstDay.mood)})` : 'Brak danych'}</p>
            <p><strong>Trend:</strong> ${this.getMoodTrend()}</p>
        `;
    }

    renderAchievementsInsights() {
        const container = document.getElementById('achievementsInsights');
        if (!container) return;
        
        const totalGoals = this.goals.length;
        const completedGoals = this.goals.filter(g => g.completed).length;
        const longestStreak = this.findLongestStreak();
        
        container.innerHTML = `
            <p><strong>Ukończone cele:</strong> ${completedGoals} z ${totalGoals}</p>
            <p><strong>Najdłuższa seria:</strong> ${longestStreak} dni z rzędu</p>
            <p><strong>Najczęstsze cele:</strong> ${this.getMostCommonGoals()}</p>
        `;
    }

    renderPatternsInsights() {
        const container = document.getElementById('patternsInsights');
        if (!container) return;
        
        const bestDayOfWeek = this.findBestDayOfWeek();
        const avgActivities = this.getAverageActivities();
        
        container.innerHTML = `
            <p><strong>Najlepszy dzień tygodnia:</strong> ${bestDayOfWeek}</p>
            <p><strong>Średnie aktywności:</strong></p>
            <ul>
                <li>Kroki: ${avgActivities.steps}</li>
                <li>Woda: ${avgActivities.water}ml</li>
                <li>Sen: ${avgActivities.sleep}h</li>
                <li>Ćwiczenia: ${avgActivities.exercise}min</li>
            </ul>
        `;
    }

    renderRecommendationsInsights() {
        const container = document.getElementById('recommendationsInsights');
        if (!container) return;
        
        const recommendations = this.generateRecommendations();
        
        container.innerHTML = `
            <ul>
                ${recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
        `;
    }

    // Utility Functions
    updateStatistics() {
        const totalDays = this.entries.length;
        const avgMood = this.calculateAverageMood();
        const completedGoals = this.goals.filter(g => g.completed).length;
        
        const totalDaysEl = document.getElementById('totalDays');
        const avgMoodEl = document.getElementById('avgMood');
        const completedGoalsEl = document.getElementById('completedGoals');
        
        if (totalDaysEl) totalDaysEl.textContent = totalDays;
        if (avgMoodEl) avgMoodEl.textContent = avgMood.toFixed(1);
        if (completedGoalsEl) completedGoalsEl.textContent = completedGoals;
    }

    calculateAverageMood() {
        if (this.entries.length === 0) return 0;
        const sum = this.entries.reduce((acc, entry) => acc + (entry.mood || 0), 0);
        return sum / this.entries.length;
    }

    findBestDay() {
        return this.entries.reduce((best, entry) => {
            if (!best || entry.mood > best.mood) return entry;
            return best;
        }, null);
    }

    findWorstDay() {
        return this.entries.reduce((worst, entry) => {
            if (!worst || entry.mood < worst.mood) return entry;
            return worst;
        }, null);
    }

    findBestDayOfWeek() {
        const dayNames = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'];
        const dayAverages = {};
        
        this.entries.forEach(entry => {
            const dayOfWeek = new Date(entry.date).getDay();
            if (!dayAverages[dayOfWeek]) {
                dayAverages[dayOfWeek] = { sum: 0, count: 0 };
            }
            dayAverages[dayOfWeek].sum += entry.mood || 0;
            dayAverages[dayOfWeek].count++;
        });
        
        let bestDay = 0;
        let bestAverage = 0;
        
        Object.entries(dayAverages).forEach(([day, data]) => {
            const average = data.sum / data.count;
            if (average > bestAverage) {
                bestAverage = average;
                bestDay = parseInt(day);
            }
        });
        
        return dayNames[bestDay];
    }

    getMoodTrend() {
        if (this.entries.length < 7) return 'Za mało danych';
        
        const recent = this.entries.slice(-7);
        const older = this.entries.slice(-14, -7);
        
        const recentAvg = recent.reduce((sum, e) => sum + (e.mood || 0), 0) / recent.length;
        const olderAvg = older.reduce((sum, e) => sum + (e.mood || 0), 0) / older.length;
        
        if (recentAvg > olderAvg) return '📈 Poprawa nastroju';
        if (recentAvg < olderAvg) return '📉 Spadek nastroju';
        return '➡️ Stabilny nastrój';
    }

    findLongestStreak() {
        let streak = 0;
        let maxStreak = 0;
        
        const sortedDates = this.entries.map(e => e.date).sort();
        let currentDate = new Date(sortedDates[0] || '');
        
        sortedDates.forEach(date => {
            const entryDate = new Date(date);
            const diffDays = Math.floor((entryDate - currentDate) / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
                streak++;
            } else if (diffDays > 1) {
                streak = 1;
            }
            
            maxStreak = Math.max(maxStreak, streak);
            currentDate = entryDate;
        });
        
        return maxStreak;
    }

    getMostCommonGoals() {
        const goalTexts = this.goals.map(g => g.text.toLowerCase());
        const counts = {};
        
        goalTexts.forEach(text => {
            const words = text.split(' ');
            words.forEach(word => {
                if (word.length > 3) {
                    counts[word] = (counts[word] || 0) + 1;
                }
            });
        });
        
        const sorted = Object.entries(counts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([word]) => word);
        
        return sorted.join(', ') || 'Brak danych';
    }

    getAverageActivities() {
        const entriesWithActivities = this.entries.filter(e => e.activities);
        
        if (entriesWithActivities.length === 0) {
            return { steps: 0, water: 0, sleep: 0, exercise: 0 };
        }
        
        const totals = entriesWithActivities.reduce((acc, entry) => {
            acc.steps += entry.activities.steps || 0;
            acc.water += entry.activities.water || 0;
            acc.sleep += entry.activities.sleep || 0;
            acc.exercise += entry.activities.exercise || 0;
            return acc;
        }, { steps: 0, water: 0, sleep: 0, exercise: 0 });
        
        const count = entriesWithActivities.length;
        return {
            steps: Math.round(totals.steps / count),
            water: Math.round(totals.water / count),
            sleep: (totals.sleep / count).toFixed(1),
            exercise: Math.round(totals.exercise / count)
        };
    }

    generateRecommendations() {
        const recommendations = [];
        const avgMood = this.calculateAverageMood();
        const avgActivities = this.getAverageActivities();
        
        if (avgMood < 3) {
            recommendations.push('Rozważ dodanie więcej aktywności fizycznych, aby poprawić nastrój');
        }
        
        if (avgActivities.sleep < 7) {
            recommendations.push('Spróbuj spać co najmniej 7-8 godzin dziennie dla lepszej regeneracji');
        }
        
        if (avgActivities.water < 2000) {
            recommendations.push('Pij więcej wody - zalecane minimum 2 litry dziennie');
        }
        
        if (avgActivities.exercise < 30) {
            recommendations.push('Dodaj co najmniej 30 minut ćwiczeń dziennie');
        }
        
        const completedGoals = this.goals.filter(g => g.completed).length;
        const totalGoals = this.goals.length;
        
        if (totalGoals > 0 && completedGoals / totalGoals < 0.5) {
            recommendations.push('Ustaw mniejsze, bardziej osiągalne cele, aby zwiększyć motywację');
        }
        
        if (recommendations.length === 0) {
            recommendations.push('Świetnie radzisz sobie! Kontynuuj dobrą pracę');
        }
        
        return recommendations;
    }

    // Helper Functions
    formatDate(dateString, short = false) {
        const date = new Date(dateString);
        if (short) {
            return date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' });
        }
        return date.toLocaleDateString('pl-PL', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }

    getMoodEmoji(mood) {
        const emojis = {
            1: '😞',
            2: '😐',
            3: '🙂',
            4: '😊',
            5: '🤩'
        };
        return emojis[mood] || '❓';
    }

    truncateText(text, maxLength) {
        if (!text) return 'Brak wpisu';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    showMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `${type}-message`;
        messageDiv.textContent = message;
        
        const header = document.querySelector('.header');
        header.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }

    // Gamification System
    initializeAchievements() {
        return [
            { id: 'first_entry', name: 'Pierwszy wpis', description: 'Zrób swój pierwszy wpis dzienny', xp: 10, icon: '📝' },
            { id: 'week_streak', name: 'Tydzień konsekwencji', description: 'Pisz przez 7 dni z rzędu', xp: 50, icon: '🔥' },
            { id: 'month_streak', name: 'Miesiąc konsekwencji', description: 'Pisz przez 30 dni z rzędu', xp: 200, icon: '💪' },
            { id: 'mood_master', name: 'Mistrz nastroju', description: 'Oceń swój nastrój przez 100 dni', xp: 100, icon: '😊' },
            { id: 'goal_setter', name: 'Celownik', description: 'Ustaw 10 celów', xp: 30, icon: '🎯' },
            { id: 'goal_achiever', name: 'Realizator', description: 'Ukończ 25 celów', xp: 75, icon: '✅' },
            { id: 'grateful', name: 'Wdzięczność', description: 'Dodaj 100 wpisów wdzięczności', xp: 80, icon: '🙏' },
            { id: 'active_life', name: 'Aktywne życie', description: 'Zapisz aktywności przez 50 dni', xp: 60, icon: '🏃' },
            { id: 'deep_thinker', name: 'Głębokie myśli', description: 'Napisz 10,000 znaków treści', xp: 40, icon: '🤔' },
            { id: 'social_butterfly', name: 'Motylek', description: 'Użyj 50 różnych tagów', xp: 45, icon: '🦋' }
        ];
    }

    initializeBadges() {
        return [
            { id: 'beginner', name: 'Początkujący', description: 'Osiągnij poziom 1', icon: '🌟', requirement: { level: 1 } },
            { id: 'intermediate', name: 'Średniozaawansowany', description: 'Osiągnij poziom 5', icon: '⭐', requirement: { level: 5 } },
            { id: 'advanced', name: 'Zaawansowany', description: 'Osiągnij poziom 10', icon: '🌠', requirement: { level: 10 } },
            { id: 'expert', name: 'Ekspert', description: 'Osiągnij poziom 20', icon: '💫', requirement: { level: 20 } },
            { id: 'master', name: 'Mistrz', description: 'Osiągnij poziom 30', icon: '🌌', requirement: { level: 30 } },
            { id: 'legend', name: 'Legenda', description: 'Osiągnij poziom 50', icon: '🌟', requirement: { level: 50 } }
        ];
    }

    initializeChallenges() {
        return {
            daily: [
                { id: 'daily_mood', name: 'Oceń nastrój', description: 'Oceń swój dzisiejszy nastrój', xp: 5, points: 10, type: 'mood' },
                { id: 'daily_gratitude', name: 'Praktykuj wdzięczność', description: 'Dodaj 3 rzeczy za które jesteś wdzięczny', xp: 8, points: 15, type: 'gratitude', target: 3 },
                { id: 'daily_goals', name: 'Ustaw cel', description: 'Ustaw przynajmniej jeden cel na jutro', xp: 6, points: 12, type: 'goals' },
                { id: 'daily_activity', name: 'Bądź aktywny', description: 'Zapisz jakąkolwiek aktywność fizyczną', xp: 7, points: 14, type: 'activity' },
                { id: 'daily_reflection', name: 'Refleksja', description: 'Napisz przynajmniej 200 znaków wpisu', xp: 10, points: 20, type: 'content', target: 200 }
            ],
            weekly: [
                { id: 'week_consistent', name: 'Konsekwentny tydzień', description: 'Pisz przez 7 dni z rzędu', xp: 30, points: 50, type: 'streak', target: 7 },
                { id: 'week_goals', name: 'Tydzień celów', description: 'Ukończ 5 celów w tym tygodniu', xp: 25, points: 40, type: 'goal_completion', target: 5 },
                { id: 'week_mood_tracking', name: 'Śledzenie nastroju', description: 'Oceń nastrój przez 7 dni', xp: 20, points: 35, type: 'mood_streak', target: 7 },
                { id: 'week_active', name: 'Aktywny tydzień', description: 'Zapisz aktywności przez 5 dni', xp: 22, points: 38, type: 'activity_streak', target: 5 }
            ],
            special: [
                { id: 'month_warrior', name: 'Wojownik miesiąca', description: 'Pisz przez 30 dni z rzędu', xp: 100, points: 150, type: 'streak', target: 30 },
                { id: 'goal_master', name: 'Mistrz celów', description: 'Ukończ 50 celów', xp: 80, points: 120, type: 'total_goals', target: 50 },
                { id: 'gratitude_guru', name: 'Guru wdzięczności', description: 'Dodaj 200 wpisów wdzięczności', xp: 90, points: 130, type: 'total_gratitude', target: 200 },
                { id: 'mood_explorer', name: 'Odkrywca nastroju', description: 'Oceń nastrój przez 100 dni', xp: 70, points: 100, type: 'total_mood', target: 100 }
            ]
        };
    }

    awardDailyEntryXP(entry) {
        let xpGained = 10; // Base XP for daily entry
        let pointsGained = 15;
        
        // XP for mood rating
        if (entry.mood) {
            xpGained += 5;
            pointsGained += 8;
        }
        
        // XP for content length
        if (entry.content && entry.content.length > 100) {
            xpGained += Math.min(Math.floor(entry.content.length / 100), 20);
            pointsGained += Math.min(Math.floor(entry.content.length / 200), 10);
        }
        
        // XP for tags
        if (entry.tags && entry.tags.length > 0) {
            xpGained += entry.tags.length * 2;
            pointsGained += entry.tags.length * 3;
        }
        
        // XP for goals
        if (entry.goals && entry.goals.length > 0) {
            xpGained += entry.goals.length * 4;
            pointsGained += entry.goals.length * 5;
        }
        
        // XP for gratitude
        if (entry.gratitude && entry.gratitude.length > 0) {
            xpGained += entry.gratitude.length * 3;
            pointsGained += entry.gratitude.length * 4;
        }
        
        // XP for activities
        if (entry.activities) {
            const activities = Object.values(entry.activities);
            const nonZeroActivities = activities.filter(val => val > 0);
            xpGained += nonZeroActivities.length * 4;
            pointsGained += nonZeroActivities.length * 6;
        }
        
        // Award XP and check for level up
        this.addXP(xpGained);
        this.addPoints(pointsGained);
        
        // Show notification
        this.showNotification(`Zdobyłeś ${xpGained} XP i ${pointsGained} punktów!`, 'success');
    }

    addXP(amount) {
        const oldLevel = this.userData.level;
        this.userData.xp += amount;
        
        // Check for level up
        const newLevel = this.calculateLevel(this.userData.xp);
        if (newLevel > oldLevel) {
            this.levelUp(newLevel, oldLevel);
        }
        
        this.userData.level = newLevel;
        this.updateUserStats();
    }

    addPoints(amount) {
        this.userData.points += amount;
        this.updateUserStats();
    }

    calculateLevel(xp) {
        // Level formula: each level requires 100 * level XP
        let level = 1;
        let requiredXP = 0;
        
        while (xp >= requiredXP) {
            requiredXP += level * 100;
            if (xp >= requiredXP) {
                level++;
            }
        }
        
        return level;
    }

    getXPForLevel(level) {
        let totalXP = 0;
        for (let i = 1; i < level; i++) {
            totalXP += i * 100;
        }
        return totalXP;
    }

    levelUp(newLevel, oldLevel) {
        // Show level up modal
        document.getElementById('newLevel').textContent = newLevel;
        
        // Calculate rewards
        const rewards = [];
        for (let i = oldLevel + 1; i <= newLevel; i++) {
            rewards.push(`Poziom ${i}: +${i * 10} punktów bonusowych`);
        }
        
        document.getElementById('levelRewards').innerHTML = rewards.map(r => `<li>${r}</li>`).join('');
        document.getElementById('levelUpModal').style.display = 'block';
        
        // Award bonus points
        this.addPoints(newLevel * 10);
        
        // Check for new badges
        this.checkBadges();
        
        this.showNotification(`🎉 Awansowałeś na poziom ${newLevel}!`, 'levelup');
    }

    closeLevelUpModal() {
        document.getElementById('levelUpModal').style.display = 'none';
    }

    updateStreak() {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        
        if (this.userData.lastActiveDate === today) {
            // Already active today
            return;
        }
        
        if (this.userData.lastActiveDate === yesterday) {
            // Continue streak
            this.userData.streak++;
        } else {
            // Reset streak
            this.userData.streak = 1;
        }
        
        this.userData.lastActiveDate = today;
        this.saveData();
    }

    checkAchievements() {
        this.achievements.forEach(achievement => {
            if (!this.userData.achievements.includes(achievement.id)) {
                if (this.isAchievementUnlocked(achievement)) {
                    this.unlockAchievement(achievement);
                }
            }
        });
    }

    isAchievementUnlocked(achievement) {
        switch (achievement.id) {
            case 'first_entry':
                return this.entries.length >= 1;
            case 'week_streak':
                return this.userData.streak >= 7;
            case 'month_streak':
                return this.userData.streak >= 30;
            case 'mood_master':
                return this.entries.filter(e => e.mood).length >= 100;
            case 'goal_setter':
                return this.goals.length >= 10;
            case 'goal_achiever':
                return this.goals.filter(g => g.completed).length >= 25;
            case 'grateful':
                const totalGratitude = this.entries.reduce((sum, e) => sum + (e.gratitude ? e.gratitude.length : 0), 0);
                return totalGratitude >= 100;
            case 'active_life':
                return this.entries.filter(e => e.activities && Object.values(e.activities).some(v => v > 0)).length >= 50;
            case 'deep_thinker':
                const totalChars = this.entries.reduce((sum, e) => sum + (e.content ? e.content.length : 0), 0);
                return totalChars >= 10000;
            case 'social_butterfly':
                const allTags = new Set();
                this.entries.forEach(e => {
                    if (e.tags) e.tags.forEach(tag => allTags.add(tag));
                });
                return allTags.size >= 50;
            default:
                return false;
        }
    }

    unlockAchievement(achievement) {
        this.userData.achievements.push(achievement.id);
        this.addXP(achievement.xp);
        this.showNotification(`🏆 Odblokowano osiągnięcie: ${achievement.name}! +${achievement.xp} XP`, 'achievement');
        this.saveData();
    }

    checkBadges() {
        this.badges.forEach(badge => {
            if (!this.userData.badges.includes(badge.id)) {
                if (this.userData.level >= badge.requirement.level) {
                    this.unlockBadge(badge);
                }
            }
        });
    }

    unlockBadge(badge) {
        this.userData.badges.push(badge.id);
        this.showNotification(`🎓 Zdobyta odznaka: ${badge.name}!`, 'badge');
        this.saveData();
    }

    updateUserStats() {
        document.getElementById('userLevel').textContent = this.userData.level;
        document.getElementById('userLevelText').textContent = this.userData.level;
        document.getElementById('currentXP').textContent = this.userData.xp;
        document.getElementById('nextLevelXP').textContent = this.getXPForLevel(this.userData.level + 1);
        document.getElementById('totalPoints').textContent = this.userData.points;
        document.getElementById('totalBadges').textContent = this.userData.badges.length;
        document.getElementById('currentStreak').textContent = this.userData.streak;
        
        // Update progress bar
        const currentLevelXP = this.getXPForLevel(this.userData.level);
        const nextLevelXP = this.getXPForLevel(this.userData.level + 1);
        const progress = ((this.userData.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
        document.getElementById('levelProgress').style.width = `${progress}%`;
    }

    renderAchievements() {
        this.updateUserStats();
        
        // Render earned badges
        const earnedBadgesContainer = document.getElementById('earnedBadges');
        const earnedBadges = this.badges.filter(badge => this.userData.badges.includes(badge.id));
        
        earnedBadgesContainer.innerHTML = earnedBadges.map(badge => `
            <div class="badge-item earned">
                <div class="badge-icon">${badge.icon}</div>
                <div class="badge-info">
                    <h4>${badge.name}</h4>
                    <p>${badge.description}</p>
                </div>
            </div>
        `).join('');
        
        // Render unlocked achievements
        const achievementsContainer = document.getElementById('unlockedAchievements');
        const unlockedAchievements = this.achievements.filter(achievement => this.userData.achievements.includes(achievement.id));
        
        achievementsContainer.innerHTML = unlockedAchievements.map(achievement => `
            <div class="achievement-item unlocked">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-info">
                    <h4>${achievement.name}</h4>
                    <p>${achievement.description}</p>
                    <span class="achievement-xp">+${achievement.xp} XP</span>
                </div>
            </div>
        `).join('');
    }

    renderChallenges() {
        // Render daily challenge
        const dailyChallenge = this.getDailyChallenge();
        const dailyContainer = document.getElementById('dailyChallengeCard');
        
        dailyContainer.innerHTML = `
            <div class="challenge-header">
                <h4>${dailyChallenge.name}</h4>
                <span class="challenge-reward">+${dailyChallenge.xp} XP, +${dailyChallenge.points} pkt</span>
            </div>
            <p>${dailyChallenge.description}</p>
            <div class="challenge-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${this.getChallengeProgress(dailyChallenge)}%"></div>
                </div>
                <span>${this.getChallengeProgressText(dailyChallenge)}</span>
            </div>
            ${this.isChallengeCompleted(dailyChallenge) ? '<button class="btn-success" disabled>Ukończone</button>' : '<button class="btn-primary" onclick="journal.completeChallenge(\'daily\')">Zakończ wyzwanie</button>'}
        `;
        
        // Render weekly challenges
        const weeklyContainer = document.getElementById('weeklyChallenges');
        weeklyContainer.innerHTML = this.challenges.weekly.map(challenge => `
            <div class="challenge-card ${this.isChallengeCompleted(challenge) ? 'completed' : ''}">
                <div class="challenge-header">
                    <h4>${challenge.name}</h4>
                    <span class="challenge-reward">+${challenge.xp} XP, +${challenge.points} pkt</span>
                </div>
                <p>${challenge.description}</p>
                <div class="challenge-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${this.getChallengeProgress(challenge)}%"></div>
                    </div>
                    <span>${this.getChallengeProgressText(challenge)}</span>
                </div>
            </div>
        `).join('');
        
        // Render special challenges
        const specialContainer = document.getElementById('specialChallenges');
        specialContainer.innerHTML = this.challenges.special.map(challenge => `
            <div class="challenge-card special ${this.isChallengeCompleted(challenge) ? 'completed' : ''}">
                <div class="challenge-header">
                    <h4>${challenge.name}</h4>
                    <span class="challenge-reward">+${challenge.xp} XP, +${challenge.points} pkt</span>
                </div>
                <p>${challenge.description}</p>
                <div class="challenge-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${this.getChallengeProgress(challenge)}%"></div>
                    </div>
                    <span>${this.getChallengeProgressText(challenge)}</span>
                </div>
            </div>
        `).join('');
    }

    getDailyChallenge() {
        const dayIndex = new Date().getDay();
        return this.challenges.daily[dayIndex % this.challenges.daily.length];
    }

    getChallengeProgress(challenge) {
        let progress = 0;
        
        switch (challenge.type) {
            case 'mood':
                progress = this.currentEntry && this.currentEntry.mood ? 100 : 0;
                break;
            case 'gratitude':
                const gratitudeCount = this.currentEntry && this.currentEntry.gratitude ? this.currentEntry.gratitude.length : 0;
                progress = Math.min((gratitudeCount / (challenge.target || 1)) * 100, 100);
                break;
            case 'goals':
                const goalsCount = this.currentEntry && this.currentEntry.goals ? this.currentEntry.goals.length : 0;
                progress = goalsCount > 0 ? 100 : 0;
                break;
            case 'activity':
                const hasActivity = this.currentEntry && this.currentEntry.activities && Object.values(this.currentEntry.activities).some(v => v > 0);
                progress = hasActivity ? 100 : 0;
                break;
            case 'content':
                const contentLength = this.currentEntry && this.currentEntry.content ? this.currentEntry.content.length : 0;
                progress = Math.min((contentLength / (challenge.target || 200)) * 100, 100);
                break;
            case 'streak':
                progress = Math.min((this.userData.streak / challenge.target) * 100, 100);
                break;
            case 'goal_completion':
                const completedThisWeek = this.getCompletedGoalsThisWeek();
                progress = Math.min((completedThisWeek / challenge.target) * 100, 100);
                break;
            case 'mood_streak':
                const moodStreak = this.getMoodStreak();
                progress = Math.min((moodStreak / challenge.target) * 100, 100);
                break;
            case 'activity_streak':
                const activityStreak = this.getActivityStreak();
                progress = Math.min((activityStreak / challenge.target) * 100, 100);
                break;
            case 'total_goals':
                progress = Math.min((this.goals.filter(g => g.completed).length / challenge.target) * 100, 100);
                break;
            case 'total_gratitude':
                const totalGratitude = this.entries.reduce((sum, e) => sum + (e.gratitude ? e.gratitude.length : 0), 0);
                progress = Math.min((totalGratitude / challenge.target) * 100, 100);
                break;
            case 'total_mood':
                progress = Math.min((this.entries.filter(e => e.mood).length / challenge.target) * 100, 100);
                break;
        }
        
        return progress;
    }

    getChallengeProgressText(challenge) {
        let current = 0;
        let target = challenge.target || 1;
        
        switch (challenge.type) {
            case 'mood':
                current = this.currentEntry && this.currentEntry.mood ? 1 : 0;
                target = 1;
                break;
            case 'gratitude':
                current = this.currentEntry && this.currentEntry.gratitude ? this.currentEntry.gratitude.length : 0;
                break;
            case 'goals':
                current = this.currentEntry && this.currentEntry.goals ? this.currentEntry.goals.length : 0;
                target = 1;
                break;
            case 'activity':
                current = this.currentEntry && this.currentEntry.activities && Object.values(this.currentEntry.activities).some(v => v > 0) ? 1 : 0;
                target = 1;
                break;
            case 'content':
                current = this.currentEntry && this.currentEntry.content ? this.currentEntry.content.length : 0;
                break;
            case 'streak':
                current = this.userData.streak;
                break;
            case 'goal_completion':
                current = this.getCompletedGoalsThisWeek();
                break;
            case 'mood_streak':
                current = this.getMoodStreak();
                break;
            case 'activity_streak':
                current = this.getActivityStreak();
                break;
            case 'total_goals':
                current = this.goals.filter(g => g.completed).length;
                break;
            case 'total_gratitude':
                current = this.entries.reduce((sum, e) => sum + (e.gratitude ? e.gratitude.length : 0), 0);
                break;
            case 'total_mood':
                current = this.entries.filter(e => e.mood).length;
                break;
        }
        
        return `${current} / ${target}`;
    }

    isChallengeCompleted(challenge) {
        return this.getChallengeProgress(challenge) >= 100;
    }

    getCompletedGoalsThisWeek() {
        const weekAgo = new Date(Date.now() - 7 * 86400000);
        return this.goals.filter(g => g.completed && new Date(g.createdDate) >= weekAgo).length;
    }

    getMoodStreak() {
        let streak = 0;
        const sortedEntries = [...this.entries].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        for (const entry of sortedEntries) {
            if (entry.mood) {
                streak++;
            } else {
                break;
            }
        }
        
        return streak;
    }

    getActivityStreak() {
        let streak = 0;
        const sortedEntries = [...this.entries].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        for (const entry of sortedEntries) {
            if (entry.activities && Object.values(entry.activities).some(v => v > 0)) {
                streak++;
            } else {
                break;
            }
        }
        
        return streak;
    }

    completeChallenge(type) {
        const challenge = type === 'daily' ? this.getDailyChallenge() : null;
        
        if (challenge && !this.isChallengeCompleted(challenge)) {
            this.userData.completedChallenges.push({
                id: challenge.id,
                type: type,
                date: new Date().toISOString().split('T')[0]
            });
            
            this.addXP(challenge.xp);
            this.addPoints(challenge.points);
            
            this.showNotification(`✅ Ukończono wyzwanie: ${challenge.name}! +${challenge.xp} XP, +${challenge.points} pkt`, 'success');
            this.saveData();
            this.renderChallenges();
        }
    }

    // Habits System
    addNewHabit() {
        const habitName = prompt('Nazwa nowego nawyku:');
        if (!habitName) return;

        const habit = {
            id: Date.now().toString(),
            name: habitName,
            icon: '🎯',
            color: '#' + Math.floor(Math.random()*16777215).toString(16),
            createdAt: new Date().toISOString(),
            streak: 0,
            completedDates: [],
            targetDays: 30,
            category: 'custom'
        };

        this.habits.push(habit);
        this.saveData();
        this.renderHabits();
        this.showNotification(`Dodano nawyk: ${habitName}`, 'success');
    }

    toggleHabit(habitId) {
        const habit = this.habits.find(h => h.id === habitId);
        if (!habit) return;

        const today = new Date().toISOString().split('T')[0];
        const index = habit.completedDates.indexOf(today);

        if (index > -1) {
            habit.completedDates.splice(index, 1);
            this.showNotification(`Usunięto nawyk: ${habit.name}`, 'info');
        } else {
            habit.completedDates.push(today);
            this.showNotification(`Ukończono nawyk: ${habit.name}`, 'success');
            this.addXP(5);
        }

        this.updateHabitStreak(habit);
        this.saveData();
        this.renderHabits();
    }

    updateHabitStreak(habit) {
        const sortedDates = habit.completedDates.sort((a, b) => new Date(b) - new Date(a));
        let streak = 0;
        let currentDate = new Date();

        for (let i = 0; i < sortedDates.length; i++) {
            const date = new Date(sortedDates[i]);
            const diffDays = Math.floor((currentDate - date) / (1000 * 60 * 60 * 24));

            if (diffDays === streak) {
                streak++;
            } else {
                break;
            }
        }

        habit.streak = streak;
    }

    renderHabits() {
        const habitsList = document.getElementById('habitsList');
        const activeCount = document.getElementById('activeHabitsCount');
        const completedToday = document.getElementById('completedTodayCount');
        const longestStreak = document.getElementById('longestStreak');

        if (!habitsList) return;

        const today = new Date().toISOString().split('T')[0];
        let completedTodayCount = 0;
        let maxStreak = 0;

        habitsList.innerHTML = '';

        this.habits.forEach(habit => {
            const isCompletedToday = habit.completedDates.includes(today);
            if (isCompletedToday) completedTodayCount++;
            if (habit.streak > maxStreak) maxStreak = habit.streak;

            const habitCard = document.createElement('div');
            habitCard.className = `habit-card ${isCompletedToday ? 'completed' : ''}`;
            habitCard.innerHTML = `
                <div class="habit-header">
                    <div class="habit-info">
                        <span class="habit-icon" style="color: ${habit.color}">${habit.icon}</span>
                        <div>
                            <h4>${habit.name}</h4>
                            <p>Seria: ${habit.streak} dni</p>
                        </div>
                    </div>
                    <button class="habit-toggle ${isCompletedToday ? 'completed' : ''}" 
                            onclick="journal.toggleHabit('${habit.id}')">
                        ${isCompletedToday ? '✓' : '○'}
                    </button>
                </div>
                <div class="habit-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${(habit.completedDates.length / habit.targetDays) * 100}%"></div>
                    </div>
                    <span>${habit.completedDates.length}/${habit.targetDays} dni</span>
                </div>
            `;
            habitsList.appendChild(habitCard);
        });

        if (activeCount) activeCount.textContent = this.habits.length;
        if (completedToday) completedToday.textContent = completedTodayCount;
        if (longestStreak) longestStreak.textContent = maxStreak + ' dni';
    }

    // Heatmap System
    renderHeatmap() {
        const yearSelect = document.getElementById('heatmapYear');
        const monthsContainer = document.getElementById('heatmapMonths');
        const gridContainer = document.getElementById('heatmapGrid');
        const totalDays = document.getElementById('totalActivityDays');
        const currentStreak = document.getElementById('currentStreak');

        if (!yearSelect || !monthsContainer || !gridContainer) return;

        const currentYear = new Date().getFullYear();
        const selectedYear = parseInt(yearSelect.value) || currentYear;

        // Populate year selector
        yearSelect.innerHTML = '';
        for (let year = currentYear - 2; year <= currentYear; year++) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            option.selected = year === selectedYear;
            yearSelect.appendChild(option);
        }

        // Generate months labels
        const months = ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'];
        monthsContainer.innerHTML = months.map(month => `<div class="month-label">${month}</div>`).join('');

        // Generate heatmap grid
        const startDate = new Date(selectedYear, 0, 1);
        const endDate = new Date(selectedYear, 11, 31);
        const activityData = this.getActivityData(selectedYear);

        let html = '<div class="heatmap-weeks">';
        let currentWeek = [];

        for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
            const dateStr = date.toISOString().split('T')[0];
            const dayOfWeek = date.getDay();
            const activity = activityData[dateStr] || 0;

            if (date.getDay() === 0 && currentWeek.length > 0) {
                html += `<div class="heatmap-week">${currentWeek.join('')}</div>`;
                currentWeek = [];
            }

            const level = Math.min(4, Math.floor(activity / 2));
            currentWeek.push(`<div class="heatmap-day level-${level}" title="${dateStr}: ${activity} aktywności"></div>`);
        }

        if (currentWeek.length > 0) {
            html += `<div class="heatmap-week">${currentWeek.join('')}</div>`;
        }
        html += '</div>';

        gridContainer.innerHTML = html;

        // Update stats
        const totalActivityDaysCount = Object.keys(activityData).filter(date => activityData[date] > 0).length;
        if (totalDays) totalDays.textContent = totalActivityDaysCount;
        if (currentStreak) currentStreak.textContent = this.calculateCurrentStreak();
    }

    getActivityData(year) {
        const activityData = {};
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31);

        for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
            const dateStr = date.toISOString().split('T')[0];
            let activity = 0;

            // Check if there's a journal entry
            const entry = this.entries.find(e => e.date === dateStr);
            if (entry) {
                activity += 1;
                if (entry.mood) activity += 1;
                if (entry.goals && entry.goals.length > 0) activity += 1;
                if (entry.gratitude && entry.gratitude.length > 0) activity += 1;
            }

            // Check completed habits
            this.habits.forEach(habit => {
                if (habit.completedDates.includes(dateStr)) {
                    activity += 1;
                }
            });

            activityData[dateStr] = activity;
        }

        return activityData;
    }

    calculateCurrentStreak() {
        const today = new Date();
        let streak = 0;

        for (let i = 0; i < 365; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            const entry = this.entries.find(e => e.date === dateStr);
            const hasActivity = entry || this.habits.some(h => h.completedDates.includes(dateStr));

            if (hasActivity) {
                streak++;
            } else if (i > 0) {
                break;
            }
        }

        return streak;
    }

    // Productivity vs Mood Chart
    renderProductivityMood() {
        const periodSelect = document.getElementById('productivityPeriod');
        const canvas = document.getElementById('productivityMoodChart');
        const correlationEl = document.getElementById('correlationCoefficient');
        const interpretationEl = document.getElementById('correlationInterpretation');

        if (!canvas || !periodSelect) return;

        const days = parseInt(periodSelect.value);
        const data = this.getProductivityMoodData(days);

        // Destroy existing chart if it exists
        if (this.charts.productivityMood) {
            this.charts.productivityMood.destroy();
        }

        const ctx = canvas.getContext('2d');
        this.charts.productivityMood = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Produktywność vs Nastrój',
                    data: data.map(d => ({ x: d.mood, y: d.productivity })),
                    backgroundColor: 'rgba(74, 144, 226, 0.6)',
                    borderColor: 'rgba(74, 144, 226, 1)',
                    borderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Nastrój (1-5)'
                        },
                        min: 0,
                        max: 6
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Produktywność'
                        },
                        min: 0
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const dataIndex = context.dataIndex;
                                const dataPoint = data[dataIndex];
                                return `${dataPoint.date}: Nastrój ${dataPoint.mood}, Produktywność ${dataPoint.productivity}`;
                            }
                        }
                    }
                }
            }
        });

        // Calculate correlation
        const correlation = this.calculateCorrelation(data);
        if (correlationEl) correlationEl.textContent = correlation.toFixed(2);
        
        if (interpretationEl) {
            let interpretation = '';
            if (correlation > 0.5) {
                interpretation = 'Silna dodatnia korelacja - lepszy nastrój wiąże się z wyższą produktywnością';
            } else if (correlation > 0.2) {
                interpretation = 'Umiarkowana dodatnia korelacja - istnieje tendencja do wyższej produktywności przy lepszym nastroju';
            } else if (correlation > -0.2) {
                interpretation = 'Brak wyraźnej korelacji między nastrojem a produktywnością';
            } else if (correlation > -0.5) {
                interpretation = 'Umiarkowana ujemna korelacja - gorszy nastrój może wiązać się z wyższą produktywnością';
            } else {
                interpretation = 'Silna ujemna korelacja - gorszy nastrój wiąże się z wyższą produktywnością';
            }
            interpretationEl.textContent = interpretation;
        }
    }

    getProductivityMoodData(days) {
        const data = [];
        const today = new Date();

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            const entry = this.entries.find(e => e.date === dateStr);
            if (entry && entry.mood) {
                let productivity = 0;
                
                // Calculate productivity score
                if (entry.content && entry.content.length > 50) productivity += 1;
                if (entry.goals && entry.goals.length > 0) productivity += entry.goals.length;
                if (entry.gratitude && entry.gratitude.length > 0) productivity += entry.gratitude.length;
                if (entry.activities && Object.keys(entry.activities).length > 0) {
                    productivity += Object.values(entry.activities).filter(v => v > 0).length;
                }

                // Add completed habits
                const completedHabits = this.habits.filter(h => h.completedDates.includes(dateStr)).length;
                productivity += completedHabits;

                data.push({
                    date: dateStr,
                    mood: entry.mood,
                    productivity: productivity
                });
            }
        }

        return data;
    }

    calculateCorrelation(data) {
        if (data.length < 2) return 0;

        const n = data.length;
        const sumX = data.reduce((sum, d) => sum + d.mood, 0);
        const sumY = data.reduce((sum, d) => sum + d.productivity, 0);
        const sumXY = data.reduce((sum, d) => sum + (d.mood * d.productivity), 0);
        const sumX2 = data.reduce((sum, d) => sum + (d.mood * d.mood), 0);
        const sumY2 = data.reduce((sum, d) => sum + (d.productivity * d.productivity), 0);

        const correlation = (n * sumXY - sumX * sumY) / 
            Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

        return isNaN(correlation) ? 0 : correlation;
    }

    showNotification(message, type = 'info') {
        const toast = document.getElementById('notificationToast');
        const icon = toast.querySelector('.notification-icon');
        const text = toast.querySelector('.notification-text');
        
        // Set icon based on type
        const icons = {
            'success': '✅',
            'achievement': '🏆',
            'badge': '🎓',
            'levelup': '🎉',
            'info': 'ℹ️',
            'warning': '⚠️',
            'error': '❌'
        };
        
        icon.className = `notification-icon ${type}`;
        icon.textContent = icons[type] || icons.info;
        text.textContent = message;
        
        toast.className = `notification-toast show ${type}`;
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            this.hideNotification();
        }, 5000);
    }

    hideNotification() {
        const toast = document.getElementById('notificationToast');
        toast.className = 'notification-toast';
    }
    
    // Search Functionality
    handleSearch(query) {
        const searchResults = document.getElementById('searchResults');
        
        if (!query || query.trim().length < 2) {
            searchResults.classList.remove('show');
            return;
        }
        
        const results = this.performSearch(query.trim());
        this.displaySearchResults(results, query);
    }
    
    performSearch(query) {
        const results = [];
        const lowerQuery = query.toLowerCase();
        
        // Search in entries
        this.entries.forEach(entry => {
            let matches = [];
            
            // Search in content
            if (entry.content && entry.content.toLowerCase().includes(lowerQuery)) {
                matches.push({ type: 'content', text: this.truncateText(entry.content, 100) });
            }
            
            // Search in tags
            if (entry.tags) {
                const matchingTags = entry.tags.filter(tag => tag.toLowerCase().includes(lowerQuery));
                if (matchingTags.length > 0) {
                    matches.push({ type: 'tags', text: matchingTags.join(', ') });
                }
            }
            
            // Search in gratitude
            if (entry.gratitude) {
                const matchingGratitude = entry.gratitude.filter(item => 
                    item.toLowerCase().includes(lowerQuery)
                );
                if (matchingGratitude.length > 0) {
                    matches.push({ type: 'gratitude', text: matchingGratitude.join(', ') });
                }
            }
            
            if (matches.length > 0) {
                results.push({
                    type: 'entry',
                    date: entry.date,
                    title: `Wpis z ${this.formatDate(entry.date)}`,
                    matches: matches,
                    mood: entry.mood
                });
            }
        });
        
        // Search in goals
        this.goals.forEach(goal => {
            if (goal.text.toLowerCase().includes(lowerQuery)) {
                results.push({
                    type: 'goal',
                    id: goal.id,
                    title: goal.text,
                    completed: goal.completed,
                    createdDate: goal.createdDate,
                    priority: goal.priority
                });
            }
        });
        
        // Search in habits
        this.habits.forEach(habit => {
            if (habit.name.toLowerCase().includes(lowerQuery)) {
                results.push({
                    type: 'habit',
                    id: habit.id,
                    title: habit.name,
                    streak: habit.streak
                });
            }
        });
        
        return results.slice(0, 10); // Limit to 10 results
    }
    
    displaySearchResults(results, query) {
        const searchResults = document.getElementById('searchResults');
        
        if (results.length === 0) {
            searchResults.innerHTML = `
                <div class="search-no-results">
                    <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <p>Brak wyników dla "${query}"</p>
                </div>
            `;
        } else {
            searchResults.innerHTML = results.map(result => {
                let html = '<div class="search-result-item" onclick="journal.handleSearchResultClick(';
                
                if (result.type === 'entry') {
                    html += `'entry', '${result.date}')`;
                } else if (result.type === 'goal') {
                    html += `'goal', '${result.id}')`;
                } else if (result.type === 'habit') {
                    html += `'habit', '${result.id}')`;
                }
                
                html += '">';
                
                // Title
                html += `<div class="search-result-title">${result.title}</div>`;
                
                // Type and metadata
                if (result.type === 'entry') {
                    html += `
                        <span class="search-result-type">Wpis</span>
                        <span class="search-result-date">${this.formatDate(result.date)}</span>
                        ${result.mood ? `<span style="margin-left: 0.5rem;">${this.getMoodEmoji(result.mood)}</span>` : ''}
                    `;
                    
                    // Show matches
                    result.matches.forEach(match => {
                        html += `<div style="margin-top: 0.5rem; font-size: 0.9rem; color: var(--text-secondary);">${match.text}</div>`;
                    });
                } else if (result.type === 'goal') {
                    html += `
                        <span class="search-result-type">Cel</span>
                        <span class="search-result-type priority-${result.priority}">${this.getPriorityText(result.priority)}</span>
                        <span class="search-result-date">${this.formatDate(result.createdDate)}</span>
                        ${result.completed ? '<span style="color: var(--success-color);">✓ Ukończony</span>' : ''}
                    `;
                } else if (result.type === 'habit') {
                    html += `
                        <span class="search-result-type">Nawyk</span>
                        <span class="search-result-date">Seria: ${result.streak} dni</span>
                    `;
                }
                
                html += '</div>';
                return html;
            }).join('');
        }
        
        searchResults.classList.add('show');
    }
    
    handleSearchResultClick(type, id) {
        const searchResults = document.getElementById('searchResults');
        searchResults.classList.remove('show');
        document.getElementById('globalSearch').value = '';
        
        if (type === 'entry') {
            this.switchPage('history');
            setTimeout(() => {
                this.showEntryDetails(id);
            }, 100);
        } else if (type === 'goal') {
            this.switchPage('goals');
        } else if (type === 'habit') {
            this.switchPage('habits');
        }
    }
}

// Initialize application
let journal;

// Make sure journal is available globally for button onclick handlers
window.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - initializing journal...');
    journal = new LifeJournal();
    
    // Make journal globally accessible
    window.journal = journal;
});
