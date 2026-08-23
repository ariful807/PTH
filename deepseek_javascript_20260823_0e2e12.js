document.addEventListener('DOMContentLoaded', function() {
    loadNotices();
    setupHamburger();
    loadPublicSettings();
});

async function loadNotices() {
    try {
        const result = await api.getNotices();
        const container = document.getElementById('noticesContainer');
        
        if (result.success && result.notices && result.notices.length > 0) {
            container.innerHTML = result.notices.map(notice => `
                <div class="notice-card" style="margin-bottom:16px;">
                    <h3>${notice.title || 'শিরোনাম নেই'}</h3>
                    <div class="date">${formatDate(notice.date)}</div>
                    <p>${notice.content || ''}</p>
                    ${notice.priority ? `<span class="status status-${notice.priority === 'URGENT' ? 'inactive' : 'active'}">${notice.priority}</span>` : ''}
                </div>
            `).join('');
        } else {
            container.innerHTML = '<p>কোনো নোটিস পাওয়া যায়নি।</p>';
        }
    } catch (error) {
        console.error('Error loading notices:', error);
        document.getElementById('noticesContainer').innerHTML = '<p>নোটিস লোড করতে সমস্যা হয়েছে।</p>';
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