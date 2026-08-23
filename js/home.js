document.addEventListener('DOMContentLoaded', function() {
    loadHomeData();
    setupHamburger();
});

async function loadHomeData() {
    try {
        const result = await api.getHome();
        if (result.success) {
            const data = result.data;
            
            if (data.settings) {
                updateSettings(data.settings);
            }
            
            if (data.heroSlides && data.heroSlides.length > 0) {
                renderSlides(data.heroSlides);
            }
            
            if (data.latestNotice) {
                renderNotice(data.latestNotice);
            }
            
            if (data.publicVideos && data.publicVideos.length > 0) {
                renderPublicVideos(data.publicVideos);
            } else {
                const container = document.getElementById('publicClassesGrid');
                if (container) container.innerHTML = '<p>কোনো পাবলিক ভিডিও পাওয়া যায়নি।</p>';
            }
            
            updateFooter(data.settings);
        } else {
            console.error('Failed to load home data:', result.error);
        }
    } catch (error) {
        console.error('Error loading home:', error);
    }
}

function updateSettings(settings) {
    if (!settings) return;
    if (settings.site_name) {
        document.getElementById('siteName').textContent = settings.site_name;
        document.getElementById('footerSiteName').textContent = settings.site_name;
        document.title = settings.site_name + ' - অনলাইন কোর্স সেন্টার';
    }
    if (settings.logo_image_id) {
        document.getElementById('siteLogo').src = buildImageUrl(settings.logo_image_id);
    }
}

function renderSlides(slides) {
    const track = document.getElementById('sliderTrack');
    const dotsContainer = document.getElementById('sliderDots');
    if (!track || !dotsContainer) return;
    
    track.innerHTML = '';
    dotsContainer.innerHTML = '';
    
    slides.forEach((slide, index) => {
        const slideEl = document.createElement('div');
        slideEl.className = 'slider-slide';
        const imageUrl = buildImageUrl(slide.image_id);
        slideEl.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${imageUrl})`;
        slideEl.innerHTML = `
            <h2>${slide.title || ''}</h2>
            <p>${slide.subtitle || ''}</p>
            ${slide.button_text && slide.button_url ? `<a href="${slide.button_url}" class="btn btn-primary">${slide.button_text}</a>` : ''}
        `;
        track.appendChild(slideEl);
        
        const dot = document.createElement('span');
        dot.dataset.index = index;
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });
    
    setupSlider();
}

let currentSlide = 0;
let autoInterval = null;

function setupSlider() {
    const slides = document.querySelectorAll('.slider-slide');
    const dots = document.querySelectorAll('.slider-dots span');
    if (slides.length === 0) return;
    
    window.goToSlide = function(index) {
        if (index < 0) index = slides.length - 1;
        if (index >= slides.length) index = 0;
        currentSlide = index;
        
        const track = document.getElementById('sliderTrack');
        track.style.transform = `translateX(-${currentSlide * 100}%)`;
        
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentSlide);
        });
    };
    
    document.getElementById('prevSlide').addEventListener('click', () => goToSlide(currentSlide - 1));
    document.getElementById('nextSlide').addEventListener('click', () => goToSlide(currentSlide + 1));
    
    if (autoInterval) clearInterval(autoInterval);
    autoInterval = setInterval(() => goToSlide(currentSlide + 1), 5000);
    
    const container = document.querySelector('.slider-container');
    container.addEventListener('mouseenter', () => clearInterval(autoInterval));
    container.addEventListener('mouseleave', () => {
        autoInterval = setInterval(() => goToSlide(currentSlide + 1), 5000);
    });
}

function renderNotice(notice) {
    const container = document.getElementById('noticeContent');
    if (!container) return;
    container.innerHTML = `
        <h3>${notice.title || 'শিরোনাম নেই'}</h3>
        <div class="date">${formatDate(notice.date)}</div>
        <p>${notice.content || ''}</p>
    `;
}

function renderPublicVideos(videos) {
    const container = document.getElementById('publicClassesGrid');
    if (!container) return;
    container.innerHTML = videos.map(video => `
        <div class="class-card">
            <img src="${buildImageUrl(video.thumbnail_id)}" alt="${video.title}" onerror="this.src='${APP_CONFIG.DEFAULT_IMAGE}'" />
            <h3>${video.title || 'ভিডিও'}</h3>
            <p>${video.description || ''}</p>
            <a href="videos.html" class="btn btn-primary">দেখুন</a>
        </div>
    `).join('');
}

function updateFooter(settings) {
    if (!settings) return;
    if (settings.footer_text) {
        document.getElementById('footerAboutText').textContent = settings.footer_text;
    }
    if (settings.whatsapp) {
        document.getElementById('footerWhatsApp').textContent = 'WhatsApp: ' + settings.whatsapp;
    }
    if (settings.email) {
        document.getElementById('footerEmail').textContent = 'Email: ' + settings.email;
    }
    
    const socialContainer = document.getElementById('socialLinks');
    if (socialContainer) {
        const links = [
            { key: 'facebook_url', label: 'Facebook' },
            { key: 'youtube_url', label: 'YouTube' },
            { key: 'telegram_url', label: 'Telegram' },
            { key: 'instagram_url', label: 'Instagram' }
        ];
        socialContainer.innerHTML = links
            .filter(item => settings[item.key])
            .map(item => `<a href="${settings[item.key]}" target="_blank">${item.label}</a>`)
            .join('');
    }
    if (settings.copyright_text) {
        document.getElementById('footerCopyright').textContent = settings.copyright_text;
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
