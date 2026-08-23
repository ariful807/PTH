document.addEventListener('DOMContentLoaded', function() {
    loadArticleDetail();
    setupHamburger();
    setupCopyLink();
    loadPublicSettings();
});

async function loadArticleDetail() {
    const params = new URLSearchParams(window.location.search);
    const articleId = params.get('id');
    
    if (!articleId) {
        document.getElementById('articleDetail').innerHTML = '<p>আর্টিকেল আইডি পাওয়া যায়নি।</p>';
        return;
    }
    
    try {
        const result = await api.getArticle(articleId);
        const container = document.getElementById('articleDetail');
        
        if (result.success && result.article) {
            const article = result.article;
            container.innerHTML = `
                <div class="article-detail">
                    ${article.thumbnail_id ? `<img src="${buildImageUrl(article.thumbnail_id)}" alt="${article.title}" style="max-width:100%;border-radius:8px;margin-bottom:16px;" onerror="this.style.display='none'" />` : ''}
                    <h1>${article.title || 'শিরোনাম নেই'}</h1>
                    <p style="color:#888;">${article.author ? 'লেখক: ' + article.author : ''} ${article.publish_date ? '| প্রকাশ: ' + formatDate(article.publish_date) : ''}</p>
                    <div style="margin-top:20px;line-height:1.8;">${article.content || ''}</div>
                </div>
            `;
            
            // Update page title
            document.title = (article.title || 'আর্টিকেল') + ' - অনলাইন কোর্স সেন্টার';
        } else {
            container.innerHTML = '<p>আর্টিকেল পাওয়া যায়নি।</p>';
        }
    } catch (error) {
        console.error('Error loading article:', error);
        document.getElementById('articleDetail').innerHTML = '<p>আর্টিকেল লোড করতে সমস্যা হয়েছে।</p>';
    }
}

function setupCopyLink() {
    const copyBtn = document.getElementById('copyLinkBtn');
    if (!copyBtn) return;
    
    copyBtn.addEventListener('click', function() {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            const msg = document.getElementById('copyMessage');
            msg.className = 'form-message success';
            msg.textContent = 'লিংক কপি হয়েছে!';
            setTimeout(() => {
                msg.className = 'form-message';
                msg.textContent = '';
            }, 3000);
        }).catch(() => {
            // Fallback
            const textarea = document.createElement('textarea');
            textarea.value = url;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            
            const msg = document.getElementById('copyMessage');
            msg.className = 'form-message success';
            msg.textContent = 'লিংক কপি হয়েছে!';
            setTimeout(() => {
                msg.className = 'form-message';
                msg.textContent = '';
            }, 3000);
        });
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