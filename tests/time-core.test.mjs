import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { test } from 'node:test';

const moduleUrl = new URL('../assets/time-core.js', import.meta.url);

async function loadTimeCore() {
    assert.equal(existsSync(moduleUrl), true, 'assets/time-core.js 应存在');
    return import(moduleUrl);
}

test('时间核心模块已经建立', () => {
    assert.equal(existsSync(moduleUrl), true, 'assets/time-core.js 应存在');
});

test('两个生日边界都使用明确的中国标准时间', async () => {
    const { DATE_CONFIG, getBirthday12State, getUnlockState } = await loadTimeCore();
    assert.equal(DATE_CONFIG.birthday12, '2026-08-25T00:00:00+08:00');
    assert.equal(DATE_CONFIG.unlockAt18, '2032-08-18T00:00:00+08:00');

    const birthday12 = Date.parse(DATE_CONFIG.birthday12);
    assert.equal(getBirthday12State(birthday12 - 1), 'locked');
    assert.equal(getBirthday12State(birthday12), 'unlocked');
    assert.equal(getBirthday12State(birthday12 + 1), 'unlocked');

    const unlockAt = Date.parse(DATE_CONFIG.unlockAt18);
    assert.equal(getUnlockState(unlockAt - 1), 'locked');
    assert.equal(getUnlockState(unlockAt), 'unlocked');
    assert.equal(getUnlockState(unlockAt + 1), 'unlocked');
});

test('全部解封预览只允许在本地地址显式开启', async () => {
    const { isLocalUnlockPreview } = await loadTimeCore();

    assert.equal(isLocalUnlockPreview({ hostname: 'localhost', search: '?preview=unlocked' }), true);
    assert.equal(isLocalUnlockPreview({ hostname: '127.0.0.1', search: '?preview=unlocked' }), true);
    assert.equal(isLocalUnlockPreview({ hostname: 'bb6894.github.io', search: '?preview=unlocked' }), false);
    assert.equal(isLocalUnlockPreview({ hostname: 'localhost', search: '' }), false);
});

test('倒计时不会产生负数并在边界前精确到秒', async () => {
    const { DATE_CONFIG, getCountdownParts } = await loadTimeCore();
    const unlockAt = Date.parse(DATE_CONFIG.unlockAt18);

    assert.deepEqual(getCountdownParts(unlockAt - 1_000), {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 1,
    });

    assert.deepEqual(getCountdownParts(unlockAt + 86_400_000), {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });
});

test('不足一分钟的毫秒余量不会显示成 60 秒', async () => {
    const { DATE_CONFIG, getCountdownParts } = await loadTimeCore();
    const unlockAt = Date.parse(DATE_CONFIG.unlockAt18);

    assert.deepEqual(getCountdownParts(unlockAt - 59_999), {
        days: 0,
        hours: 0,
        minutes: 1,
        seconds: 0,
    });
});
