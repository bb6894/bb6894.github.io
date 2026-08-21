import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

const indexPath = new URL('../index.html', import.meta.url);
const html = readFileSync(indexPath, 'utf8');
const app = readFileSync(new URL('../assets/app.js', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../assets/styles.css', import.meta.url), 'utf8');

function count(pattern) {
    return [...html.matchAll(pattern)].length;
}

test('页面使用唯一且完整的 HTML 文档结构', () => {
    assert.equal(count(/<head(?:\s|>)/gi), 1);
    assert.equal(count(/<\/head>/gi), 1);
    assert.equal(count(/<body(?:\s|>)/gi), 1);
    assert.equal(count(/<\/body>/gi), 1);
    assert.equal(count(/<\/html>/gi), 1);
});

test('页面中的 id 全部唯一', () => {
    const ids = [...html.matchAll(/\sid="([^"]+)"/gi)].map((match) => match[1]);
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
    assert.deepEqual([...new Set(duplicates)], []);
});

test('样式和业务脚本外置且不使用内联事件处理器', () => {
    assert.match(html, /href="assets\/styles\.css"/);
    assert.match(html, /<script\s+type="module"\s+src="assets\/app\.js"><\/script>/);
    assert.doesNotMatch(html, /\son[a-z]+\s*=/i);
    assert.equal(count(/<script(?![^>]*\ssrc=)[^>]*>/gi), 0);
});

test('两封信都有明确的封印态与公开态内容', () => {
    assert.match(html, /id="previewBanner"[^>]*hidden/);
    assert.match(html, /id="letter12Locked"/);
    assert.match(html, /id="letter12Body"[^>]*hidden/);
    assert.match(html, /id="letter18Locked"/);
    assert.match(html, /id="letter18Body"[^>]*hidden/);
    assert.match(html, /当你展开这封信的时候/);
    assert.match(html, /关于选择，我有三个建议/);
});

test('开信仪式、阅读进度和等待六年的提示都已建立', () => {
    assert.equal(count(/class="opening-ceremony"/g), 2);
    assert.equal(count(/<progress\b/g), 2);
    assert.match(html, /这封信已经等了你 6 年/);
    assert.match(app, /prefers-reduced-motion: reduce/);
    assert.match(styles, /opening-ceremony/);
    assert.match(styles, /@keyframes letter-body-reveal/);
    assert.match(styles, /ceremony-backdrop 4\.6s/);
    assert.match(styles, /letter-body-reveal 4\.6s/);
    assert.match(app, /const OPENING_CEREMONY_MS = 4_600/);
    assert.match(app, /}, OPENING_CEREMONY_MS\);/);
    assert.match(styles, /\.letter-card\s*\{[\s\S]*?overflow:\s*clip/);
});

test('落款使用本地马善政手写字体和参考渐变', () => {
    assert.match(styles, /font-family:\s*"Ma Shan Zheng"/);
    assert.match(styles, /ma-shan-zheng-signature\.woff2/);
    assert.match(styles, /\.letter-signature\s*\{[\s\S]*?linear-gradient\(90deg,\s*var\(--amber\),\s*var\(--signature-purple\)\)/);
    assert.equal(existsSync(new URL('../assets/fonts/ma-shan-zheng-signature.woff2', import.meta.url)), true);
});

test('回应入口适合弟弟和亲友且不会伪装成公开提交', () => {
    assert.match(html, /id="replyForm"/);
    assert.match(html, /id="replyIdentity"/);
    assert.match(html, /id="replyMessage"/);
    assert.match(html, /只保存在当前设备/);
    assert.match(app, /localStorage/);
    assert.doesNotMatch(app, /fetch\s*\(/);
});

test('成长照片提供现代格式、尺寸和兼容回退', () => {
    assert.equal(count(/<picture>/g), 8);
    assert.equal(count(/type="image\/avif"/g), 8);
    assert.equal(count(/type="image\/webp"/g), 8);

    const imageTags = [...html.matchAll(/<img\b[^>]*data-photo[^>]*>/gi)].map((match) => match[0]);
    assert.equal(imageTags.length, 8);
    for (const image of imageTags) {
        assert.match(image, /loading="lazy"/);
        assert.match(image, /decoding="async"/);
        assert.match(image, /width="800"/);
        assert.match(image, /height="\d+"/);
    }

    const modernSources = [...html.matchAll(/srcset="([^"]+\.(?:avif|webp))"/gi)].map((match) => match[1]);
    for (const source of modernSources) {
        assert.equal(existsSync(new URL(`../${source}`, import.meta.url)), true, `${source} 应存在`);
    }
});

test('静态页面不依赖未配置的可信解锁接口', () => {
    assert.doesNotMatch(html, /unlock-status-endpoint/);
    assert.doesNotMatch(app, /unlock-client/);
});

test('图片占位不使用空 src', () => {
    assert.doesNotMatch(html, /<img[^>]+src=""/i);
    const images = [...html.matchAll(/<img\b[^>]*>/gi)].map((match) => match[0]);
    const missingSources = images.filter((image) => !/\ssrc="[^"]+"/i.test(image));
    assert.deepEqual(missingSources, []);
});

test('页面引用的核心本地资源存在', () => {
    const requiredFiles = [
        '../assets/styles.css',
        '../assets/app.js',
        '../assets/time-core.js',
        '../assets/site-qr.svg',
        '../music.mp3',
    ];

    for (const relativePath of requiredFiles) {
        assert.equal(existsSync(new URL(relativePath, import.meta.url)), true, `${relativePath} 应存在`);
    }
});
