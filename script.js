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
        
        this.initializeApp();
    }

    initializeApp() {
        this.loadData();
        this.setupEventListeners();
        this.updateCurrentDate();
        this.updateStatistics();
        this.renderCurrentPage();
        this.initializeCharts();
    }

    // Data Management
    loadData() {
        const savedEntries = localStorage.getItem('journalEntries');
        const savedGoals = localStorage.getItem('journalGoals');
        
        if (savedEntries) {
            this.entries = JSON.parse(savedEntries);
        }
        
        if (savedGoals) {
            this.goals = JSON.parse(savedGoals);
        }
        
        // Load today's entry if exists
        const today = new Date().toISOString().split('T')[0];
        this.currentEntry = this.entries.find(entry => entry.date === today) || null;
        
        if (this.currentEntry) {
            this.loadTodaysEntry();
        }
    }

    saveData() {
        localStorage.setItem('journalEntries', JSON.stringify(this.entries));
        localStorage.setItem('journalGoals', JSON.stringify(this.goals));
    }

    // Event Listeners
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => this.switchPage(e.target.closest('.nav-item').dataset.page));
        });

        // Mood Selection
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectMood(parseInt(e.target.dataset.mood)));
        });

        // Tags
        document.getElementById('tagInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                this.addTag(e.target.value.trim());
                e.target.value = '';
            }
        });

        // Goals
        document.getElementById('addGoalBtn').addEventListener('click', () => this.addGoal());
        document.getElementById('goalInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addGoal();
        });

        // Gratitude
        document.getElementById('addGratitudeBtn').addEventListener('click', () => this.addGratitude());
        document.getElementById('gratitudeInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addGratitude();
        });

        // Save Day
        document.getElementById('saveDayBtn').addEventListener('click', () => this.saveDay());

        // History Filters
        document.getElementById('monthFilter').addEventListener('change', () => this.renderHistory());
        document.getElementById('moodFilter').addEventListener('change', () => this.renderHistory());

        // Modal
        document.querySelector('.close').addEventListener('click', () => this.closeModal());
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal();
            }
        });
    }

    // Navigation
    switchPage(pageName) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-page="${pageName}"]`).classList.add('active');

        // Update pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById(`${pageName}-page`).classList.add('active');

        // Render page content
        this.renderCurrentPage();
    }

    renderCurrentPage() {
        const activePage = document.querySelector('.page.active').id;
        
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
        document.querySelector(`[data-mood="${mood}"]`).classList.add('selected');
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
        const monthFilter = document.getElementById('monthFilter').value;
        const moodFilter = document.getElementById('moodFilter').value;
        
        let filteredEntries = [...this.entries].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Apply filters
        if (monthFilter) {
            filteredEntries = filteredEntries.filter(entry => {
                const entryDate = new Date(entry.date);
                const filterDate = new Date(monthFilter);
                return entryDate.getMonth() === filterDate.getMonth() && 
                       entryDate.getFullYear() === filterDate.getFullYear();
            });
        }
        
        if (moodFilter) {
            filteredEntries = filteredEntries.filter(entry => entry.mood === parseInt(moodFilter));
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
        document.getElementById('entryModal').style.display = 'none';
    }

    // Goals Page Functions
    renderGoals() {
        this.updateGoalsStatistics();
        
        const container = document.getElementById('goalsContent');
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
        
        document.getElementById('activeGoalsCount').textContent = totalGoals - completedGoals;
        document.getElementById('completedGoalsCount').textContent = completedGoals;
        document.getElementById('goalsEfficiency').textContent = `${efficiency}%`;
    }

    // Statistics Page Functions
    renderStatistics() {
        this.updateCharts();
    }

    initializeCharts() {
        // Mood Chart
        const moodCtx = document.getElementById('moodChart').getContext('2d');
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

        // Activity Chart
        const activityCtx = document.getElementById('activityChart').getContext('2d');
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

        // Goals Chart
        const goalsCtx = document.getElementById('goalsChart').getContext('2d');
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

        // Tags Chart
        const tagsCtx = document.getElementById('tagsChart').getContext('2d');
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

    updateCharts() {
        // Update Mood Chart
        const last30Days = this.entries.slice(-30);
        this.charts.mood.data.labels = last30Days.map(e => this.formatDate(e.date, true));
        this.charts.mood.data.datasets[0].data = last30Days.map(e => e.mood || 0);
        this.charts.mood.update();

        // Update Activity Chart
        const activities = this.entries.filter(e => e.activities).slice(-7);
        if (activities.length > 0) {
            const avgSteps = Math.round(activities.reduce((sum, e) => sum + e.activities.steps, 0) / activities.length);
            const avgWater = Math.round(activities.reduce((sum, e) => sum + e.activities.water, 0) / activities.length);
            const avgSleep = (activities.reduce((sum, e) => sum + e.activities.sleep, 0) / activities.length).toFixed(1);
            const avgExercise = Math.round(activities.reduce((sum, e) => sum + e.activities.exercise, 0) / activities.length);
            
            this.charts.activity.data.datasets[0].data = [avgSteps, avgWater, avgSleep, avgExercise];
            this.charts.activity.update();
        }

        // Update Goals Chart
        const completedGoals = this.goals.filter(g => g.completed).length;
        const activeGoals = this.goals.filter(g => !g.completed).length;
        this.charts.goals.data.datasets[0].data = [completedGoals, activeGoals];
        this.charts.goals.update();

        // Update Tags Chart
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

    // Insights Page Functions
    renderInsights() {
        this.renderMoodInsights();
        this.renderAchievementsInsights();
        this.renderPatternsInsights();
        this.renderRecommendationsInsights();
    }

    renderMoodInsights() {
        const container = document.getElementById('moodInsights');
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
        
        document.getElementById('totalDays').textContent = totalDays;
        document.getElementById('avgMood').textContent = avgMood.toFixed(1);
        document.getElementById('completedGoals').textContent = completedGoals;
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
}

// Initialize the application
let journal;
document.addEventListener('DOMContentLoaded', () => {
    journal = new LifeJournal();
});
