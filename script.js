// Main Application
class StudySyncApp {
    constructor() {
        this.currentUser = null;
        this.isLoggedIn = false;
        this.schedules = [];
        this.reminders = [];
        this.currentPage = 'login';
        this.timerInterval = null;
        this.timerSeconds = 25 * 60; // 25 minutes
        this.timerRunning = false;
        this.quotes = [
            "The secret of getting ahead is getting started. - Mark Twain",
            "Don't watch the clock; do what it does. Keep going. - Sam Levenson",
            "The future depends on what you do today. - Mahatma Gandhi",
            "It's not about having time, it's about making time. - Unknown",
            "Success is the sum of small efforts, repeated day in and day out. - Robert Collier",
            "The only way to do great work is to love what you do. - Steve Jobs",
            "Your time is limited, don't waste it living someone else's life. - Steve Jobs",
            "The harder you work for something, the greater you'll feel when you achieve it. - Unknown",
            "Dream big and dare to fail. - Norman Vaughan",
            "Education is the most powerful weapon which you can use to change the world. - Nelson Mandela"
        ];
        this.init();
    }

    init() {
        this.loadFromStorage();
        this.setupEventListeners();
        this.renderPage(this.currentPage);
    }

    loadFromStorage() {
        // Try to load user from localStorage
        const userData = localStorage.getItem('studysync_user');
        if (userData) {
            this.currentUser = JSON.parse(userData);
            this.isLoggedIn = true;
            this.currentPage = 'dashboard';
        }

        // Load schedules
        const schedulesData = localStorage.getItem('studysync_schedules');
        if (schedulesData) {
            this.schedules = JSON.parse(schedulesData);
        }

        // Load reminders
        const remindersData = localStorage.getItem('studysync_reminders');
        if (remindersData) {
            this.reminders = JSON.parse(remindersData);
        }

        // Load timer state
        const timerState = localStorage.getItem('studysync_timer');
        if (timerState) {
            const timerData = JSON.parse(timerState);
            this.timerSeconds = timerData.seconds;
            this.timerRunning = timerData.running;
        }
    }

    saveToStorage() {
        if (this.currentUser) {
            localStorage.setItem('studysync_user', JSON.stringify(this.currentUser));
        }
        localStorage.setItem('studysync_schedules', JSON.stringify(this.schedules));
        localStorage.setItem('studysync_reminders', JSON.stringify(this.reminders));

        // Save timer state
        localStorage.setItem('studysync_timer', JSON.stringify({
            seconds: this.timerSeconds,
            running: this.timerRunning
        }));
    }

    setupEventListeners() {
        // Navigation
        document.addEventListener('click', (e) => {
            const navLink = e.target.closest('[data-page]');
            if (navLink) {
                e.preventDefault();
                const page = navLink.dataset.page;
                if (page !== 'login' && page !== 'signup' && !this.isLoggedIn) {
                    this.renderPage('login');
                } else {
                    this.renderPage(page);
                }
            }

            // Logout button
            if (e.target.id === 'logout-btn' || e.target.closest('#logout-btn')) {
                e.preventDefault();
                this.logout();
            }

            // Add schedule buttons
            if (e.target.id === 'add-schedule-btn' || e.target.id === 'add-schedule-full-btn') {
                e.preventDefault();
                this.showScheduleModal();
            }

            // Add reminder buttons
            if (e.target.id === 'add-reminder-btn' || e.target.id === 'add-reminder-full-btn') {
                e.preventDefault();
                this.showReminderModal();
            }

            // Edit profile button
            if (e.target.id === 'edit-profile-btn') {
                e.preventDefault();
                this.showProfileModal();
            }

            // Show signup/login links
            if (e.target.id === 'show-signup') {
                e.preventDefault();
                this.renderPage('signup');
            }

            if (e.target.id === 'show-login') {
                e.preventDefault();
                this.renderPage('login');
            }

            // Mobile menu
            if (e.target.id === 'mobile-menu-btn') {
                this.showMobileMenu();
            }

            // User dropdown
            if (e.target.closest('#user-avatar')) {
                document.getElementById('user-dropdown').classList.toggle('active');
            }

            // Timer buttons
            if (e.target.id === 'start-timer-btn') {
                this.startTimer();
            }

            if (e.target.id === 'pause-timer-btn') {
                this.pauseTimer();
            }

            if (e.target.id === 'reset-timer-btn') {
                this.resetTimer();
            }

            // Timer presets
            if (e.target.classList.contains('btn-preset')) {
                const minutes = parseInt(e.target.dataset.minutes);
                this.setTimer(minutes);
            }

            // New quote button
            if (e.target.id === 'new-quote-btn') {
                this.showRandomQuote();
            }
        });

        // Form submissions
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'login-form') {
                e.preventDefault();
                this.handleLogin();
            }

