import {
    DATE_CONFIG,
    getBirthday12State,
    getCountdownParts,
    getUnlockState,
} from './time-core.js';
import { CANONICAL_URL, createShareData } from './share-core.js';

const $ = (id) => document.getElementById(id);

const dom = {
    backgroundCanvas: $('backgroundCanvas'),
    backgroundMusic: $('backgroundMusic'),
    musicButton: $('musicButton'),
    musicIcon: $('musicIcon'),
    shareButton: $('shareButton'),
    age12Pill: $('age12Pill'),
    age18Pill: $('age18Pill'),
    currentTime: $('currentTime'),
    countdownTitle: $('countdownTitle'),
    days: $('days'),
    hours: $('hours'),
    minutes: $('minutes'),
    seconds: $('seconds'),
    letter12: $('letter12'),
    letter12Status: $('letter12Status'),
    letter12Locked: $('letter12Locked'),
    letter12Body: $('letter12Body'),
    letter18: $('letter18'),
    letter18Status: $('letter18Status'),
    letter18Locked: $('letter18Locked'),
    letter18Body: $('letter18Body'),
    photoGrid: $('photoGrid'),
    lightboxDialog: $('lightboxDialog'),
    lightboxImage: $('lightboxImage'),
    lightboxCaption: $('lightboxCaption'),
    lightboxCounter: $('lightboxCounter'),
    lightboxCloseButton: $('lightboxCloseButton'),
    lightboxPreviousButton: $('lightboxPreviousButton'),
    lightboxNextButton: $('lightboxNextButton'),
    shareDialog: $('shareDialog'),
    shareCloseButton: $('shareCloseButton'),
    sharePreview: $('sharePreview'),
    shareCanvas: $('shareCanvas'),
    siteQrCode: $('siteQrCode'),
    systemShareButton: $('systemShareButton'),
    copyLinkButton: $('copyLinkButton'),
    downloadPosterButton: $('downloadPosterButton'),
    verifyUnlockButton: $('verifyUnlockButton'),
    unlockDialog: $('unlockDialog'),
    unlockCloseButton: $('unlockCloseButton'),
    unlockConfirmButton: $('unlockConfirmButton'),
    unlockMessage: $('unlockMessage'),
    toast: $('toast'),
};

let lightboxIndex = 0;
let lightboxItems = [];
let posterDataUrl = '';
let toastTimer = 0;
let pointerStartX = null;

function openDialog(dialog) {
    if (typeof dialog.showModal === 'function') {
        if (!dialog.open) {
            dialog.showModal();
        }
        return;
    }
    dialog.setAttribute('open', '');
}

function closeDialog(dialog) {
    if (typeof dialog.close === 'function' && dialog.open) {
        dialog.close();
        return;
    }
    dialog.removeAttribute('open');
}

function showToast(message) {
    window.clearTimeout(toastTimer);
    dom.toast.textContent = message;
    dom.toast.classList.add('toast-visible');
    toastTimer = window.setTimeout(() => {
        dom.toast.classList.remove('toast-visible');
    }, 2600);
}

function updateClock(now = Date.now()) {
    const formatter = new Intl.DateTimeFormat('zh-CN', {
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    });
    dom.currentTime.textContent = `当前时间：${formatter.format(new Date(now))}`;
}

function updateCountdown(now = Date.now()) {
    const countdown = getCountdownParts(now);
    dom.days.textContent = String(countdown.days);
    dom.hours.textContent = String(countdown.hours).padStart(2, '0');
    dom.minutes.textContent = String(countdown.minutes).padStart(2, '0');
    dom.seconds.textContent = String(countdown.seconds).padStart(2, '0');
}

function setPillState(pill, label, unlocked) {
    pill.textContent = `${label} · ${unlocked ? '已开启' : '待开启'}`;
    pill.classList.toggle('age-pill-open', unlocked);
    pill.classList.toggle('age-pill-locked', !unlocked);
}

function setLetterState({ card, status, lockedPanel, body, unlocked }) {
    card.classList.toggle('letter-card-open', unlocked);
    card.classList.toggle('letter-card-locked', !unlocked);
    status.textContent = unlocked ? '已开启' : '封印中';
    status.classList.toggle('letter-status-open', unlocked);
    status.classList.toggle('letter-status-locked', !unlocked);
    lockedPanel.hidden = unlocked;
    body.hidden = !unlocked;
}

