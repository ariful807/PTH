document.addEventListener('DOMContentLoaded', function() {
    loadArticles();
    setupHamburger();
    loadPublicSettings();
});

async function loadArticles() {
    try {
        const result = await api.getArticles();
        const container = document.getElementById('articlesGrid');
        
        if (result.success && result.articles && result.articles.length > 0) {
            container.innerHTML = result.articles.map(article => `
                <div class="article-card">
                    <img src="${buildImageUrl(article.thumbnail_id)}" alt="${article.title}" onerror="this.src='${APP_CONFIG.DEFAULT_IMAGE}'" />
                    <h3>${article.title || 'শিরোনাম নেই'}</h3>
                    <p>${article.author ? 'লেখক: ' + article.author : ''} ${article.publish_date ? '| ' + formatDate(article.publish_date) : ''}</p>
                    <p>${(article.content || '').substring(0, 150)}...</p>
                    <a href="article.html?id=${article.article_id}" class="btn btn-primary">আরও পড়ুন</a>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<p>কোনো আর্টিকেল পাওয়া যায়নি।</p>';
        }
    } catch (error) {
        console.error('Error loading articles:', error);
        document.getElementById('articlesGrid').innerHTML = '<p>আর্টিকেল লোড করতে সমস্যা হয়েছে।</p>';
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