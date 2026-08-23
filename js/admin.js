document.addEventListener('DOMContentLoaded', function() {
    const session = localStorage.getItem(APP_CONFIG.ADMIN_SESSION_KEY);
    if (session) showDashboard();
    
    setupAdminLogin();
    setupAdminNav();
    setupAdminLogout();
});

function setupAdminLogin() {
    const form = document.getElementById('adminLoginForm');
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const username = document.getElementById('adminUser').value.trim();
        const password = document.getElementById('adminPass').value.trim();
        const msgDiv = document.getElementById('adminLoginMsg');
        
        msgDiv.className = 'form-message';
        msgDiv.textContent = 'লগইন হচ্ছে...';
        
        try {
            const result = await api.adminLogin(username, password);
            if (result.success) {
                msgDiv.className = 'form-message success';
                msgDiv.textContent = 'লগইন সফল!';
                showDashboard();
            } else {
                msgDiv.className = 'form-message error';
                msgDiv.textContent = result.error || 'লগইন ব্যর্থ হয়েছে।';
            }
        } catch (error) {
            msgDiv.className = 'form-message error';
            msgDiv.textContent = 'সার্ভারের সাথে যোগাযোগ করতে সমস্যা হয়েছে।';
        }
    });
}

function showDashboard() {
    document.getElementById('adminLogin').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'block';
    loadSection('dashboard');
}

function setupAdminLogout() {
    const btn = document.getElementById('adminLogoutBtn');
    if (btn) {
        btn.addEventListener('click', async function() {
            await api.adminLogout();
            localStorage.removeItem(APP_CONFIG.ADMIN_SESSION_KEY);
            document.getElementById('adminDashboard').style.display = 'none';
            document.getElementById('adminLogin').style.display = 'flex';
        });
    }
}

function setupAdminNav() {
    document.querySelectorAll('.admin-nav a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelectorAll('.admin-nav a').forEach(a => a.classList.remove('active'));
            this.classList.add('active');
            loadSection(this.dataset.section);
        });
    });
}

async function loadSection(section) {
    const content = document.getElementById('adminContent');
    content.innerHTML = '<p>লোড হচ্ছে...</p>';
    
    try {
        switch(section) {
            case 'dashboard': await loadDashboard(content); break;
            case 'students': await loadStudents(content); break;
            case 'courses': await loadCoursesAdmin(content); break;
            case 'access': await loadAccess(content); break;
            case 'lessons': await loadLessons(content); break;
            case 'notices': await loadNotices(content); break;
            case 'articles': await loadArticles(content); break;
            case 'gallery': await loadGallery(content); break;
            case 'teachers': await loadTeachers(content); break;
            case 'requests': await loadRequests(content); break;
            case 'settings': await loadSettingsAdmin(content); break;
            case 'logs': await loadLogs(content); break;
            case 'change-password': loadChangePassword(content); break;
            default: content.innerHTML = '<p>সেকশন পাওয়া যায়নি।</p>';
        }
    } catch (error) {
        content.innerHTML = `<p style="color:red;">লোড করতে সমস্যা হয়েছে: ${error.message}</p>`;
    }
}

async function loadDashboard(content) {
    const result = await api.getAdminDashboard();
    if (result.success && result.stats) {
        const stats = result.stats;
        content.innerHTML = `
            <h2>ড্যাশবোর্ড</h2>
            <div class="admin-stats">
                <div class="stat-card"><div class="number">${stats.totalStudents || 0}</div><div class="label">ছাত্র</div></div>
                <div class="stat-card"><div class="number">${stats.totalCourses || 0}</div><div class="label">কোর্স</div></div>
                <div class="stat-card"><div class="number">${stats.totalNotices || 0}</div><div class="label">নোটিস</div></div>
                <div class="stat-card"><div class="number">${stats.totalArticles || 0}</div><div class="label">আর্টিকেল</div></div>
                <div class="stat-card"><div class="number">${stats.pendingRequests || 0}</div><div class="label">পেন্ডিং রিকোয়েস্ট</div></div>
            </div>
            <p>স্বাগতম! বাম দিকের মেনু থেকে বিভিন্ন সেকশন ম্যানেজ করুন।</p>
        `;
    } else {
        content.innerHTML = '<p>ড্যাশবোর্ড লোড করতে সমস্যা হয়েছে।</p>';
    }
}

