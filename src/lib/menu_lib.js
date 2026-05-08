/**
 * @description Handles interface selection changes in a device configuration menu. Reads the
 * currently selected interface from the `#iface` dropdown and populates the `#ip` and `#netmask`
 * fields with the corresponding attribute values from the network object.
 * @param {Event} event - The change event from the interface selector.
 * @param {string} selector - CSS class name (without leading dot) of the menu element.
 * @returns {void}
 */
function interfaceHandler(event, selector) {
    const $menu = document.querySelector(`.${selector}`);
    const $networkObject = document.getElementById($menu.dataset.id);
    const $ifaceSelector = $menu.querySelector("#iface");
    const networkInterface = $ifaceSelector.value;
    $menu.querySelector("#ip").value = $networkObject.getAttribute(`ip-${networkInterface}`);
    $menu.querySelector("#netmask").value = $networkObject.getAttribute(`netmask-${networkInterface}`);
}

/**
 * @description Populates the `#iface` dropdown in a device configuration menu with all available
 * interfaces retrieved from the corresponding network object on the board.
 * @param {string} selector - CSS class name (without leading dot) of the menu element.
 * @returns {void}
 */
function loadInterfaces(selector) {
    const $menu = document.querySelector(`.${selector}`);
    const $networkObject = document.getElementById($menu.dataset.id);
    const availableInterfaces = getInterfaces($networkObject.id);
    const $ifaceSelector = $menu.querySelector("#iface");
    $ifaceSelector.innerHTML = "";
    availableInterfaces.forEach(iface => $ifaceSelector.innerHTML += `<option value="${iface}">${iface}</option>`);
}