function updateMilestoneStates(now = Date.now()) {
    const birthday12Unlocked = getBirthday12State(now) === 'unlocked';
    const birthday18Unlocked = getUnlockState(now) === 'unlocked';

    setPillState(dom.age12Pill, '12岁', birthday12Unlocked);
    setPillState(dom.age18Pill, '18岁', birthday18Unlocked);
    setLetterState({
        card: dom.letter12,
        status: dom.letter12Status,
        lockedPanel: dom.letter12Locked,
        body: dom.letter12Body,
        unlocked: birthday12Unlocked,
    });
    setLetterState({
        card: dom.letter18,
        status: dom.letter18Status,
        lockedPanel: dom.letter18Locked,
        body: dom.letter18Body,
        unlocked: birthday18Unlocked,
    });
    dom.countdownTitle.textContent = birthday18Unlocked
        ? '18岁生日已经到来'
        : '距离 18 岁生日还有';
}

function updateTimeDisplays() {
    const now = Date.now();
    updateClock(now);
    updateCountdown(now);
    updateMilestoneStates(now);
}

function startTimeDisplays() {
    updateTimeDisplays();
    window.setInterval(updateTimeDisplays, 1_000);
}

function updateMusicButton(isPlaying) {
    dom.musicButton.setAttribute('aria-pressed', String(isPlaying));
    dom.musicButton.setAttribute('aria-label', isPlaying ? '暂停背景音乐' : '播放背景音乐');
    dom.musicIcon.textContent = isPlaying ? '🎵' : '🔇';
}

async function toggleMusic() {
    if (!dom.backgroundMusic.paused) {
        dom.backgroundMusic.pause();
        updateMusicButton(false);
        return;
    }

    try {
        dom.backgroundMusic.volume = 0.38;
        await dom.backgroundMusic.play();
        updateMusicButton(true);
    } catch {
        updateMusicButton(false);
        showToast('浏览器阻止了播放，请再次点击音乐按钮');
    }
}

function updateLightbox() {
    const item = lightboxItems[lightboxIndex];
    if (!item) {
        return;
    }
    dom.lightboxImage.src = item.src;
    dom.lightboxImage.alt = item.alt;
    dom.lightboxCaption.textContent = item.caption;
    dom.lightboxCounter.textContent = `${lightboxIndex + 1} / ${lightboxItems.length}`;
}

function openLightbox(index) {
    lightboxIndex = index;
    updateLightbox();
    openDialog(dom.lightboxDialog);
}

function moveLightbox(direction) {
    lightboxIndex = (lightboxIndex + direction + lightboxItems.length) % lightboxItems.length;
    updateLightbox();
}

function initLightbox() {
    const buttons = [...dom.photoGrid.querySelectorAll('.photo-item')];
    lightboxItems = buttons.map((button) => {
        const image = button.querySelector('img');
        return {
            src: image.currentSrc || image.src,
            alt: image.alt,
            caption: button.dataset.caption ?? '',
        };
    });

    buttons.forEach((button, index) => {
        button.addEventListener('click', () => openLightbox(index));
    });

    dom.lightboxCloseButton.addEventListener('click', () => closeDialog(dom.lightboxDialog));
    dom.lightboxPreviousButton.addEventListener('click', () => moveLightbox(-1));
    dom.lightboxNextButton.addEventListener('click', () => moveLightbox(1));

    dom.lightboxDialog.addEventListener('click', (event) => {
        if (event.target === dom.lightboxDialog) {
            closeDialog(dom.lightboxDialog);
        }
    });

    dom.lightboxDialog.addEventListener('pointerdown', (event) => {
        pointerStartX = event.clientX;
    });
    dom.lightboxDialog.addEventListener('pointerup', (event) => {
        if (pointerStartX === null) {
            return;
        }
        const distance = pointerStartX - event.clientX;
        pointerStartX = null;
        if (Math.abs(distance) >= 54) {
            moveLightbox(distance > 0 ? 1 : -1);
        }
    });

    document.addEventListener('keydown', (event) => {
        if (!dom.lightboxDialog.open) {
            return;
        }
        if (event.key === 'ArrowLeft') {
            moveLightbox(-1);
        }
        if (event.key === 'ArrowRight') {
            moveLightbox(1);
        }
    });
}

