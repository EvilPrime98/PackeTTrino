/** @type {ReturnType<typeof setTimeout>} */
let zoomNotifTimeout;

/**
 * Displays a notification with the current zoom level of the board. Reuses the
 * existing notification element and restarts its dismiss timer on every call, so
 * rapid zoom gestures keep it on screen instead of flickering it away mid-scroll.
 * @param {number} level
 * @returns {void}
 */
function zoomNotification(level) {

    const zoomText = `${(level * 100).toFixed(2)}%`;

    let $notif = $('#zoom-notif');

    if (!$notif) {
        $notif = document.createElement('div');
        $notif.id = 'zoom-notif';
        $('html').appendChild($notif);
    }

    $notif.textContent = zoomText;
    $notif.classList.remove('fade-out');

    clearTimeout(zoomNotifTimeout);
    zoomNotifTimeout = setTimeout(() => {
        $notif.classList.add('fade-out');
        $notif.addEventListener('animationend', () => $notif.remove(), { once: true });
    }, 1200);

}
