/**
 * Creates a fire effect on a network object.
 * @param {string} networkObjectId - DOM ID of the network object.
 * @param {number} [duration=2000] - Duration of the fire effect in milliseconds.
 * @returns {void}
 */
// [agent-added: esm-migration phase 04]
export function igniteFire(
    networkObjectId,
    duration = 2000
) {
    const $networkObject = document.getElementById(networkObjectId);
    const $fire = document.createElement("div");
    $fire.classList.add("fire-container");
    $fire.innerHTML = `
        <div class="heat-haze"></div>
        <img src="./assets/fire.svg" class="fire-img" alt="Animated fire">
    `;
    $networkObject.appendChild($fire);
    setTimeout(() => {
        $fire.remove();
    }, duration);
}