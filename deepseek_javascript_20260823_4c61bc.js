document.addEventListener('DOMContentLoaded', function() {
    loadCourses();
    setupCourseRequestForm();
    setupHamburger();
    loadPublicSettings();
});

async function loadCourses() {
    try {
        const result = await api.getCourses();
        const container = document.getElementById('coursesGrid');
        
        if (result.success && result.courses && result.courses.length > 0) {
            container.innerHTML = result.courses.map(course => `
                <div class="course-card">
                    <img src="${buildImageUrl(course.thumbnail_id)}" alt="${course.name}" onerror="this.src='${APP_CONFIG.DEFAULT_IMAGE}'" />
                    <div class="card-body">
                        <h3>${course.name}</h3>
                        <p>${course.short_description || ''}</p>
                        <div class="duration">${course.duration || ''}</div>
                        <span class="status status-${course.status === 'ACTIVE' ? 'active' : 'inactive'}">${course.status === 'ACTIVE' ? 'উপলব্ধ' : 'অনুপলব্ধ'}</span>
                        <a href="course.html?id=${course.course_id}" class="btn btn-primary" style="margin-top:12px;display:inline-block;">বিস্তারিত</a>
                    </div>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<p>কোনো কোর্স পাওয়া যায়নি।</p>';
        }
    } catch (error) {
        console.error('Error loading courses:', error);
        document.getElementById('coursesGrid').innerHTML = '<p>কোর্স লোড করতে সমস্যা হয়েছে।</p>';
    }
}

function setupCourseRequestForm() {
    const form = document.getElementById('courseRequestForm');
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const data = {
            name: document.getElementById('reqName').value.trim(),
            address: document.getElementById('reqAddress').value.trim(),
            semester: document.getElementById('reqSemester').value,
            technology: document.getElementById('reqTechnology').value,
            shift: document.getElementById('reqShift').value,
            requestedCourses: document.getElementById('reqCourses').value.trim(),
            whatsapp: document.getElementById('reqWhatsapp').value.trim()
        };
        
        const messageDiv = document.getElementById('formMessage');
        messageDiv.className = 'form-message';
        messageDiv.textContent = 'সাবমিট করা হচ্ছে...';
        
        try {
            const result = await api.submitCourseRequest(data);
            if (result.success) {
                messageDiv.className = 'form-message success';
                messageDiv.textContent = 'আপনার আবেদন সফলভাবে জমা দেওয়া হয়েছে।';
                form.reset();
            } else {
                messageDiv.className = 'form-message error';
                messageDiv.textContent = result.error || 'সাবমিট করতে সমস্যা হয়েছে।';
            }
        } catch (error) {
            messageDiv.className = 'form-message error';
            messageDiv.textContent = 'সার্ভারের সাথে যোগাযোগ করতে সমস্যা হয়েছে।';
        }
    });
}

function setupHamburger() {
    const hamburger = document.getElementById('hamburger');
    const nav = document.getElementById('mainNav');
    if (hamburger && nav) {
        hamburger.addEventListener('click', function() {
            nav.classList.toggle('active');
            this.textContent = nav.classList.contains('active') ? '✕' : '☰';
        });
    }
}

async function loadPublicSettings() {
    try {
        const result = await api.getSettings();
        if (result.success) {
            const s = result;
            if (s.site_name) {
                document.getElementById('siteName').textContent = s.site_name;
                document.getElementById('footerSiteName').textContent = s.site_name;
            }
            if (s.logo_image_id) {
                document.getElementById('siteLogo').src = buildImageUrl(s.logo_image_id);
            }
            if (s.footer_text) {
                document.getElementById('footerAboutText').textContent = s.footer_text;
            }
            if (s.whatsapp) {
                document.getElementById('footerWhatsApp').textContent = 'WhatsApp: ' + s.whatsapp;
            }
            if (s.email) {
                document.getElementById('footerEmail').textContent = 'Email: ' + s.email;
            }
            if (s.copyright_text) {
                document.getElementById('footerCopyright').textContent = s.copyright_text;
            }
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}