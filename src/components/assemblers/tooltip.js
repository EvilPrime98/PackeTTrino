/**
 * Returns a tooltip based on a given text.
 * @param {string} text 
 * @returns {HTMLDivElement}
 */
function tooltip(text) {
    const $tooltip = document.createElement("div");
    $tooltip.classList.add("tooltip");
    $tooltip.innerHTML = text;  
    return $tooltip;
}