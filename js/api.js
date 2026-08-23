class API {
    constructor() {
        this.baseUrl = APP_CONFIG.API_BASE;
    }

    async request(endpoint, method = 'GET', data = null) {
        const url = new URL(this.baseUrl);
        url.searchParams.append('path', endpoint);

        const session = localStorage.getItem(APP_CONFIG.SESSION_KEY);
        if (session && !endpoint.startsWith('admin')) {
            url.searchParams.append('session', session);
        }

        const options = { method, headers: { 'Content-Type': 'application/json' } };
        if (data && method !== 'GET') {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url.toString(), options);
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return { success: false, error: 'Network error occurred' };
        }
    }

    // Public
    async getSettings() { return this.request('settings'); }
    async getHome() { return this.request('home'); }
    async getCourses() { return this.request('courses'); }
    async getCourse(courseId) { return this.request('course?id=' + courseId); }
    async getNotices() { return this.request('notices'); }
    async getArticles() { return this.request('articles'); }
    async getArticle(articleId) { return this.request('article?id=' + articleId); }
    async getGallery() { return this.request('gallery'); }
    async getVideos() { return this.request('videos'); }
    async getTeachers() { return this.request('teachers'); }
    async submitCourseRequest(data) { return this.request('course-request', 'POST', data); }

    // Auth
    async login(username, password) {
        const deviceId = getDeviceId();
        const result = await this.request('login', 'POST', { username, password, deviceId });
        if (result.success && result.session) {
            localStorage.setItem(APP_CONFIG.SESSION_KEY, result.session);
        }
        return result;
    }

    async logout() {
        const session = localStorage.getItem(APP_CONFIG.SESSION_KEY);
        await this.request('logout', 'POST', { sessionToken: session });
        localStorage.removeItem(APP_CONFIG.SESSION_KEY);
    }

    async getCurrentUser() { return this.request('me'); }
    async getMyCourses() { return this.request('my-courses'); }
    async getLesson(lessonId) { return this.request('lesson?id=' + lessonId); }

    // Admin
    async adminLogin(username, password) {
        const result = await this.request('admin?action=login', 'POST', { username, password });
        if (result.success && result.session) {
            localStorage.setItem(APP_CONFIG.ADMIN_SESSION_KEY, result.session);
        }
        return result;
    }

    async adminLogout() {
        const session = localStorage.getItem(APP_CONFIG.ADMIN_SESSION_KEY);
        await this.request('admin?action=logout', 'POST', { sessionToken: session });
        localStorage.removeItem(APP_CONFIG.ADMIN_SESSION_KEY);
    }

    async adminRequest(action, data = {}) {
        const session = localStorage.getItem(APP_CONFIG.ADMIN_SESSION_KEY);
        if (!session) return { success: false, error: 'Not authenticated' };
        return this.request('admin?action=' + action, 'POST', { ...data, sessionToken: session });
    }

    async getStudents() { return this.adminRequest('students'); }
    async createStudent(data) { return this.adminRequest('create-student', data); }
    async updateStudent(data) { return this.adminRequest('update-student', data); }
    async resetPassword(data) { return this.adminRequest('reset-password', data); }
    async resetDevice(data) { return this.adminRequest('reset-device', data); }
    async createCourse(data) { return this.adminRequest('create-course', data); }
    async updateCourse(data) { return this.adminRequest('update-course', data); }
    async grantAccess(data) { return this.adminRequest('grant-access', data); }
    async revokeAccess(data) { return this.adminRequest('revoke-access', data); }
    async createLesson(data) { return this.adminRequest('create-lesson', data); }
    async updateLesson(data) { return this.adminRequest('update-lesson', data); }
    async createNotice(data) { return this.adminRequest('create-notice', data); }
    async updateNotice(data) { return this.adminRequest('update-notice', data); }
    async createArticle(data) { return this.adminRequest('create-article', data); }
    async updateArticle(data) { return this.adminRequest('update-article', data); }
    async createGallerySection(data) { return this.adminRequest('create-gallery-section', data); }
    async createGalleryImage(data) { return this.adminRequest('create-gallery-image', data); }
    async createTeacher(data) { return this.adminRequest('create-teacher', data); }
    async updateTeacher(data) { return this.adminRequest('update-teacher', data); }
    async deleteTeacher(data) { return this.adminRequest('delete-teacher', data); }
    async updateSettings(data) { return this.adminRequest('update-settings', data); }
    async getLogs() { return this.adminRequest('logs'); }
    async changeAdminPassword(data) { return this.adminRequest('change-password', data); }
    async getCourseRequests() { return this.adminRequest('course-requests'); }
    async updateCourseRequest(data) { return this.adminRequest('update-request', data); }
    async getAdminDashboard() { return this.adminRequest('dashboard'); }
}

const api = new API();
