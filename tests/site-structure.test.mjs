import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

const indexPath = new URL('../index.html', import.meta.url);
const html = readFileSync(indexPath, 'utf8');
const app = readFileSync(new URL('../assets/app.js', import.meta.url), 'utf8');

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
    assert.match(html, /id="letter12Locked"/);
    assert.match(html, /id="letter12Body"[^>]*hidden/);
    assert.match(html, /id="letter18Locked"/);
    assert.match(html, /id="letter18Body"[^>]*hidden/);
    assert.match(html, /当你展开这封信的时候/);
    assert.match(html, /关于选择，我有三个建议/);
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
