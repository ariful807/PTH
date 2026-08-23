const APP_CONFIG = {
    API_BASE: 'https://script.google.com/macros/s/AKfycbwKGp17t0O3ir3bLA8LqZA0q1s-vxkd_vqMjJZpXdbMZ2TVgYj_AwQN7a3WJ53q-7D5/exec',
    SESSION_KEY: 'course_session_token',
    ADMIN_SESSION_KEY: 'admin_session_token',
    DEVICE_ID_KEY: 'device_id',
    DEFAULT_IMAGE: 'assets/placeholder.png'
};

function getDeviceId() {
    let deviceId = localStorage.getItem(APP_CONFIG.DEVICE_ID_KEY);
    if (!deviceId) {
        deviceId = 'device_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
        localStorage.setItem(APP_CONFIG.DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
}

function buildImageUrl(imageId) {
    if (!imageId) return APP_CONFIG.DEFAULT_IMAGE;
    if (imageId.startsWith('http')) return imageId;
    return `https://lh3.googleusercontent.com/d/${imageId}`;
}

function extractYouTubeId(url) {
    if (!url) return null;
    const patterns = [
        /(?:youtube\.com\/watch\?v=)([^&]+)/,
        /(?:youtu\.be\/)([^?]+)/,
        /(?:youtube\.com\/embed\/)([^?]+)/
    ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

function getEmbedUrl(url) {
    const videoId = extractYouTubeId(url);
    if (!videoId) return url;
    return `https://www.youtube.com/embed/${videoId}`;
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('bn-BD', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}
