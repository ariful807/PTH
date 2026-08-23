document.addEventListener('DOMContentLoaded', function() {
    loadCourse();
    setupHamburger();
    loadPublicSettings();
});

async function loadCourse() {
    const params = new URLSearchParams(window.location.search);
    const courseId = params.get('id');
    
    if (!courseId) {
        document.getElementById('courseDetail').innerHTML = '<p>কোর্স আইডি পাওয়া যায়নি।</p>';
        return;
    }
    
    try {
        const result = await api.getCourse(courseId);
        const container = document.getElementById('courseDetail');
        
        if (result.success && result.course) {
            const course = result.course;
            
            let lessonsHTML = '';
            if (course.lessons && course.lessons.length > 0) {
                lessonsHTML = `
                    <h3 style="margin-top:30px;">লেসনসমূহ</h3>
                    <div style="display:grid;gap:12px;">
                        ${course.lessons.map(lesson => `
                            <div style="background:var(--light-bg);padding:16px;border-radius:8px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;">
                                <div>
                                    <h4>${lesson.title || 'লেসন'}</h4>
                                    <p style="color:#666;font-size:0.9rem;">${lesson.description || ''}</p>
                                </div>
                                ${course.hasAccess ? 
                                    `<a href="lesson.html?id=${lesson.lesson_id}" class="btn btn-primary">দেখুন</a>` :
                                    `<span class="status status-inactive">অ্যাক্সেস প্রয়োজন</span>`
                                }
                            </div>
                        `).join('')}
                    </div>
                `;
            }
            
            container.innerHTML = `
                <div>
                    <img src="${buildImageUrl(course.thumbnail_id)}" alt="${course.name}" style="width:100%;max-height:400px;object-fit:cover;border-radius:8px;margin-bottom:20px;" onerror="this.style.display='none'" />
                    <h1>${course.name}</h1>
                    <p style="color:#888;">${course.duration || ''}</p>
                    <div style="margin-top:16px;line-height:1.8;">${course.description || course.short_description || ''}</div>
                    <div style="margin-top:16px;">
                        <span class="status status-${course.hasAccess ? 'active' : 'inactive'}">${course.hasAccess ? '✅ অ্যাক্সেস আছে' : '🔒 অ্যাক্সেস নেই'}</span>
                        ${course.status === 'ACTIVE' ? '<span class="status status-active">উপলব্ধ</span>' : '<span class="status status-inactive">অনুপলব্ধ</span>'}
                    </div>
                    ${lessonsHTML}
                    ${!course.hasAccess ? `<p style="margin-top:20px;color:#dc3545;">এই কোর্স দেখার জন্য আপনাকে লগইন করে অ্যাক্সেস নিতে হবে।</p>` : ''}
                </div>
            `;
        } else {
            container.innerHTML = '<p>কোর্স পাওয়া যায়নি।</p>';
        }
    } catch (error) {
        console.error('Error loading course:', error);
        document.getElementById('courseDetail').innerHTML = '<p>কোর্স লোড করতে সমস্যা হয়েছে।</p>';
    }
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
