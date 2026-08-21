import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { test } from 'node:test';

const moduleUrl = new URL('../assets/share-core.js', import.meta.url);

async function loadShareCore() {
    assert.equal(existsSync(moduleUrl), true, 'assets/share-core.js 应存在');
    return import(moduleUrl);
}

test('分享链接固定为正式 GitHub Pages 地址', async () => {
    const { CANONICAL_URL, createShareData } = await loadShareCore();
    assert.equal(CANONICAL_URL, 'https://bb6894.github.io/');
    assert.deepEqual(createShareData(), {
        title: '时光胶囊 | 给未来的你',
        text: '哥哥写给弟弟的一封时光胶囊，分别在12岁与18岁开启。',
        url: 'https://bb6894.github.io/',
    });
});
