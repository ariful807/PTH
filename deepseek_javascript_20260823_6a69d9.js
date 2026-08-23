document.addEventListener('DOMContentLoaded', function() {
    loadLesson();
    setupHamburger();
    loadPublicSettings();
});

async function loadLesson() {
    const params = new URLSearchParams(window.location.search);
    const lessonId = params.get('id');
    
    if (!lessonId) {
        document.getElementById('lessonContent').innerHTML = '<p>লেসন আইডি পাওয়া যায়নি।</p>';
        return;
    }
    
    try {
        const result = await api.getLesson(lessonId);
        const container = document.getElementById('lessonContent');
        
        if (result.success && result.lesson) {
            const lesson = result.lesson;
            
            container.innerHTML = `
                <div>
                    <h1>${lesson.title || 'লেসন'}</h1>
                    <p style="color:#888;margin-bottom:20px;">${lesson.description || ''}</p>
                    ${lesson.embed_url ? `
                        <div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:8px;">
                            <iframe src="${lesson.embed_url}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allowfullscreen></iframe>
                        </div>
                    ` : '<p>ভিডিও পাওয়া যায়নি।</p>'}
                    <a href="course.html?id=${lesson.course_id}" class="btn btn-secondary" style="margin-top:20px;">কোর্সে ফিরে যান</a>
                </div>
            `;
        } else {
            container.innerHTML = `<p>${result.error || 'লেসন পাওয়া যায়নি।'}</p>`;
            if (result.error === 'Please login to view this lesson' || result.error === 'You do not have access to this lesson') {
                container.innerHTML += `<p><a href="login.html" class="btn btn-primary">লগইন করুন</a></p>`;
            }
        }
    } catch (error) {
        console.error('Error loading lesson:', error);
        document.getElementById('lessonContent').innerHTML = '<p>লেসন লোড করতে সমস্যা হয়েছে।</p>';
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