document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    loadPublicSettings();
});

async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const msg = document.getElementById('loginMessage');
    
    if (!username || !password) {
        msg.className = 'form-message error';
        msg.textContent = 'ইউজারনেম এবং পাসওয়ার্ড দিন।';
        return;
    }
    
    msg.className = 'form-message';
    msg.textContent = 'লগইন হচ্ছে...';
    
    try {
        const result = await api.login(username, password);
        if (result.success) {
            msg.className = 'form-message success';
            msg.textContent = 'লগইন সফল! পুনঃনির্দেশিত হচ্ছে...';
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            msg.className = 'form-message error';
            msg.textContent = result.error || 'লগইন ব্যর্থ হয়েছে।';
        }
    } catch (error) {
        msg.className = 'form-message error';
        msg.textContent = 'সার্ভারের সাথে যোগাযোগ করতে সমস্যা হয়েছে।';
    }
}

async function handleLogout(e) {
    e.preventDefault();
    await api.logout();
    window.location.href = 'index.html';
}

async function loadPublicSettings() {
    try {
        const result = await api.getSettings();
        if (result.success) {
            const s = result;
            if (s.site_name) {
                const elements = document.querySelectorAll('#siteName, #footerSiteName');
                elements.forEach(el => el.textContent = s.site_name);
                document.title = s.site_name + ' - অনলাইন কোর্স সেন্টার';
            }
            if (s.logo_image_id) {
                const logo = document.getElementById('siteLogo');
                if (logo) logo.src = buildImageUrl(s.logo_image_id);
            }
            if (s.footer_text) {
                const el = document.getElementById('footerAboutText');
                if (el) el.textContent = s.footer_text;
            }
            if (s.whatsapp) {
                const el = document.getElementById('footerWhatsApp');
                if (el) el.textContent = 'WhatsApp: ' + s.whatsapp;
            }
            if (s.email) {
                const el = document.getElementById('footerEmail');
                if (el) el.textContent = 'Email: ' + s.email;
            }
            if (s.copyright_text) {
                const el = document.getElementById('footerCopyright');
                if (el) el.textContent = s.copyright_text;
            }
            
            // Social links
            const socialContainer = document.getElementById('socialLinks');
            if (socialContainer) {
                const links = [
                    { key: 'facebook_url', label: 'Facebook' },
                    { key: 'youtube_url', label: 'YouTube' },
                    { key: 'telegram_url', label: 'Telegram' },
                    { key: 'instagram_url', label: 'Instagram' }
                ];
                socialContainer.innerHTML = links
                    .filter(item => s[item.key])
                    .map(item => `<a href="${s[item.key]}" target="_blank">${item.label}</a>`)
                    .join('');
            }
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}
