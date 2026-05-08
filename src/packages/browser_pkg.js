/**
 * Installs the "Amin Search" browser package on a network object.
 * Sets the `browser` attribute and injects the browser option button into the
 * advanced-options modal.
 *
 * @param {HTMLElement} $networkObject - The DOM element representing the network device.
 * @returns {void}
 */
function installBrowser($networkObject) {

    terminalMessage("Installing Amin Search browser...", $networkObject.id);

    const $advancedOptions = $networkObject.querySelector(".advanced-options-modal");
    const attr = (attribute, value) => $networkObject.setAttribute(attribute, value);
    const append = (...nodes) => nodes.forEach(node => $networkObject.appendChild(node));
    const addOption = (...nodes) => nodes.forEach(node => $advancedOptions.appendChild(node));

    //browser attributes

    attr("browser", "true");

    addOption(browserOptionButton());

    terminalMessage("Amin Search browser installed successfully.", $networkObject.id);

}


/**
 * Uninstalls the "Amin Search" browser package from a network object.
 * Removes the `browser` attribute and deletes the browser option entry from the
 * advanced-options modal.
 *
 * @param {string} networkObjectId - The DOM element ID of the network device.
 * @returns {void}
 */
function uninstallBrowser(networkObjectId) {

    terminalMessage("Uninstalling Amin Search browser...", networkObjectId);

    const $networkObject = document.getElementById(networkObjectId);
    const $advancedOptions = $networkObject.querySelector(".advanced-options-modal");
    const rattr = (...attributes) => attributes.forEach(attribute => $networkObject.removeAttribute(attribute));
    const remove = (...nodes) => nodes.forEach(node => $networkObject.removeChild(node));
    const remOption = (...options) => options.forEach(option => $advancedOptions.querySelector("#" + option).remove());

    //browser attributes
    rattr("browser");

    //remove options from the advanced options
    remOption("browser-option");

    terminalMessage("Amin Search browser uninstalled successfully.", networkObjectId);
}