function wrapCanvasText(context, text, x, y, maxWidth, lineHeight) {
    const characters = [...text];
    let line = '';
    let currentY = y;

    for (const character of characters) {
        const candidate = line + character;
        if (context.measureText(candidate).width > maxWidth && line) {
            context.fillText(line, x, currentY);
            line = character;
            currentY += lineHeight;
        } else {
            line = candidate;
        }
    }
    if (line) {
        context.fillText(line, x, currentY);
    }
    return currentY;
}

async function ensureImageReady(image) {
    if (image.complete && image.naturalWidth > 0) {
        return;
    }
    if (typeof image.decode === 'function') {
        await image.decode();
        return;
    }
    await new Promise((resolve, reject) => {
        image.addEventListener('load', resolve, { once: true });
        image.addEventListener('error', reject, { once: true });
    });
}

async function generatePoster() {
    const canvas = dom.shareCanvas;
    const context = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const countdown = getCountdownParts(Date.now());

    const background = context.createLinearGradient(0, 0, width, height);
    background.addColorStop(0, '#0a0a11');
    background.addColorStop(0.55, '#17131f');
    background.addColorStop(1, '#241525');
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);

    context.strokeStyle = 'rgba(216,170,115,0.38)';
    context.lineWidth = 2;
    context.strokeRect(34, 34, width - 68, height - 68);

    context.textAlign = 'center';
    context.fillStyle = '#d8aa73';
    context.font = '600 18px "Songti SC", serif';
    context.fillText('写于 2026 年夏', width / 2, 108);

    context.fillStyle = '#f5efe6';
    context.font = '700 62px "Kaiti SC", serif';
    context.fillText('时光胶囊', width / 2, 190);

    context.fillStyle = 'rgba(245,239,230,0.72)';
    context.font = '400 22px "Songti SC", serif';
    wrapCanvasText(context, '哥哥写给弟弟的一封信，记录十二岁的此刻，等待十八岁的未来。', width / 2, 242, 460, 34);

    const units = [
        [countdown.days, '天'],
        [countdown.hours, '时'],
        [countdown.minutes, '分'],
        [countdown.seconds, '秒'],
    ];
    units.forEach(([value, label], index) => {
        const boxWidth = 112;
        const gap = 14;
        const startX = (width - (boxWidth * 4 + gap * 3)) / 2;
        const x = startX + index * (boxWidth + gap);
        context.fillStyle = 'rgba(255,255,255,0.05)';
        context.fillRect(x, 330, boxWidth, 108);
        context.strokeStyle = 'rgba(216,170,115,0.25)';
        context.strokeRect(x, 330, boxWidth, 108);
        context.fillStyle = '#f5efe6';
        context.font = '700 36px Consolas, monospace';
        context.fillText(String(value), x + boxWidth / 2, 380);
        context.fillStyle = 'rgba(245,239,230,0.6)';
        context.font = '400 15px "Songti SC", serif';
        context.fillText(label, x + boxWidth / 2, 415);
    });

    context.fillStyle = '#d8aa73';
    context.font = '700 24px "Kaiti SC", serif';
    context.fillText('“这是天生的，不需要你证明什么。”', width / 2, 510);

    await ensureImageReady(dom.siteQrCode);
    context.fillStyle = '#ffffff';
    context.fillRect(width / 2 - 96, 574, 192, 192);
    context.drawImage(dom.siteQrCode, width / 2 - 88, 582, 176, 176);

    context.fillStyle = 'rgba(245,239,230,0.78)';
    context.font = '600 18px "Songti SC", serif';
    context.fillText('扫码打开时光胶囊', width / 2, 800);
    context.fillStyle = 'rgba(245,239,230,0.44)';
    context.font = '400 15px Consolas, monospace';
    context.fillText(CANONICAL_URL, width / 2, 834);

    posterDataUrl = canvas.toDataURL('image/png');
    dom.sharePreview.src = posterDataUrl;
}

async function openShareDialog() {
    openDialog(dom.shareDialog);
    try {
        await generatePoster();
    } catch {
        showToast('海报生成失败，但仍可复制链接或扫码访问');
    }
}

async function shareWithSystem() {
    if (!navigator.share) {
        showToast('当前浏览器不支持系统分享，请复制链接');
        return;
    }
    try {
        await navigator.share(createShareData());
    } catch (error) {
        if (error?.name !== 'AbortError') {
            showToast('系统分享失败，请复制链接');
        }
    }
}

