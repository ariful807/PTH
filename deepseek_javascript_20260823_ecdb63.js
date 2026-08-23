document.addEventListener('DOMContentLoaded', function() {
    loadGallery();
    setupHamburger();
    loadPublicSettings();
});

async function loadGallery() {
    try {
        const result = await api.getGallery();
        const container = document.getElementById('galleryContainer');
        
        if (result.success && result.sections && result.sections.length > 0) {
            container.innerHTML = result.sections.map(section => `
                <div style="margin-bottom:40px;">
                    <h2>${section.section_name || 'সেকশন'}</h2>
                    ${section.description ? `<p>${section.description}</p>` : ''}
                    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;margin-top:16px;">
                        ${section.images && section.images.length > 0 ? section.images.map(img => `
                            <div style="border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
                                <img src="${buildImageUrl(img.google_drive_image_id)}" alt="${img.caption || ''}" style="width:100%;height:150px;object-fit:cover;" onerror="this.src='${APP_CONFIG.DEFAULT_IMAGE}'" />
                                ${img.caption ? `<p style="padding:8px;font-size:0.9rem;text-align:center;">${img.caption}</p>` : ''}
                            </div>
                        `).join('') : '<p>এই সেকশনে কোনো ছবি নেই।</p>'}
                    </div>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<p>কোনো গ্যালারি পাওয়া যায়নি।</p>';
        }
    } catch (error) {
        console.error('Error loading gallery:', error);
        document.getElementById('galleryContainer').innerHTML = '<p>গ্যালারি লোড করতে সমস্যা হয়েছে।</p>';
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