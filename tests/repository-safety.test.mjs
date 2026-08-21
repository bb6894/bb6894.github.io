import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

const gitignoreUrl = new URL('../.gitignore', import.meta.url);
const unlockClientUrl = new URL('../assets/unlock-client.js', import.meta.url);

test('未来信草稿和本地实验文件不会被意外提交', () => {
    assert.equal(existsSync(gitignoreUrl), true, '.gitignore 应存在');
    const rules = readFileSync(gitignoreUrl, 'utf8');
    for (const pattern of [
        '给18岁的自己-*.md',
        'index-locked.html',
        'index-now.html',
        'time-capsule*.html',
        '圆锁信.html',
        'output/',
        '.playwright-cli/',
        '.belt/',
        '.omo/',
        '.omx/',
    ]) {
        assert.match(rules, new RegExp(`^${pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'm'));
    }
});

test('不保留无法工作的可信解锁客户端', () => {
    assert.equal(existsSync(unlockClientUrl), false);
});