async function copyCanonicalLink() {
    try {
        await navigator.clipboard.writeText(CANONICAL_URL);
        showToast('链接已复制');
    } catch {
        const textArea = document.createElement('textarea');
        textArea.value = CANONICAL_URL;
        textArea.setAttribute('readonly', '');
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        const copied = document.execCommand('copy');
        textArea.remove();
        showToast(copied ? '链接已复制' : `请手动复制：${CANONICAL_URL}`);
    }
}

async function downloadPoster() {
    if (!posterDataUrl) {
        await generatePoster();
    }
    const link = document.createElement('a');
    link.href = posterDataUrl;
    link.download = '时光胶囊-分享海报.png';
    link.click();
}

function initShare() {
    dom.shareButton.addEventListener('click', openShareDialog);
    dom.shareCloseButton.addEventListener('click', () => closeDialog(dom.shareDialog));
    dom.systemShareButton.addEventListener('click', shareWithSystem);
    dom.copyLinkButton.addEventListener('click', copyCanonicalLink);
    dom.downloadPosterButton.addEventListener('click', downloadPoster);
    dom.shareDialog.addEventListener('click', (event) => {
        if (event.target === dom.shareDialog) {
            closeDialog(dom.shareDialog);
        }
    });
}

function verifyUnlock() {
    const unlocked = getUnlockState(Date.now()) === 'unlocked';
    updateMilestoneStates();
    openDialog(dom.unlockDialog);
    dom.unlockMessage.textContent = unlocked
        ? '生日日期已经到达，十八岁信件已自动开启。'
        : '封印尚未到期，请在 2032 年 8 月 18 日零点后再来。';
}

function initUnlockDialog() {
    dom.verifyUnlockButton.addEventListener('click', verifyUnlock);
    dom.unlockCloseButton.addEventListener('click', () => closeDialog(dom.unlockDialog));
    dom.unlockConfirmButton.addEventListener('click', () => closeDialog(dom.unlockDialog));
    dom.unlockDialog.addEventListener('click', (event) => {
        if (event.target === dom.unlockDialog) {
            closeDialog(dom.unlockDialog);
        }
    });
}

function initParticles() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    const canvas = dom.backgroundCanvas;
    const context = canvas.getContext('2d');
    const particles = Array.from({ length: 34 }, () => ({
        x: Math.random(),
        y: Math.random(),
        radius: 0.7 + Math.random() * 1.8,
        speed: 0.00008 + Math.random() * 0.00016,
        drift: (Math.random() - 0.5) * 0.00008,
        opacity: 0.14 + Math.random() * 0.32,
    }));
    let animationFrame = 0;
    let previousTime = performance.now();

    function resizeCanvas() {
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.floor(window.innerWidth * ratio);
        canvas.height = Math.floor(window.innerHeight * ratio);
        canvas.style.width = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    function drawParticles(time) {
        const elapsed = Math.min(time - previousTime, 40);
        previousTime = time;
        context.clearRect(0, 0, window.innerWidth, window.innerHeight);

        for (const particle of particles) {
            particle.y -= particle.speed * elapsed;
            particle.x += particle.drift * elapsed;
            if (particle.y < -0.02) {
                particle.y = 1.02;
                particle.x = Math.random();
            }
            if (particle.x < -0.02 || particle.x > 1.02) {
                particle.x = Math.random();
            }
            context.beginPath();
            context.fillStyle = `rgba(216, 170, 115, ${particle.opacity})`;
            context.arc(
                particle.x * window.innerWidth,
                particle.y * window.innerHeight,
                particle.radius,
                0,
                Math.PI * 2,
            );
            context.fill();
        }

        animationFrame = window.requestAnimationFrame(drawParticles);
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });
    animationFrame = window.requestAnimationFrame(drawParticles);
    document.addEventListener('visibilitychange', () => {
        window.cancelAnimationFrame(animationFrame);
        if (!document.hidden) {
            previousTime = performance.now();
            animationFrame = window.requestAnimationFrame(drawParticles);
        }
    });
}

function init() {
    startTimeDisplays();
    initParticles();
    initLightbox();
    initShare();
    initUnlockDialog();
    dom.musicButton.addEventListener('click', toggleMusic);
    dom.backgroundMusic.addEventListener('pause', () => updateMusicButton(false));
    dom.backgroundMusic.addEventListener('play', () => updateMusicButton(true));
    dom.backgroundMusic.addEventListener('error', () => showToast('背景音乐加载失败'));
}

init();
