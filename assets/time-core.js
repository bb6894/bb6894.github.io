export const DATE_CONFIG = Object.freeze({
    birthday12: '2026-08-25T00:00:00+08:00',
    unlockAt18: '2032-08-18T00:00:00+08:00',
});

const SECOND_MS = 1_000;
const MINUTE_MS = 60 * SECOND_MS;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

function getDateState(target, now) {
    return now >= Date.parse(target) ? 'unlocked' : 'locked';
}

export function getBirthday12State(now = Date.now()) {
    return getDateState(DATE_CONFIG.birthday12, now);
}

export function getUnlockState(now = Date.now()) {
    return getDateState(DATE_CONFIG.unlockAt18, now);
}

export function getCountdownParts(now = Date.now()) {
    let remainingSeconds = Math.ceil(
        Math.max(0, Date.parse(DATE_CONFIG.unlockAt18) - now) / SECOND_MS,
    );
    const days = Math.floor(remainingSeconds / (DAY_MS / SECOND_MS));
    remainingSeconds %= DAY_MS / SECOND_MS;
    const hours = Math.floor(remainingSeconds / (HOUR_MS / SECOND_MS));
    remainingSeconds %= HOUR_MS / SECOND_MS;
    const minutes = Math.floor(remainingSeconds / (MINUTE_MS / SECOND_MS));
    const seconds = remainingSeconds % (MINUTE_MS / SECOND_MS);

    return { days, hours, minutes, seconds };
}