async function loadStudents(content) {
    const result = await api.getStudents();
    if (result.success && result.students) {
        content.innerHTML = `
            <h2>ছাত্র তালিকা</h2>
            <div class="admin-form">
                <h3>নতুন ছাত্র যোগ করুন</h3>
                <form id="addStudentForm">
                    <div class="form-group"><label>নাম *</label><input type="text" id="sName" required /></div>
                    <div class="form-group"><label>ইউজারনেম *</label><input type="text" id="sUsername" required /></div>
                    <div class="form-group"><label>পাসওয়ার্ড *</label><input type="text" id="sPassword" required /></div>
                    <div class="form-group"><label>ফোন</label><input type="text" id="sPhone" /></div>
                    <div class="form-group"><label>ইমেইল</label><input type="email" id="sEmail" /></div>
                    <button type="submit" class="btn btn-primary">যোগ করুন</button>
                </form>
                <div id="studentFormMsg" class="form-message"></div>
            </div>
            <table class="admin-table">
                <thead><tr><th>নাম</th><th>ইউজারনেম</th><th>ফোন</th><th>ইমেইল</th><th>স্ট্যাটাস</th><th>একশন</th></tr></thead>
                <tbody>
                    ${result.students.map(s => `
                        <tr>
                            <td>${s.name}</td>
                            <td>${s.username}</td>
                            <td>${s.phone || '-'}</td>
                            <td>${s.email || '-'}</td>
                            <td><span class="status status-${s.status === 'ACTIVE' ? 'active' : 'inactive'}">${s.status}</span></td>
                            <td class="admin-actions">
                                <button class="btn btn-warning" onclick="editStudent('${s.user_id}')">সম্পাদনা</button>
                                <button class="btn btn-danger" onclick="resetStudentPass('${s.user_id}')">পাস রিসেট</button>
                                <button class="btn btn-secondary" onclick="resetStudentDevice('${s.user_id}')">ডিভাইস রিসেট</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
        document.getElementById('addStudentForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            const data = {
                name: document.getElementById('sName').value.trim(),
                username: document.getElementById('sUsername').value.trim(),
                password: document.getElementById('sPassword').value.trim(),
                phone: document.getElementById('sPhone').value.trim(),
                email: document.getElementById('sEmail').value.trim()
            };
            const msg = document.getElementById('studentFormMsg');
            msg.className = 'form-message';
            msg.textContent = 'যোগ করা হচ্ছে...';
            
            try {
                const result = await api.createStudent(data);
                if (result.success) {
                    msg.className = 'form-message success';
                    msg.textContent = 'ছাত্র সফলভাবে যোগ হয়েছে!';
                    setTimeout(() => loadSection('students'), 1500);
                } else {
                    msg.className = 'form-message error';
                    msg.textContent = result.error || 'যোগ করতে সমস্যা হয়েছে।';
                }
            } catch (error) {
                msg.className = 'form-message error';
                msg.textContent = 'সার্ভার ত্রুটি।';
            }
        });
    } else {
        content.innerHTML = '<p>ছাত্র তালিকা লোড করতে সমস্যা হয়েছে।</p>';
    }
}

async function loadCoursesAdmin(content) {
    const result = await api.getCourses();
    if (result.success && result.courses) {
        content.innerHTML = `
            <h2>কোর্স তালিকা</h2>
            <div class="admin-form">
                <h3>নতুন কোর্স যোগ করুন</h3>
                <form id="addCourseForm">
                    <div class="form-group"><label>নাম *</label><input type="text" id="cName" required /></div>
                    <div class="form-group"><label>সংক্ষিপ্ত বিবরণ</label><input type="text" id="cShortDesc" /></div>
                    <div class="form-group"><label>বিস্তারিত বিবরণ</label><textarea id="cDesc" rows="3"></textarea></div>
                    <div class="form-group"><label>থাম্বনেইল ID (Google Drive)</label><input type="text" id="cThumbnail" /></div>
                    <div class="form-group"><label>ডিউরেশন</label><input type="text" id="cDuration" /></div>
                    <div class="form-group"><label>অ্যাক্সেস টাইপ</label>
                        <select id="cAccessType">
                            <option value="COURSE">কোর্স (সুরক্ষিত)</option>
                            <option value="PUBLIC">পাবলিক</option>
                        </select>
                    </div>
                    <button type="submit" class="btn btn-primary">যোগ করুন</button>
                </form>
                <div id="courseFormMsg" class="form-message"></div>
            </div>
            <table class="admin-table">
                <thead><tr><th>নাম</th><th>স্ট্যাটাস</th><th>একশন</th></tr></thead>
                <tbody>
                    ${result.courses.map(c => `
                        <tr>
                            <td>${c.name}</td>
                            <td><span class="status status-${c.status === 'ACTIVE' ? 'active' : 'inactive'}">${c.status}</span></td>
                            <td class="admin-actions">
                                <button class="btn btn-warning" onclick="editCourse('${c.course_id}')">সম্পাদনা</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
        document.getElementById('addCourseForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            const data = {
                name: document.getElementById('cName').value.trim(),
                shortDescription: document.getElementById('cShortDesc').value.trim(),
                description: document.getElementById('cDesc').value.trim(),
                thumbnailId: document.getElementById('cThumbnail').value.trim(),
                duration: document.getElementById('cDuration').value.trim(),
                accessType: document.getElementById('cAccessType').value
            };
            const msg = document.getElementById('courseFormMsg');
            msg.className = 'form-message';
            msg.textContent = 'যোগ করা হচ্ছে...';
            
            try {
                const result = await api.createCourse(data);
                if (result.success) {
                    msg.className = 'form-message success';
                    msg.textContent = 'কোর্স সফলভাবে যোগ হয়েছে!';
                    setTimeout(() => loadSection('courses'), 1500);
                } else {
                    msg.className = 'form-message error';
                    msg.textContent = result.error || 'যোগ করতে সমস্যা হয়েছে।';
                }
            } catch (error) {
                msg.className = 'form-message error';
                msg.textContent = 'সার্ভার ত্রুটি।';
            }
        });
    } else {
        content.innerHTML = '<p>কোর্স লোড করতে সমস্যা হয়েছে।</p>';
    }
}