            if (e.target.id === 'signup-form') {
                e.preventDefault();
                this.handleSignup();
            }
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.dropdown')) {
                const dropdown = document.getElementById('user-dropdown');
                if (dropdown) dropdown.classList.remove('active');
            }
        });
    }

    renderPage(pageName) {
        const mainContent = document.getElementById('main-content');
        const template = document.getElementById(`${pageName}-template`);

        if (template) {
            mainContent.innerHTML = template.innerHTML;
            this.currentPage = pageName;
            this.updatePageContent();
        }
    }

    updatePageContent() {
        if (this.currentPage === 'dashboard') {
            this.renderDashboard();
        } else if (this.currentPage === 'schedule') {
            this.renderSchedulePage();
        } else if (this.currentPage === 'reminders') {
            this.renderRemindersPage();
        } else if (this.currentPage === 'profile') {
            this.renderProfilePage();
        } else if (this.currentPage === 'about') {
            this.renderAboutPage();
        }

        // Update user menu visibility
        const userMenu = document.querySelector('.user-menu');
        if (userMenu) {
            userMenu.style.display = this.isLoggedIn ? 'flex' : 'none';
        }

        // Update avatar
        if (this.isLoggedIn && this.currentUser) {
            this.updateProfilePicture();
        }
    }

    renderDashboard() {
        // Update welcome message
        if (this.isLoggedIn && this.currentUser) {
            const welcomeElement = document.getElementById('welcome-user');
            if (welcomeElement) {
                welcomeElement.textContent = this.currentUser.name.split(' ')[0];
            }
        }

        // Render today's schedules
        this.renderTodaySchedules();

        // Render today's reminders
        this.renderTodayReminders();

        // Update stats
        this.updateStats();

        // Show random quote
        this.showRandomQuote();

        // Update timer display
        this.updateTimerDisplay();

        // Setup timer events if not already set up
        this.setupTimerEvents();
    }

    renderTodaySchedules() {
        const container = document.getElementById('today-schedule-list');
        if (!container) return;

        const today = new Date().toISOString().split('T')[0];
        const todaySchedules = this.schedules.filter(s => s.date === today);

        if (todaySchedules.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-day"></i>
                    <p>No schedule for today. Add something to get started!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = todaySchedules.map(schedule => `
            <div class="schedule-item ${schedule.priority === 'high' ? 'urgent' : ''}">
                <div class="item-header">
                    <div class="item-title">${schedule.title}</div>
                    <div class="item-time">${this.formatTime(schedule.time)}</div>
                </div>
                <div class="item-desc">${schedule.description}</div>
                <div class="item-actions">
                    <button class="btn btn-outline btn-small" onclick="app.editSchedule('${schedule.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-danger btn-small" onclick="app.deleteSchedule('${schedule.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderTodayReminders() {
        const container = document.getElementById('upcoming-reminders-list');
        if (!container) return;

        const today = new Date().toISOString().split('T')[0];
        const todayReminders = this.reminders.filter(r => r.date === today);

        if (todayReminders.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-bell"></i>
                    <p>No reminders for today. Add one to stay on track!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = todayReminders.map(reminder => `
            <div class="reminder-item ${reminder.priority === 'high' ? 'urgent' : ''}">
                <div class="item-header">
                    <div class="item-title">${reminder.title}</div>
                    <div class="item-time">${this.formatTime(reminder.time)}</div>
                </div>
                <div class="item-desc">${reminder.description}</div>
                <div class="item-actions">
                    <button class="btn btn-outline btn-small" onclick="app.editReminder('${reminder.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-danger btn-small" onclick="app.deleteReminder('${reminder.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderSchedulePage() {
        const container = document.getElementById('full-schedule-list');
        if (!container) return;

        if (this.schedules.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-plus"></i>
                    <p>No schedules yet. Create your first schedule item!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.schedules.map(schedule => `
            <div class="schedule-item ${schedule.priority === 'high' ? 'urgent' : ''}">
                <div class="item-header">
                    <div class="item-title">${schedule.title}</div>
                    <div class="item-time">${this.formatDate(schedule.date)} at ${this.formatTime(schedule.time)}</div>
                </div>
                <div class="item-desc">${schedule.description}</div>
                <div class="item-actions">
                    <button class="btn btn-outline btn-small" onclick="app.editSchedule('${schedule.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-danger btn-small" onclick="app.deleteSchedule('${schedule.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');

        // Render mini calendar
        this.renderMiniCalendar();
    }

    renderRemindersPage() {
        const container = document.getElementById('full-reminders-list');
        if (!container) return;

        if (this.reminders.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-bell-slash"></i>
                    <p>No reminders yet. Create your first reminder!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.reminders.map(reminder => `
            <div class="reminder-item ${reminder.priority === 'high' ? 'urgent' : ''}">
                <div class="item-header">
                    <div class="item-title">${reminder.title}</div>
                    <div class="item-time">${this.formatDate(reminder.date)} at ${this.formatTime(reminder.time)}</div>
                </div>
                <div class="item-desc">${reminder.description}</div>
                <div class="item-actions">
                    <button class="btn btn-outline btn-small" onclick="app.editReminder('${reminder.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-danger btn-small" onclick="app.deleteReminder('${reminder.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');

        // Render priority chart
        this.renderPriorityChart();
    }

    renderProfilePage() {
        if (!this.isLoggedIn || !this.currentUser) return;

        const elements = {
            'profile-name': this.currentUser.name,
            'profile-email': this.currentUser.email,
            'profile-fullname': this.currentUser.name,
            'profile-email-text': this.currentUser.email,
            'profile-student-id': this.currentUser.studentId || 'Not set',
            'profile-major': this.currentUser.major || 'Not specified'
        };

        Object.keys(elements).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = elements[id];
            }
        });

        // Update profile picture
        this.updateProfilePicture();

        // Setup profile picture upload event listeners
        this.setupProfilePictureEvents();

        // Update study statistics
        this.updateStudyStats();
    }

    renderAboutPage() {
        // About page is static, no dynamic content needed
        // The template already contains all the content
    }

    updateStats() {
        const container = document.getElementById('quick-stats');
        if (!container) return;

        const today = new Date().toISOString().split('T')[0];
        const todaySchedules = this.schedules.filter(s => s.date === today).length;
        const todayReminders = this.reminders.filter(r => r.date === today).length;

        container.innerHTML = `
            <div style="margin-bottom: 15px;">
                <p style="color: var(--gray); margin-bottom: 5px;">Today's Tasks</p>
                <h2 style="color: var(--primary);">${todaySchedules + todayReminders}</h2>
            </div>
            <div style="margin-bottom: 15px;">
                <p style="color: var(--gray); margin-bottom: 5px;">Total Schedules</p>
                <h2 style="color: var(--warning);">${this.schedules.length}</h2>
            </div>
            <div>
                <p style="color: var(--gray); margin-bottom: 5px;">Total Reminders</p>
                <h2 style="color: var(--success);">${this.reminders.length}</h2>
            </div>
        `;
    }

    updateStudyStats() {
        // Calculate study statistics
        const totalStudyHours = this.schedules.reduce((total, schedule) => total + (schedule.duration || 60), 0) / 60;
        const tasksCompleted = this.schedules.filter(s => s.completed).length + this.reminders.filter(r => r.completed).length;

        // Calculate current streak (simple implementation)
        const today = new Date().toISOString().split('T')[0];
        const hasActivityToday = this.schedules.some(s => s.date === today) || this.reminders.some(r => r.date === today);
        const currentStreak = hasActivityToday ? 3 : 0; // Simplified for demo

        // Update display
        const totalStudyHoursEl = document.getElementById('total-study-hours');
        const tasksCompletedEl = document.getElementById('tasks-completed');
        const currentStreakEl = document.getElementById('current-streak');

        if (totalStudyHoursEl) totalStudyHoursEl.textContent = Math.round(totalStudyHours);
        if (tasksCompletedEl) tasksCompletedEl.textContent = tasksCompleted;
        if (currentStreakEl) currentStreakEl.textContent = currentStreak;
    }

    updateProfilePicture() {
        const avatar = document.getElementById('profile-avatar-large');
        const headerAvatar = document.getElementById('user-avatar');

        if (!avatar) return;

        if (this.currentUser && this.currentUser.profilePicture) {
            // If user has a profile picture
            avatar.innerHTML = `<img src="${this.currentUser.profilePicture}" alt="Profile Picture">`;
            if (headerAvatar) {
                headerAvatar.innerHTML = `<img src="${this.currentUser.profilePicture}" alt="Profile Picture" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
            }
        } else {
            // Show initials if no profile picture
            const initials = this.getInitials(this.currentUser.name);
            avatar.textContent = initials;
            avatar.style.background = 'linear-gradient(135deg, var(--primary), var(--secondary))';

            if (headerAvatar) {
                headerAvatar.textContent = initials;
                headerAvatar.style.background = 'linear-gradient(135deg, var(--primary), var(--secondary))';
            }
        }
    }

    setupProfilePictureEvents() {
        const uploadBtn = document.getElementById('upload-picture-btn');
        const removeBtn = document.getElementById('remove-picture-btn');
        const fileInput = document.getElementById('profile-picture-input');

        if (uploadBtn) {
            uploadBtn.addEventListener('click', () => {
                fileInput.click();
            });
        }

        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                this.handleProfilePictureUpload(e.target.files[0]);
            });
        }

        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                this.removeProfilePicture();
            });
        }
    }

    handleProfilePictureUpload(file) {
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            this.showNotification('Please select an image file', 'error');
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            this.showNotification('Image size should be less than 5MB', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            // Store the base64 image data
            this.currentUser.profilePicture = e.target.result;
            localStorage.setItem('studysync_user', JSON.stringify(this.currentUser));

            // Update the profile picture display
            this.updateProfilePicture();
            this.showNotification('Profile picture updated successfully!', 'success');
        };

        reader.onerror = () => {
            this.showNotification('Error reading image file', 'error');
        };

        reader.readAsDataURL(file);
    }

    removeProfilePicture() {
        if (this.currentUser && this.currentUser.profilePicture) {
            delete this.currentUser.profilePicture;
            localStorage.setItem('studysync_user', JSON.stringify(this.currentUser));

            // Update the profile picture display
            this.updateProfilePicture();
            this.showNotification('Profile picture removed', 'success');
        } else {
            this.showNotification('No profile picture to remove', 'info');
        }
    }

    renderMiniCalendar() {
        const container = document.getElementById('mini-calendar');
        if (!container) return;

        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();

        let calendarHTML = '';

        // Day headers
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayNames.forEach(day => {
            calendarHTML += `<div class="calendar-day" style="font-weight: bold; color: var(--primary);">${day}</div>`;
        });

        // Empty cells for days before the first day of the month
        for (let i = 0; i < startingDay; i++) {
            calendarHTML += `<div class="calendar-day" style="opacity: 0.3;"></div>`;
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const hasEvent = this.schedules.some(s => s.date === dateStr) || this.reminders.some(r => r.date === dateStr);
            const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();

            let dayClass = 'calendar-day';
            if (isToday) dayClass += ' today';
            if (hasEvent) dayClass += ' has-event';

            calendarHTML += `<div class="${dayClass}">${day}</div>`;
        }

        container.innerHTML = calendarHTML;
    }

    renderPriorityChart() {
        const container = document.getElementById('priority-chart');
        if (!container) return;

        const highPriority = this.reminders.filter(r => r.priority === 'high').length;
        const mediumPriority = this.reminders.filter(r => r.priority === 'medium').length;
        const lowPriority = this.reminders.filter(r => r.priority === 'low').length;
        const total = highPriority + mediumPriority + lowPriority;

        const highPercent = total > 0 ? (highPriority / total) * 100 : 0;
        const mediumPercent = total > 0 ? (mediumPriority / total) * 100 : 0;
        const lowPercent = total > 0 ? (lowPriority / total) * 100 : 0;

        container.innerHTML = `
            <div class="priority-bar">
                <div class="priority-label">High Priority</div>
                <div class="priority-indicator">
                    <div class="priority-fill high" style="width: ${highPercent}%"></div>
                </div>
                <div class="priority-count">${highPriority}</div>
            </div>
            <div class="priority-bar">
                <div class="priority-label">Medium Priority</div>
                <div class="priority-indicator">
                    <div class="priority-fill medium" style="width: ${mediumPercent}%"></div>
                </div>
                <div class="priority-count">${mediumPriority}</div>
            </div>
            <div class="priority-bar">
                <div class="priority-label">Low Priority</div>
                <div class="priority-indicator">
                    <div class="priority-fill low" style="width: ${lowPercent}%"></div>
                </div>
                <div class="priority-count">${lowPriority}</div>
            </div>
        `;
    }

    showRandomQuote() {
        const quoteElement = document.getElementById('daily-quote');
        if (quoteElement) {
            const randomIndex = Math.floor(Math.random() * this.quotes.length);
            quoteElement.textContent = this.quotes[randomIndex];
        }
    }

    setupTimerEvents() {
        // Timer events are already set up in the main event listener
        // This method is just for organization
    }

    updateTimerDisplay() {
        const display = document.getElementById('timer-display');
        if (display) {
            const minutes = Math.floor(this.timerSeconds / 60);
            const seconds = this.timerSeconds % 60;
            display.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }

        // Update button states
        const startBtn = document.getElementById('start-timer-btn');
        const pauseBtn = document.getElementById('pause-timer-btn');

        if (startBtn && pauseBtn) {
            if (this.timerRunning) {
                startBtn.disabled = true;
                pauseBtn.disabled = false;
                startBtn.innerHTML = '<i class="fas fa-play"></i> Running';
            } else {
                startBtn.disabled = false;
                pauseBtn.disabled = true;
                startBtn.innerHTML = '<i class="fas fa-play"></i> Start';
            }
        }
    }

    startTimer() {
        if (!this.timerRunning) {
            this.timerRunning = true;
            this.timerInterval = setInterval(() => {
                this.timerSeconds--;
                this.updateTimerDisplay();

                if (this.timerSeconds <= 0) {
                    this.timerComplete();
                }

                this.saveToStorage();
            }, 1000);

            this.updateTimerDisplay();
            this.showNotification('Timer started!', 'success');
        }
    }

    pauseTimer() {
        if (this.timerRunning) {
            this.timerRunning = false;
            clearInterval(this.timerInterval);
            this.updateTimerDisplay();
            this.showNotification('Timer paused', 'info');
        }
    }

    resetTimer() {
        this.timerRunning = false;
        clearInterval(this.timerInterval);
        this.timerSeconds = 25 * 60; // Reset to 25 minutes
        this.updateTimerDisplay();
        this.showNotification('Timer reset', 'info');
    }

    setTimer(minutes) {
        this.timerRunning = false;
        clearInterval(this.timerInterval);
        this.timerSeconds = minutes * 60;
        this.updateTimerDisplay();
        this.showNotification(`Timer set to ${minutes} minutes`, 'info');
    }

    timerComplete() {
        this.timerRunning = false;
        clearInterval(this.timerInterval);
        this.showNotification('Timer complete! Time for a break.', 'success');

        // Play notification sound if browser supports it
        this.playNotificationSound();
    }

    playNotificationSound() {
        // Create a simple notification sound
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 1);
        } catch (e) {
            console.log('Audio context not supported');
        }
    }

    async handleLogin() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        if (!email || !password) {
            this.showNotification('Please enter both email and password', 'error');
            return;
        }

        // Simple authentication (in real app, this would be server-side)
        const userData = localStorage.getItem('studysync_user');
        if (userData) {
            const user = JSON.parse(userData);
            if (user.email === email && user.password === password) {
                this.currentUser = user;
                this.isLoggedIn = true;
                this.showNotification('Login successful!', 'success');
                this.renderPage('dashboard');
                return;
            }
        }

        // If no user exists, create a demo user
        const demoUser = {
            id: 'user_' + Date.now(),
            name: 'Demo Student',
            email: email,
            password: password,
            studentId: 'STU' + Math.floor(100000 + Math.random() * 900000),
            major: 'Computer Science'
        };

        this.currentUser = demoUser;
        this.isLoggedIn = true;
        localStorage.setItem('studysync_user', JSON.stringify(demoUser));
        this.showNotification('Welcome to StudySync!', 'success');
        this.renderPage('dashboard');
    }

    async handleSignup() {
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;
        const terms = document.getElementById('terms').checked;

        if (!terms) {
            this.showNotification('You must agree to the terms and conditions', 'error');
            return;
        }

        if (password !== confirmPassword) {
            this.showNotification('Passwords do not match', 'error');
            return;
        }

        // Create new user
        const newUser = {
            id: 'user_' + Date.now(),
            name: name,
            email: email,
            password: password,
            studentId: 'STU' + Math.floor(100000 + Math.random() * 900000),
            major: ''
        };

        this.currentUser = newUser;
        this.isLoggedIn = true;
        localStorage.setItem('studysync_user', JSON.stringify(newUser));

        // Create demo data for new user
        this.createDemoData();

        this.showNotification('Account created successfully!', 'success');
        this.renderPage('dashboard');
    }

    createDemoData() {
        // Create demo schedules
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        this.schedules = [
            {
                id: 'schedule_1',
                title: 'Math Lecture',
                description: 'Calculus II - Room 302',
                date: today.toISOString().split('T')[0],
                time: '09:00',
                duration: 60,
                priority: 'high'
            },
            {
                id: 'schedule_2',
                title: 'Study Group',
                description: 'Physics study session at library',
                date: today.toISOString().split('T')[0],
                time: '14:00',
                duration: 90,
                priority: 'medium'
            }
        ];

        // Create demo reminders
        this.reminders = [
            {
                id: 'reminder_1',
                title: 'Submit Math Assignment',
                description: 'Chapter 5 exercises due',
                date: today.toISOString().split('T')[0],
                time: '23:59',
                type: 'assignment',
                priority: 'high'
            },
            {
                id: 'reminder_2',
                title: 'Meet with Advisor',
                description: 'Discuss course selection',
                date: tomorrow.toISOString().split('T')[0],
                time: '15:30',
                type: 'meeting',
                priority: 'medium'
            }
        ];

        this.saveToStorage();
    }

    logout() {
        if (confirm('Are you sure you want to logout?')) {
            this.currentUser = null;
            this.isLoggedIn = false;
            this.timerRunning = false;
            clearInterval(this.timerInterval);
            this.showNotification('Logged out successfully', 'success');
            this.renderPage('login');
        }
    }

    showScheduleModal(scheduleId = null) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${scheduleId ? 'Edit' : 'Add New'} Schedule</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="schedule-form">
                        <div class="form-group">
                            <label for="modal-schedule-title">Title *</label>
                            <input type="text" id="modal-schedule-title" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label for="modal-schedule-desc">Description</label>
                            <textarea id="modal-schedule-desc" class="form-control" rows="3"></textarea>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                            <div class="form-group">
                                <label for="modal-schedule-date">Date *</label>
                                <input type="date" id="modal-schedule-date" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label for="modal-schedule-time">Time *</label>
                                <input type="time" id="modal-schedule-time" class="form-control" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="modal-schedule-priority">Priority</label>
                            <select id="modal-schedule-priority" class="form-control">
                                <option value="low">Low</option>
                                <option value="medium" selected>Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                        <input type="hidden" id="modal-schedule-id" value="${scheduleId || ''}">
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" id="cancel-schedule">Cancel</button>
                    <button class="btn btn-primary" id="save-schedule">Save Schedule</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Set default date to today
        document.getElementById('modal-schedule-date').value = new Date().toISOString().split('T')[0];
        document.getElementById('modal-schedule-time').value = '09:00';

        // If editing, load schedule data
        if (scheduleId) {
            const schedule = this.schedules.find(s => s.id === scheduleId);
            if (schedule) {
                document.getElementById('modal-schedule-title').value = schedule.title;
                document.getElementById('modal-schedule-desc').value = schedule.description;
                document.getElementById('modal-schedule-date').value = schedule.date;
                document.getElementById('modal-schedule-time').value = schedule.time;
                document.getElementById('modal-schedule-priority').value = schedule.priority;
            }
        }

        // Setup modal events
        modal.querySelector('.close-modal').addEventListener('click', () => this.closeModal(modal));
        modal.querySelector('#cancel-schedule').addEventListener('click', () => this.closeModal(modal));
        modal.querySelector('#save-schedule').addEventListener('click', () => this.saveSchedule(modal, scheduleId));
    }

    showReminderModal(reminderId = null) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${reminderId ? 'Edit' : 'Add New'} Reminder</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="reminder-form">
                        <div class="form-group">
                            <label for="modal-reminder-title">Title *</label>
                            <input type="text" id="modal-reminder-title" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label for="modal-reminder-desc">Description</label>
                            <textarea id="modal-reminder-desc" class="form-control" rows="3"></textarea>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                            <div class="form-group">
                                <label for="modal-reminder-date">Date *</label>
                                <input type="date" id="modal-reminder-date" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label for="modal-reminder-time">Time *</label>
                                <input type="time" id="modal-reminder-time" class="form-control" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="modal-reminder-type">Reminder Type</label>
                            <select id="modal-reminder-type" class="form-control">
                                <option value="assignment">Assignment</option>
                                <option value="exam">Exam</option>
                                <option value="meeting" selected>Meeting</option>
                                <option value="personal">Personal</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <input type="hidden" id="modal-reminder-id" value="${reminderId || ''}">
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" id="cancel-reminder">Cancel</button>
                    <button class="btn btn-secondary" id="save-reminder">Save Reminder</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Set default date to today
        document.getElementById('modal-reminder-date').value = new Date().toISOString().split('T')[0];
        document.getElementById('modal-reminder-time').value = '12:00';

        // If editing, load reminder data
        if (reminderId) {
            const reminder = this.reminders.find(r => r.id === reminderId);
            if (reminder) {
                document.getElementById('modal-reminder-title').value = reminder.title;
                document.getElementById('modal-reminder-desc').value = reminder.description;
                document.getElementById('modal-reminder-date').value = reminder.date;
                document.getElementById('modal-reminder-time').value = reminder.time;
                document.getElementById('modal-reminder-type').value = reminder.type;
            }
        }

        // Setup modal events
        modal.querySelector('.close-modal').addEventListener('click', () => this.closeModal(modal));
        modal.querySelector('#cancel-reminder').addEventListener('click', () => this.closeModal(modal));
        modal.querySelector('#save-reminder').addEventListener('click', () => this.saveReminder(modal, reminderId));
    }

    showProfileModal() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Edit Profile</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="profile-form">
                        <div class="form-group">
                            <label for="modal-profile-name">Full Name *</label>
                            <input type="text" id="modal-profile-name" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label for="modal-profile-email">Email *</label>
                            <input type="email" id="modal-profile-email" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label for="modal-profile-student-id">Student ID</label>
                            <input type="text" id="modal-profile-student-id" class="form-control">
                        </div>
                        <div class="form-group">
                            <label for="modal-profile-major">Major</label>
                            <input type="text" id="modal-profile-major" class="form-control">
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" id="cancel-profile">Cancel</button>
                    <button class="btn btn-primary" id="save-profile">Save Changes</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Load current user data
        if (this.currentUser) {
            document.getElementById('modal-profile-name').value = this.currentUser.name;
            document.getElementById('modal-profile-email').value = this.currentUser.email;
            document.getElementById('modal-profile-student-id').value = this.currentUser.studentId || '';
            document.getElementById('modal-profile-major').value = this.currentUser.major || '';
        }

        // Setup modal events
        modal.querySelector('.close-modal').addEventListener('click', () => this.closeModal(modal));
        modal.querySelector('#cancel-profile').addEventListener('click', () => this.closeModal(modal));
        modal.querySelector('#save-profile').addEventListener('click', () => this.saveProfile(modal));
    }

    showMobileMenu() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 300px; margin: 20px;">
                <div class="modal-header">
                    <h3>Menu</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="display: flex; flex-direction: column; gap: 15px;">
                        <a href="#" class="dropdown-item" data-page="dashboard">
                            <i class="fas fa-home"></i> Dashboard
                        </a>
                        <a href="#" class="dropdown-item" data-page="schedule">
                            <i class="fas fa-calendar"></i> Schedule
                        </a>
                        <a href="#" class="dropdown-item" data-page="reminders">
                            <i class="fas fa-bell"></i> Reminders
                        </a>
                        <a href="#" class="dropdown-item" data-page="profile">
                            <i class="fas fa-user"></i> Profile
                        </a>
                        <a href="#" class="dropdown-item" data-page="about">
                            <i class="fas fa-info-circle"></i> About Us
                        </a>
                        <hr>
                        <a href="#" class="dropdown-item" id="mobile-logout">
                            <i class="fas fa-sign-out-alt"></i> Logout
                        </a>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Setup modal events
        modal.querySelector('.close-modal').addEventListener('click', () => this.closeModal(modal));
        modal.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.id === 'mobile-logout') {
                    this.logout();
                }
                this.closeModal(modal);
            });
        });
    }

    closeModal(modal) {
        if (modal && modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
    }

    saveSchedule(modal, scheduleId = null) {
        const title = document.getElementById('modal-schedule-title').value;
        const description = document.getElementById('modal-schedule-desc').value;
        const date = document.getElementById('modal-schedule-date').value;
        const time = document.getElementById('modal-schedule-time').value;
        const priority = document.getElementById('modal-schedule-priority').value;

        if (!title || !date || !time) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        const schedule = {
            id: scheduleId || 'schedule_' + Date.now(),
            title,
            description,
            date,
            time,
            priority,
            duration: 60 // Default duration
        };

        if (scheduleId) {
            // Update existing schedule
            const index = this.schedules.findIndex(s => s.id === scheduleId);
            if (index !== -1) {
                this.schedules[index] = schedule;
            }
        } else {
            // Add new schedule
            this.schedules.push(schedule);
        }

        this.saveToStorage();
        this.showNotification('Schedule saved successfully!', 'success');
        this.closeModal(modal);
        this.updatePageContent();
    }

    saveReminder(modal, reminderId = null) {
        const title = document.getElementById('modal-reminder-title').value;
        const description = document.getElementById('modal-reminder-desc').value;
        const date = document.getElementById('modal-reminder-date').value;
        const time = document.getElementById('modal-reminder-time').value;
        const type = document.getElementById('modal-reminder-type').value;

        if (!title || !date || !time) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        const reminder = {
            id: reminderId || 'reminder_' + Date.now(),
            title,
            description,
            date,
            time,
            type,
            priority: 'medium'
        };

        if (reminderId) {
            // Update existing reminder
            const index = this.reminders.findIndex(r => r.id === reminderId);
            if (index !== -1) {
                this.reminders[index] = reminder;
            }
        } else {
            // Add new reminder
            this.reminders.push(reminder);
        }

        this.saveToStorage();
        this.showNotification('Reminder saved successfully!', 'success');
        this.closeModal(modal);
        this.updatePageContent();
    }

    saveProfile(modal) {
        const name = document.getElementById('modal-profile-name').value;
        const email = document.getElementById('modal-profile-email').value;
        const studentId = document.getElementById('modal-profile-student-id').value;
        const major = document.getElementById('modal-profile-major').value;

        if (!name || !email) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        this.currentUser.name = name;
        this.currentUser.email = email;
        this.currentUser.studentId = studentId;
        this.currentUser.major = major;

        localStorage.setItem('studysync_user', JSON.stringify(this.currentUser));
        this.showNotification('Profile updated successfully!', 'success');
        this.closeModal(modal);
        this.renderProfilePage();
    }

    editSchedule(id) {
        this.showScheduleModal(id);
    }

    editReminder(id) {
        this.showReminderModal(id);
    }

    deleteSchedule(id) {
        if (confirm('Are you sure you want to delete this schedule?')) {
            this.schedules = this.schedules.filter(s => s.id !== id);
            this.saveToStorage();
            this.showNotification('Schedule deleted successfully!', 'success');
            this.updatePageContent();
        }
    }

    deleteReminder(id) {
        if (confirm('Are you sure you want to delete this reminder?')) {
            this.reminders = this.reminders.filter(r => r.id !== id);
            this.saveToStorage();
            this.showNotification('Reminder deleted successfully!', 'success');
            this.updatePageContent();
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">&times;</button>
        `;

        document.body.appendChild(notification);

        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);

        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        });
    }

    formatTime(timeStr) {
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    }

    formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    }

    getInitials(name) {
        if (!name) return 'GS';
        const names = name.split(' ');
        if (names.length >= 2) {
            return (names[0].charAt(0) + names[1].charAt(0)).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }
    // Add to the setupEventListeners method:
    setupEventListeners() {
        // Navigation
        document.addEventListener('click', (e) => {
            const navLink = e.target.closest('[data-page]');
            if (navLink) {
                e.preventDefault();
                const page = navLink.dataset.page;
                if (page !== 'login' && page !== 'signup' && !this.isLoggedIn) {
                    this.renderPage('login');
                } else {
                    this.renderPage(page);
                }
            }

            // Logout button
            if (e.target.id === 'logout-btn' || e.target.closest('#logout-btn')) {
                e.preventDefault();
                this.logout();
            }

            // Add schedule buttons
            if (e.target.id === 'add-schedule-btn' || e.target.id === 'add-schedule-full-btn') {
                e.preventDefault();
                this.showScheduleModal();
            }

            // Add reminder buttons
            if (e.target.id === 'add-reminder-btn' || e.target.id === 'add-reminder-full-btn') {
                e.preventDefault();
                this.showReminderModal();
            }

            // Edit profile button
            if (e.target.id === 'edit-profile-btn') {
                e.preventDefault();
                this.showProfileModal();
            }

            // Show signup/login links
            if (e.target.id === 'show-signup') {
                e.preventDefault();
                this.renderPage('signup');
            }

            if (e.target.id === 'show-login') {
                e.preventDefault();
                this.renderPage('login');
            }

            // Mobile menu
            if (e.target.id === 'mobile-menu-btn') {
                this.showMobileMenu();
            }

            // User dropdown
            if (e.target.closest('#user-avatar')) {
                document.getElementById('user-dropdown').classList.toggle('active');
            }

            // Timer buttons
            if (e.target.id === 'start-timer-btn') {
                this.startTimer();
            }

            if (e.target.id === 'pause-timer-btn') {
                this.pauseTimer();
            }

            if (e.target.id === 'reset-timer-btn') {
                this.resetTimer();
            }

            // Timer presets
            if (e.target.classList.contains('btn-preset')) {
                const minutes = parseInt(e.target.dataset.minutes);
                this.setTimer(minutes);
            }

            // New quote button
            if (e.target.id === 'new-quote-btn') {
                this.showRandomQuote();
            }

            // Social login buttons - LOGIN PAGE
            if (e.target.id === 'google-auth' || e.target.closest('#google-auth')) {
                e.preventDefault();
                this.handleGoogleLogin();
            }

            if (e.target.id === 'facebook-auth' || e.target.closest('#facebook-auth')) {
                e.preventDefault();
                this.handleFacebookLogin();
            }

            if (e.target.id === 'github-auth' || e.target.closest('#github-auth')) {
                e.preventDefault();
                this.handleGitHubLogin();
            }

            if (e.target.id === 'microsoft-auth' || e.target.closest('#microsoft-auth')) {
                e.preventDefault();
                this.handleMicrosoftLogin();
            }

            // Social login buttons - SIGNUP PAGE
            if (e.target.id === 'google-auth-signup' || e.target.closest('#google-auth-signup')) {
                e.preventDefault();
                this.handleGoogleSignup();
            }

            if (e.target.id === 'facebook-auth-signup' || e.target.closest('#facebook-auth-signup')) {
                e.preventDefault();
                this.handleFacebookSignup();
            }

            if (e.target.id === 'github-auth-signup' || e.target.closest('#github-auth-signup')) {
                e.preventDefault();
                this.handleGitHubSignup();
            }

            if (e.target.id === 'microsoft-auth-signup' || e.target.closest('#microsoft-auth-signup')) {
                e.preventDefault();
                this.handleMicrosoftSignup();
            }
        });

        // Form submissions
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'login-form') {
                e.preventDefault();
                this.handleLogin();
            }

            if (e.target.id === 'signup-form') {
                e.preventDefault();
                this.handleSignup();
            }
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.dropdown')) {
                const dropdown = document.getElementById('user-dropdown');
                if (dropdown) dropdown.classList.remove('active');
            }
        });
    }

    // Add these social login methods to the StudySyncApp class:

    handleGoogleLogin() {
        this.showNotification('Google login would connect to Google OAuth in a real app', 'info');
        // Simulate Google login
        this.simulateSocialLogin('Google');
    }

    handleFacebookLogin() {
        this.showNotification('Facebook login would connect to Facebook OAuth in a real app', 'info');
        // Simulate Facebook login
        this.simulateSocialLogin('Facebook');
    }

    handleGitHubLogin() {
        this.showNotification('GitHub login would connect to GitHub OAuth in a real app', 'info');
        // Simulate GitHub login
        this.simulateSocialLogin('GitHub');
    }

    handleMicrosoftLogin() {
        this.showNotification('Microsoft login would connect to Microsoft OAuth in a real app', 'info');
        // Simulate Microsoft login
        this.simulateSocialLogin('Microsoft');
    }

    handleGoogleSignup() {
        this.showNotification('Google signup would connect to Google OAuth in a real app', 'info');
        this.simulateSocialSignup('Google');
    }

    handleFacebookSignup() {
        this.showNotification('Facebook signup would connect to Facebook OAuth in a real app', 'info');
        this.simulateSocialSignup('Facebook');
    }

    handleGitHubSignup() {
        this.showNotification('GitHub signup would connect to GitHub OAuth in a real app', 'info');
        this.simulateSocialSignup('GitHub');
    }

    handleMicrosoftSignup() {
        this.showNotification('Microsoft signup would connect to Microsoft OAuth in a real app', 'info');
        this.simulateSocialSignup('Microsoft');
    }

    simulateSocialLogin(provider) {
        // Create a demo user based on the provider
        const demoUser = {
            id: 'user_' + Date.now(),
            name: `${provider} User`,
            email: `${provider.toLowerCase()}user@example.com`,
            password: 'social_login_demo',
            studentId: 'STU' + Math.floor(100000 + Math.random() * 900000),
            major: 'Computer Science',
            profilePicture: this.getProviderAvatar(provider)
        };

        this.currentUser = demoUser;
        this.isLoggedIn = true;
        localStorage.setItem('studysync_user', JSON.stringify(demoUser));

        // Create demo data for new user
        this.createDemoData();

        this.showNotification(`Signed in with ${provider} successfully!`, 'success');
        this.renderPage('dashboard');
    }

    simulateSocialSignup(provider) {
        // Create a demo user based on the provider
        const demoUser = {
            id: 'user_' + Date.now(),
            name: `${provider} User`,
            email: `${provider.toLowerCase()}user@example.com`,
            password: 'social_signup_demo',
            studentId: 'STU' + Math.floor(100000 + Math.random() * 900000),
            major: 'Computer Science',
            profilePicture: this.getProviderAvatar(provider)
        };

        this.currentUser = demoUser;
        this.isLoggedIn = true;
        localStorage.setItem('studysync_user', JSON.stringify(demoUser));

        // Create demo data for new user
        this.createDemoData();

        this.showNotification(`Account created with ${provider} successfully!`, 'success');
        this.renderPage('dashboard');
    }

    getProviderAvatar(provider) {
        // Return different avatar URLs based on provider
        const avatars = {
            'Google': 'https://ui-avatars.com/api/?name=Google+User&background=DB4437&color=fff&size=150',
            'Facebook': 'https://ui-avatars.com/api/?name=Facebook+User&background=1877F2&color=fff&size=150',
            'GitHub': 'https://ui-avatars.com/api/?name=GitHub+User&background=333&color=fff&size=150',
            'Microsoft': 'https://ui-avatars.com/api/?name=Microsoft+User&background=00A4EF&color=fff&size=150'
        };

        return avatars[provider] || 'https://ui-avatars.com/api/?name=Student&background=4361ee&color=fff&size=150';
    }
}

// Initialize the app
const app = new StudySyncApp();
window.app = app; // Make it globally accessible