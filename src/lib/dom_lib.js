/**
 * @description Queries the first DOM element matching the CSS selector within a context element.
 * @param {string} sel - CSS selector string.
 * @param {Element} [ctxEl=document] - Context element to search within. Defaults to `document`.
 * @returns {Element|null} The first matching element, or null if not found.
 */
function $(
    sel,
    ctxEl = document
){
    return ctxEl.querySelector(sel);
}

/**
 * @description Queries all DOM elements matching a CSS selector within a context element.
 * @param {string} sel - CSS selector string.
 * @param {Element} [ctxEl=document] - Context element to search within. Defaults to `document`.
 * @param {boolean} [asArray=false] - If true, returns an Array instead of a NodeList.
 * @returns {NodeList|Array<Element>} All matching elements.
 */
function $$(
    sel,
    ctxEl = document,
    asArray = false
){
    const list = ctxEl.querySelectorAll(sel);
    return (asArray) ? Array.from(list) : list;
}
