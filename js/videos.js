document.addEventListener('DOMContentLoaded', function() {
    loadVideos();
    setupHamburger();
    loadPublicSettings();
});

async function loadVideos() {
    try {
        const result = await api.getVideos();
        const container = document.getElementById('videoContainer');
        
        if (result.success && result.videos && result.videos.length > 0) {
            container.innerHTML = `
                <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:24px;">
                    ${result.videos.map(video => `
                        <div style="background:var(--white);border-radius:8px;overflow:hidden;box-shadow:var(--shadow);">
                            <div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;">
                                <iframe src="${getEmbedUrl(video.youtube_url)}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allowfullscreen></iframe>
                            </div>
                            <div style="padding:16px;">
                                <h3>${video.title || 'ভিডিও'}</h3>
                                <p style="color:#666;font-size:0.95rem;">${video.description || ''}</p>
                                ${video.access_type === 'PUBLIC' ? '<span class="status status-active">পাবলিক</span>' : '<span class="status status-inactive">কোর্স</span>'}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            container.innerHTML = '<p>কোনো ভিডিও পাওয়া যায়নি।</p>';
        }
    } catch (error) {
        console.error('Error loading videos:', error);
        document.getElementById('videoContainer').innerHTML = '<p>ভিডিও লোড করতে সমস্যা হয়েছে।</p>';
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