async function loadAccess(content) {
    content.innerHTML = `
        <h2>কোর্স অ্যাক্সেস ম্যানেজমেন্ট</h2>
        <div class="admin-form">
            <h3>অ্যাক্সেস দিন</h3>
            <form id="grantAccessForm">
                <div class="form-group"><label>ছাত্র আইডি *</label><input type="text" id="aUserId" required /></div>
                <div class="form-group"><label>কোর্স আইডি *</label><input type="text" id="aCourseId" required /></div>
                <div class="form-group"><label>মেয়াদ শেষ (ঐচ্ছিক)</label><input type="datetime-local" id="aExpiry" /></div>
                <div class="form-group"><label>নোট</label><input type="text" id="aNote" /></div>
                <button type="submit" class="btn btn-success">অ্যাক্সেস দিন</button>
            </form>
            <div id="accessFormMsg" class="form-message"></div>
        </div>
        <p><small>ছাত্র আইডি এবং কোর্স আইডি উপরের টেবিল থেকে সংগ্রহ করুন।</small></p>
    `;
    
    document.getElementById('grantAccessForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const data = {
            userId: document.getElementById('aUserId').value.trim(),
            courseId: document.getElementById('aCourseId').value.trim(),
            expiresAt: document.getElementById('aExpiry').value || '',
            notes: document.getElementById('aNote').value.trim()
        };
        const msg = document.getElementById('accessFormMsg');
        msg.className = 'form-message';
        msg.textContent = 'প্রক্রিয়া করা হচ্ছে...';
        
        try {
            const result = await api.grantAccess(data);
            if (result.success) {
                msg.className = 'form-message success';
                msg.textContent = 'অ্যাক্সেস সফলভাবে দেওয়া হয়েছে!';
                document.getElementById('grantAccessForm').reset();
            } else {
                msg.className = 'form-message error';
                msg.textContent = result.error || 'অ্যাক্সেস দিতে সমস্যা হয়েছে।';
            }
        } catch (error) {
            msg.className = 'form-message error';
            msg.textContent = 'সার্ভার ত্রুটি।';
        }
    });
}

