document.addEventListener('DOMContentLoaded', function() {
    loadAbout();
    loadTeachers();
    setupHamburger();
    loadPublicSettings();
});

async function loadAbout() {
    try {
        const result = await api.getSettings();
        const container = document.getElementById('aboutContent');
        
        if (result.success) {
            const s = result;
            container.innerHTML = `
                <div style="text-align:center;margin-bottom:30px;">
                    ${s.logo_image_id ? `<img src="${buildImageUrl(s.logo_image_id)}" alt="Logo" style="width:120px;height:120px;border-radius:50%;object-fit:cover;margin-bottom:16px;" />` : ''}
                    <h1>${s.site_name || 'অনলাইন কোর্স সেন্টার'}</h1>
                    <p style="color:#666;max-width:600px;margin:0 auto;">${s.about_short || 'আমাদের লক্ষ্য মানসম্মত শিক্ষা প্রদান করা।'}</p>
                </div>
                <div style="max-width:800px;margin:0 auto;line-height:1.8;">
                    ${s.about_full || '<p>আমরা একটি শিক্ষামূলক প্রতিষ্ঠান যা মানসম্মত অনলাইন কোর্স প্রদান করে থাকে। আমাদের লক্ষ্য হল শিক্ষার্থীদের প্রয়োজন অনুযায়ী আধুনিক প্রযুক্তি ও দক্ষতা উন্নয়নে সহায়তা করা।</p>'}
                </div>
            `;
        } else {
            container.innerHTML = '<p>আমাদের সম্পর্কে তথ্য লোড করতে সমস্যা হয়েছে।</p>';
        }
    } catch (error) {
        console.error('Error loading about:', error);
        document.getElementById('aboutContent').innerHTML = '<p>আমাদের সম্পর্কে তথ্য লোড করতে সমস্যা হয়েছে।</p>';
    }
}

async function loadTeachers() {
    try {
        const result = await api.getTeachers();
        const container = document.getElementById('teachersGrid');
        
        if (result.success && result.teachers && result.teachers.length > 0) {
            container.innerHTML = result.teachers.map(teacher => `
                <div class="teacher-card">
                    <img src="${buildImageUrl(teacher.profile_image_id)}" alt="${teacher.name}" onerror="this.src='${APP_CONFIG.DEFAULT_IMAGE}'" />
                    <h3>${teacher.name}</h3>
                    <div class="designation">${teacher.designation || ''}</div>
                    <p style="font-size:0.9rem;color:#666;margin-top:8px;">${teacher.bio || ''}</p>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<p>কোনো শিক্ষক পাওয়া যায়নি।</p>';
        }
    } catch (error) {
        console.error('Error loading teachers:', error);
        document.getElementById('teachersGrid').innerHTML = '<p>শিক্ষক লোড করতে সমস্যা হয়েছে।</p>';
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
