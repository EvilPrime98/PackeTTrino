/**
 * Returns the dynamic routing button.
 * @returns {HTMLElement}
 */
function dynamicRoutingButton() {

    const $dynamicRouting = document.createElement("div");

    $dynamicRouting.classList.add("item", "dynrouting");

    $dynamicRouting.draggable = false;

    $dynamicRouting.innerHTML = `
        <img src="./assets/panel/dynrouter.svg" alt="dynrouting" draggable="false" style="width: 100%; height: 100%;">
        <div class="pulse"></div>
        <div class="radar-line"></div>
    `;

    return $dynamicRouting;

}