async function loadLessons(content) {
    const result = await api.getCourses();
    if (result.success && result.courses) {
        content.innerHTML = `
            <h2>লেসন ম্যানেজমেন্ট</h2>
            <div class="admin-form">
                <h3>নতুন লেসন যোগ করুন</h3>
                <form id="addLessonForm">
                    <div class="form-group"><label>কোর্স *</label>
                        <select id="lCourseId" required>
                            <option value="">নির্বাচন করুন</option>
                            ${result.courses.map(c => `<option value="${c.course_id}">${c.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group"><label>শিরোনাম *</label><input type="text" id="lTitle" required /></div>
                    <div class="form-group"><label>বিবরণ</label><input type="text" id="lDesc" /></div>
                    <div class="form-group"><label>YouTube URL *</label><input type="url" id="lYoutube" required /></div>
                    <div class="form-group"><label>থাম্বনেইল ID</label><input type="text" id="lThumbnail" /></div>
                    <button type="submit" class="btn btn-primary">যোগ করুন</button>
                </form>
                <div id="lessonFormMsg" class="form-message"></div>
            </div>
        `;
        
        document.getElementById('addLessonForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            const data = {
                courseId: document.getElementById('lCourseId').value,
                title: document.getElementById('lTitle').value.trim(),
                description: document.getElementById('lDesc').value.trim(),
                youtubeUrl: document.getElementById('lYoutube').value.trim(),
                thumbnailId: document.getElementById('lThumbnail').value.trim()
            };
            const msg = document.getElementById('lessonFormMsg');
            msg.className = 'form-message';
            msg.textContent = 'যোগ করা হচ্ছে...';
            
            try {
                const result = await api.createLesson(data);
                if (result.success) {
                    msg.className = 'form-message success';
                    msg.textContent = 'লেসন সফলভাবে যোগ হয়েছে!';
                    document.getElementById('addLessonForm').reset();
                } else {
                    msg.className = 'form-message error';
                    msg.textContent = result.error || 'যোগ করতে সমস্যা হয়েছে।';
                }
            } catch (error) {
                msg.className = 'form-message error';
                msg.textContent = 'সার্ভার ত্রুটি।';
            }
        });
    } else {
        content.innerHTML = '<p>লেসন লোড করতে সমস্যা হয়েছে।</p>';
    }
}

async function loadNotices(content) {
    const result = await api.getNotices();
    if (result.success && result.notices) {
        content.innerHTML = `
            <h2>নোটিস ম্যানেজমেন্ট</h2>
            <div class="admin-form">
                <h3>নতুন নোটিস যোগ করুন</h3>
                <form id="addNoticeForm">
                    <div class="form-group"><label>শিরোনাম *</label><input type="text" id="nTitle" required /></div>
                    <div class="form-group"><label>বিষয়বস্তু *</label><textarea id="nContent" rows="4" required></textarea></div>
                    <div class="form-group"><label>প্রায়োরিটি</label>
                        <select id="nPriority">
                            <option value="NORMAL">সাধারণ</option>
                            <option value="HIGH">উচ্চ</option>
                            <option value="URGENT">জরুরি</option>
                        </select>
                    </div>
                    <button type="submit" class="btn btn-primary">যোগ করুন</button>
                </form>
                <div id="noticeFormMsg" class="form-message"></div>
            </div>
            <table class="admin-table">
                <thead><tr><th>শিরোনাম</th><th>তারিখ</th><th>স্ট্যাটাস</th><th>একশন</th></tr></thead>
                <tbody>
                    ${result.notices.map(n => `
                        <tr>
                            <td>${n.title}</td>
                            <td>${n.date ? new Date(n.date).toLocaleDateString('bn-BD') : '-'}</td>
                            <td><span class="status status-${n.status === 'PUBLISHED' ? 'active' : 'inactive'}">${n.status}</span></td>
                            <td class="admin-actions">
                                <button class="btn btn-warning" onclick="editNotice('${n.notice_id}')">সম্পাদনা</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
        document.getElementById('addNoticeForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            const data = {
                title: document.getElementById('nTitle').value.trim(),
                content: document.getElementById('nContent').value.trim(),
                priority: document.getElementById('nPriority').value
            };
            const msg = document.getElementById('noticeFormMsg');
            msg.className = 'form-message';
            msg.textContent = 'যোগ করা হচ্ছে...';
            
            try {
                const result = await api.createNotice(data);
                if (result.success) {
                    msg.className = 'form-message success';
                    msg.textContent = 'নোটিস সফলভাবে যোগ হয়েছে!';
                    setTimeout(() => loadSection('notices'), 1500);
                } else {
                    msg.className = 'form-message error';
                    msg.textContent = result.error || 'যোগ করতে সমস্যা হয়েছে।';
                }
            } catch (error) {
                msg.className = 'form-message error';
                msg.textContent = 'সার্ভার ত্রুটি।';
            }
        });
    } else {
        content.innerHTML = '<p>নোটিস লোড করতে সমস্যা হয়েছে।</p>';
    }
}

async function loadArticles(content) {
    const result = await api.getArticles();
    if (result.success && result.articles) {
        content.innerHTML = `
            <h2>আর্টিকেল ম্যানেজমেন্ট</h2>
            <div class="admin-form">
                <h3>নতুন আর্টিকেল যোগ করুন</h3>
                <form id="addArticleForm">
                    <div class="form-group"><label>শিরোনাম *</label><input type="text" id="artTitle" required /></div>
                    <div class="form-group"><label>বিষয়বস্তু *</label><textarea id="artContent" rows="5" required></textarea></div>
                    <div class="form-group"><label>থাম্বনেইল ID</label><input type="text" id="artThumbnail" /></div>
                    <div class="form-group"><label>লেখক</label><input type="text" id="artAuthor" /></div>
                    <button type="submit" class="btn btn-primary">যোগ করুন</button>
                </form>
                <div id="articleFormMsg" class="form-message"></div>
            </div>
            <table class="admin-table">
                <thead><tr><th>শিরোনাম</th><th>লেখক</th><th>তারিখ</th><th>স্ট্যাটাস</th><th>একশন</th></tr></thead>
                <tbody>
                    ${result.articles.map(a => `
                        <tr>
                            <td>${a.title}</td>
                            <td>${a.author || '-'}</td>
                            <td>${a.publish_date ? new Date(a.publish_date).toLocaleDateString('bn-BD') : '-'}</td>
                            <td><span class="status status-${a.status === 'PUBLISHED' ? 'active' : 'inactive'}">${a.status}</span></td>
                            <td class="admin-actions">
                                <button class="btn btn-warning" onclick="editArticle('${a.article_id}')">সম্পাদনা</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
        document.getElementById('addArticleForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            const data = {
                title: document.getElementById('artTitle').value.trim(),
                content: document.getElementById('artContent').value.trim(),
                thumbnailId: document.getElementById('artThumbnail').value.trim(),
                author: document.getElementById('artAuthor').value.trim() || 'Admin'
            };
            const msg = document.getElementById('articleFormMsg');
            msg.className = 'form-message';
            msg.textContent = 'যোগ করা হচ্ছে...';
            
            try {
                const result = await api.createArticle(data);
                if (result.success) {
                    msg.className = 'form-message success';
                    msg.textContent = 'আর্টিকেল সফলভাবে যোগ হয়েছে!';
                    setTimeout(() => loadSection('articles'), 1500);
                } else {
                    msg.className = 'form-message error';
                    msg.textContent = result.error || 'যোগ করতে সমস্যা হয়েছে।';
                }
            } catch (error) {
                msg.className = 'form-message error';
                msg.textContent = 'সার্ভার ত্রুটি।';
            }
        });
    } else {
        content.innerHTML = '<p>আর্টিকেল লোড করতে সমস্যা হয়েছে।</p>';
    }
}

async function loadTeachers(content) {
    const result = await api.getTeachers();
    if (result.success && result.teachers) {
        content.innerHTML = `
            <h2>শিক্ষক ম্যানেজমেন্ট</h2>
            <div class="admin-form">
                <h3>নতুন শিক্ষক যোগ করুন</h3>
                <form id="addTeacherForm">
                    <div class="form-group"><label>নাম *</label><input type="text" id="tName" required /></div>
                    <div class="form-group"><label>পদবি</label><input type="text" id="tDesignation" /></div>
                    <div class="form-group"><label>প্রোফাইল ইমেজ ID</label><input type="text" id="tProfile" /></div>
                    <div class="form-group"><label>বায়ো</label><textarea id="tBio" rows="3"></textarea></div>
                    <button type="submit" class="btn btn-primary">যোগ করুন</button>
                </form>
                <div id="teacherFormMsg" class="form-message"></div>
            </div>
            <table class="admin-table">
                <thead><tr><th>নাম</th><th>পদবি</th><th>স্ট্যাটাস</th><th>একশন</th></tr></thead>
                <tbody>
                    ${result.teachers.map(t => `
                        <tr>
                            <td>${t.name}</td>
                            <td>${t.designation || '-'}</td>
                            <td><span class="status status-${t.status === 'ACTIVE' ? 'active' : 'inactive'}">${t.status}</span></td>
                            <td class="admin-actions">
                                <button class="btn btn-warning" onclick="editTeacher('${t.teacher_id}')">সম্পাদনা</button>
                                <button class="btn btn-danger" onclick="deleteTeacher('${t.teacher_id}')">মুছুন</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
        document.getElementById('addTeacherForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            const data = {
                name: document.getElementById('tName').value.trim(),
                designation: document.getElementById('tDesignation').value.trim(),
                profileImageId: document.getElementById('tProfile').value.trim(),
                bio: document.getElementById('tBio').value.trim()
            };
            const msg = document.getElementById('teacherFormMsg');
            msg.className = 'form-message';
            msg.textContent = 'যোগ করা হচ্ছে...';
            
            try {
                const result = await api.createTeacher(data);
                if (result.success) {
                    msg.className = 'form-message success';
                    msg.textContent = 'শিক্ষক সফলভাবে যোগ হয়েছে!';
                    setTimeout(() => loadSection('teachers'), 1500);
                } else {
                    msg.className = 'form-message error';
                    msg.textContent = result.error || 'যোগ করতে সমস্যা হয়েছে।';
                }
            } catch (error) {
                msg.className = 'form-message error';
                msg.textContent = 'সার্ভার ত্রুটি।';
            }
        });
    } else {
        content.innerHTML = '<p>শিক্ষক লোড করতে সমস্যা হয়েছে।</p>';
    }
}

async function loadGallery(content) {
    const result = await api.getGallery();
    if (result.success && result.sections) {
        content.innerHTML = `
            <h2>গ্যালারি ম্যানেজমেন্ট</h2>
            <div class="admin-form">
                <h3>নতুন সেকশন যোগ করুন</h3>
                <form id="addGallerySectionForm">
                    <div class="form-group"><label>সেকশন নাম *</label><input type="text" id="gsName" required /></div>
                    <div class="form-group"><label>বিবরণ</label><input type="text" id="gsDesc" /></div>
                    <button type="submit" class="btn btn-primary">সেকশন যোগ করুন</button>
                </form>
                <div id="gallerySectionMsg" class="form-message"></div>
            </div>
            <div class="admin-form">
                <h3>সেকশনে ছবি যোগ করুন</h3>
                <form id="addGalleryImageForm">
                    <div class="form-group"><label>সেকশন আইডি *</label>
                        <select id="giSectionId" required>
                            <option value="">নির্বাচন করুন</option>
                            ${result.sections.map(s => `<option value="${s.section_id}">${s.section_name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group"><label>ইমেজ ID (Google Drive) *</label><input type="text" id="giImageId" required /></div>
                    <div class="form-group"><label>ক্যাপশন</label><input type="text" id="giCaption" /></div>
                    <button type="submit" class="btn btn-primary">ছবি যোগ করুন</button>
                </form>
                <div id="galleryImageMsg" class="form-message"></div>
            </div>
            <h3>বিদ্যমান গ্যালারি</h3>
            ${result.sections.map(s => `
                <h4>${s.section_name}</h4>
                <p>${s.description || ''}</p>
                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:20px;">
                    ${s.images.map(img => `
                        <div style="width:120px;border:1px solid #ddd;border-radius:4px;padding:4px;text-align:center;">
                            <img src="${buildImageUrl(img.google_drive_image_id)}" style="width:100%;height:80px;object-fit:cover;border-radius:4px;" onerror="this.src='${APP_CONFIG.DEFAULT_IMAGE}'" />
                            <small>${img.caption || ''}</small>
                        </div>
                    `).join('')}
                </div>
            `).join('')}
        `;
        
        document.getElementById('addGallerySectionForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            const data = {
                sectionName: document.getElementById('gsName').value.trim(),
                description: document.getElementById('gsDesc').value.trim()
            };
            const msg = document.getElementById('gallerySectionMsg');
            msg.className = 'form-message';
            msg.textContent = 'যোগ করা হচ্ছে...';
            
            try {
                const result = await api.createGallerySection(data);
                if (result.success) {
                    msg.className = 'form-message success';
                    msg.textContent = 'সেকশন সফলভাবে যোগ হয়েছে!';
                    setTimeout(() => loadSection('gallery'), 1500);
                } else {
                    msg.className = 'form-message error';
                    msg.textContent = result.error || 'যোগ করতে সমস্যা হয়েছে।';
                }
            } catch (error) {
                msg.className = 'form-message error';
                msg.textContent = 'সার্ভার ত্রুটি।';
            }
        });
        
        document.getElementById('addGalleryImageForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            const data = {
                sectionId: document.getElementById('giSectionId').value,
                googleDriveImageId: document.getElementById('giImageId').value.trim(),
                caption: document.getElementById('giCaption').value.trim()
            };
            const msg = document.getElementById('galleryImageMsg');
            msg.className = 'form-message';
            msg.textContent = 'যোগ করা হচ্ছে...';
            
            try {
                const result = await api.createGalleryImage(data);
                if (result.success) {
                    msg.className = 'form-message success';
                    msg.textContent = 'ছবি সফলভাবে যোগ হয়েছে!';
                    setTimeout(() => loadSection('gallery'), 1500);
                } else {
                    msg.className = 'form-message error';
                    msg.textContent = result.error || 'যোগ করতে সমস্যা হয়েছে।';
                }
            } catch (error) {
                msg.className = 'form-message error';
                msg.textContent = 'সার্ভার ত্রুটি।';
            }
        });
    } else {
        content.innerHTML = '<p>গ্যালারি লোড করতে সমস্যা হয়েছে।</p>';
    }
}

async function loadRequests(content) {
    const result = await api.getCourseRequests();
    if (result.success && result.requests) {
        content.innerHTML = `
            <h2>কোর্স রিকোয়েস্ট</h2>
            <table class="admin-table">
                <thead><tr>
                    <th>নাম</th><th>প্রযুক্তি</th><th>সেমিস্টার</th><th>শিফট</th>
                    <th>রিকোয়েস্টেড কোর্স</th><th>WhatsApp</th><th>স্ট্যাটাস</th><th>একশন</th>
                </tr></thead>
                <tbody>
                    ${result.requests.map(r => `
                        <tr>
                            <td>${r.name}</td>
                            <td>${r.technology || '-'}</td>
                            <td>${r.semester || '-'}</td>
                            <td>${r.shift || '-'}</td>
                            <td>${r.requested_courses || '-'}</td>
                            <td>${r.whatsapp}</td>
                            <td><span class="status status-${r.status === 'PENDING' ? 'inactive' : 'active'}">${r.status}</span></td>
                            <td class="admin-actions">
                                <select id="reqStatus_${r.request_id}" onchange="updateRequestStatus('${r.request_id}')">
                                    <option value="PENDING" ${r.status === 'PENDING' ? 'selected' : ''}>পেন্ডিং</option>
                                    <option value="CONTACTED" ${r.status === 'CONTACTED' ? 'selected' : ''}>যোগাযোগ করা হয়েছে</option>
                                    <option value="ENROLLED" ${r.status === 'ENROLLED' ? 'selected' : ''}>এনরোল করা হয়েছে</option>
                                    <option value="REJECTED" ${r.status === 'REJECTED' ? 'selected' : ''}>রিজেক্ট করা হয়েছে</option>
                                </select>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } else {
        content.innerHTML = '<p>রিকোয়েস্ট লোড করতে সমস্যা হয়েছে।</p>';
    }
}

async function loadSettingsAdmin(content) {
    const result = await api.getSettings();
    if (result.success) {
        const s = result;
        content.innerHTML = `
            <h2>ওয়েবসাইট সেটিংস</h2>
            <div class="admin-form">
                <form id="settingsForm">
                    <div class="form-group"><label>সাইটের নাম</label><input type="text" id="setSiteName" value="${s.site_name || ''}" /></div>
                    <div class="form-group"><label>লোগো ইমেজ ID</label><input type="text" id="setLogo" value="${s.logo_image_id || ''}" /></div>
                    <div class="form-group"><label>ফেভিকন ইমেজ ID</label><input type="text" id="setFavicon" value="${s.favicon_image_id || ''}" /></div>
                    <div class="form-group"><label>ফুটার টেক্সট</label><input type="text" id="setFooter" value="${s.footer_text || ''}" /></div>
                    <div class="form-group"><label>WhatsApp</label><input type="text" id="setWhatsapp" value="${s.whatsapp || ''}" /></div>
                    <div class="form-group"><label>Email</label><input type="email" id="setEmail" value="${s.email || ''}" /></div>
                    <div class="form-group"><label>Facebook URL</label><input type="url" id="setFb" value="${s.facebook_url || ''}" /></div>
                    <div class="form-group"><label>YouTube URL</label><input type="url" id="setYt" value="${s.youtube_url || ''}" /></div>
                    <div class="form-group"><label>Telegram URL</label><input type="url" id="setTg" value="${s.telegram_url || ''}" /></div>
                    <div class="form-group"><label>Instagram URL</label><input type="url" id="setIg" value="${s.instagram_url || ''}" /></div>
                    <div class="form-group"><label>কপিরাইট টেক্সট</label><input type="text" id="setCopyright" value="${s.copyright_text || ''}" /></div>
                    <button type="submit" class="btn btn-primary">সেভ করুন</button>
                </form>
                <div id="settingsFormMsg" class="form-message"></div>
            </div>
        `;
        
        document.getElementById('settingsForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            const data = {
                site_name: document.getElementById('setSiteName').value.trim(),
                logo_image_id: document.getElementById('setLogo').value.trim(),
                favicon_image_id: document.getElementById('setFavicon').value.trim(),
                footer_text: document.getElementById('setFooter').value.trim(),
                whatsapp: document.getElementById('setWhatsapp').value.trim(),
                email: document.getElementById('setEmail').value.trim(),
                facebook_url: document.getElementById('setFb').value.trim(),
                youtube_url: document.getElementById('setYt').value.trim(),
                telegram_url: document.getElementById('setTg').value.trim(),
                instagram_url: document.getElementById('setIg').value.trim(),
                copyright_text: document.getElementById('setCopyright').value.trim()
            };
            const msg = document.getElementById('settingsFormMsg');
            msg.className = 'form-message';
            msg.textContent = 'সেভ করা হচ্ছে...';
            
            try {
                const result = await api.updateSettings(data);
                if (result.success) {
                    msg.className = 'form-message success';
                    msg.textContent = 'সেটিংস সফলভাবে সেভ হয়েছে!';
                } else {
                    msg.className = 'form-message error';
                    msg.textContent = result.error || 'সেভ করতে সমস্যা হয়েছে।';
                }
            } catch (error) {
                msg.className = 'form-message error';
                msg.textContent = 'সার্ভার ত্রুটি।';
            }
        });
    } else {
        content.innerHTML = '<p>সেটিংস লোড করতে সমস্যা হয়েছে।</p>';
    }
}

async function loadLogs(content) {
    const result = await api.getLogs();
    if (result.success && result.logs) {
        content.innerHTML = `
            <h2>অ্যাক্টিভিটি লগ</h2>
            <table class="admin-table">
                <thead><tr><th>ইউজার</th><th>অ্যাকশন</th><th>বিস্তারিত</th><th>সময়</th></tr></thead>
                <tbody>
                    ${result.logs.map(log => `
                        <tr>
                            <td>${log.user_id || 'system'}</td>
                            <td>${log.action || '-'}</td>
                            <td>${log.details || '-'}</td>
                            <td>${log.timestamp ? new Date(log.timestamp).toLocaleString('bn-BD') : '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } else {
        content.innerHTML = '<p>লগ লোড করতে সমস্যা হয়েছে।</p>';
    }
}

function loadChangePassword(content) {
    content.innerHTML = `
        <h2>পাসওয়ার্ড পরিবর্তন</h2>
        <div class="admin-form">
            <form id="changePassForm">
                <div class="form-group"><label>বর্তমান পাসওয়ার্ড *</label><input type="password" id="cpOld" required /></div>
                <div class="form-group"><label>নতুন পাসওয়ার্ড *</label><input type="password" id="cpNew" required minlength="6" /></div>
                <div class="form-group"><label>নতুন পাসওয়ার্ড নিশ্চিত করুন *</label><input type="password" id="cpConfirm" required /></div>
                <button type="submit" class="btn btn-primary">পাসওয়ার্ড পরিবর্তন করুন</button>
            </form>
            <div id="changePassMsg" class="form-message"></div>
        </div>
    `;
    
    document.getElementById('changePassForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const oldPass = document.getElementById('cpOld').value.trim();
        const newPass = document.getElementById('cpNew').value.trim();
        const confirmPass = document.getElementById('cpConfirm').value.trim();
        const msg = document.getElementById('changePassMsg');
        
        if (newPass !== confirmPass) {
            msg.className = 'form-message error';
            msg.textContent = 'নতুন পাসওয়ার্ড মিলছে না।';
            return;
        }
        if (newPass.length < 6) {
            msg.className = 'form-message error';
            msg.textContent = 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।';
            return;
        }
        
        msg.className = 'form-message';
        msg.textContent = 'প্রক্রিয়া করা হচ্ছে...';
        
        try {
            const result = await api.changeAdminPassword({
                oldPassword: oldPass,
                newPassword: newPass,
                confirmPassword: confirmPass
            });
            if (result.success) {
                msg.className = 'form-message success';
                msg.textContent = 'পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!';
                document.getElementById('changePassForm').reset();
            } else {
                msg.className = 'form-message error';
                msg.textContent = result.error || 'পাসওয়ার্ড পরিবর্তন করতে সমস্যা হয়েছে।';
            }
        } catch (error) {
            msg.className = 'form-message error';
            msg.textContent = 'সার্ভার ত্রুটি।';
        }
    });
}

// Global functions
window.editStudent = function(userId) {
    alert('সম্পাদনা ফাংশন শীঘ্রই আসছে। আইডি: ' + userId);
};

window.resetStudentPass = async function(userId) {
    const newPass = prompt('নতুন পাসওয়ার্ড দিন (৬+ অক্ষর):');
    if (!newPass || newPass.length < 6) {
        alert('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
        return;
    }
    const result = await api.resetPassword({ userId, newPassword: newPass });
    if (result.success) {
        alert('পাসওয়ার্ড রিসেট সফল!');
        loadSection('students');
    } else {
        alert('ত্রুটি: ' + (result.error || 'পাসওয়ার্ড রিসেট করতে সমস্যা হয়েছে।'));
    }
};

window.resetStudentDevice = async function(userId) {
    if (!confirm('এই ছাত্রের ডিভাইস রিসেট করতে চান?')) return;
    const result = await api.resetDevice({ userId });
    if (result.success) {
        alert('ডিভাইস রিসেট সফল!');
        loadSection('students');
    } else {
        alert('ত্রুটি: ' + (result.error || 'ডিভাইস রিসেট করতে সমস্যা হয়েছে।'));
    }
};

window.editCourse = function(courseId) {
    alert('সম্পাদনা ফাংশন শীঘ্রই আসছে। আইডি: ' + courseId);
};

window.editNotice = function(noticeId) {
    alert('সম্পাদনা ফাংশন শীঘ্রই আসছে। আইডি: ' + noticeId);
};

window.editArticle = function(articleId) {
    alert('সম্পাদনা ফাংশন শীঘ্রই আসছে। আইডি: ' + articleId);
};

window.editTeacher = function(teacherId) {
    alert('সম্পাদনা ফাংশন শীঘ্রই আসছে। আইডি: ' + teacherId);
};

window.deleteTeacher = async function(teacherId) {
    if (!confirm('এই শিক্ষককে মুছতে চান?')) return;
    const result = await api.deleteTeacher({ teacherId });
    if (result.success) {
        alert('শিক্ষক মুছে ফেলা হয়েছে!');
        loadSection('teachers');
    } else {
        alert('ত্রুটি: ' + (result.error || 'মুছতে সমস্যা হয়েছে।'));
    }
};

window.updateRequestStatus = async function(requestId) {
    const status = document.getElementById('reqStatus_' + requestId).value;
    const result = await api.updateCourseRequest({ requestId, status });
    if (result.success) {
        alert('স্ট্যাটাস আপডেট সফল!');
    } else {
        alert('ত্রুটি: ' + (result.error || 'আপডেট করতে সমস্যা হয়েছে।'));
    }
};
