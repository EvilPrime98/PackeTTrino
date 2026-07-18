/**
 * Returns the main Board component. The board is the area where all the network objects are rendered.
 * This component also renders the board's SVG layer.The default event listeners set are:
 *  - ondragover: dragOverBoard
 *  - ondrop: dropItemOverBoard
 *  - onclick: closeAllAdvOptsModals
 * @returns {HTMLElement} The board component.
 */
function itemBoard() {

    const $board = document.createElement("section");

    $board.classList.add("board");
    $board.setAttribute("ondragover", "dragOverBoard(event)");
    $board.setAttribute("ondrop", "dropItemOverBoard(event)");
    $board.setAttribute("onclick", "closeAllAdvOptsModals()");

    $board.innerHTML = `
        <svg ondragover="dragOverBoard(event)" id="svg-board" rope-start="startId" rope-end="endId"
        preserveAspectRatio="none" width="100%" height="100%" style="position: absolute; top: 0; left: 0;">
        </svg>
    `;

    return $board
}

/**
 * Manages the wheel event for the document
 * @param {WheelEvent} event 
 */
function zoomBoard(event) {
    event.preventDefault();
    const $board = /** @type {HTMLElement} */ ($('.board'));
    let scale = parseFloat($board.style.scale || '1');
    scale *= event.deltaY < 0 ? 1.1 : 0.9;
    scale = Math.min(5, Math.max(0.05, scale));
    if (scale < zoomOutLimit) return;
    $board.style.scale = String(scale);
    $board.style.width = `${100 / scale}dvw`;
    $board.style.height = `${100 / scale}dvh`;
    zoomNotification(scale);
}

/**
 * Manages the drag-over event over the board.
 * @param {DragEvent} event
 * @returns {void}
 */
function dragOverBoard(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
}

/**
 * Manages the drag-start event for items alredy on the board.
 * @param {DragEvent} event
 * @returns {void}
 */
function BoardItemDragStart(event) {

    const $networkObject = event.target.closest(".item-dropped");
    const networkObjectid = $networkObject.id;
    const ip = $networkObject.getAttribute("ip-enp0s3");
    const netmask = $networkObject.getAttribute("netmask-enp0s3");
    const mac = $networkObject.getAttribute("mac-enp0s3");
    const itemType = "item-dropped";
    const x = $networkObject.style.left;
    const y = $networkObject.style.top;

    event.dataTransfer.setData("json", JSON.stringify({
        itemType: itemType,
        itemId: networkObjectid,
        ip: ip,
        netmask: netmask,
        mac: mac,
        originx: x,
        originy: y
    }));
}

/**
 * Manages the drop event over the board.
 * @param {DragEvent} event
 * @returns {void}
 */
function dropItemOverBoard(event) {
    
    event.preventDefault();

    /*only works in some browsers
    if (event.dataTransfer.files.length > 0) {
        const files = event.dataTransfer.files;
        loadState(files);
        return;
    }*/

    const item = event.dataTransfer.getData("json");
    const itemType = JSON.parse(item).itemType;
    const itemId = JSON.parse(item).itemId;
    const $board = document.querySelector(".board");
    const $networkObject = document.getElementById(itemId);
    const boardRect = $board.getBoundingClientRect();
    const scale = parseFloat($board.style.scale || '1');
    let x = (event.clientX - boardRect.left) / scale;
    let y = (event.clientY - boardRect.top) / scale;

    const boardItemRender = {
        "pc": () => PcObject(x, y),
        "router": () => RouterObject(x, y),
        "switch": () => SwitchObject(x, y),
        "dhcpserver": () => DhcpServerObject(x, y),
        "dhcprelay": () => DhcpRelayObject(x, y),
        "dnsserver": () => DnsServerObject(x, y),
        "text": () => TextObject(x, y),
    }

    if (itemType === "item" && boardItemRender[itemId]) { //<- is a item from the panel and there is a function to render it
        const $newItem = boardItemRender[itemId]();
        //add the event of dragging and dropping over a switch
        if (!itemId.startsWith("switch")) $newItem.setAttribute("ondrop", `dropPackageOverItem(event); dropSwitchOverItem(event);`);
        boardComponent.render($newItem);
        itemIndex++; //<-- increase the index of items to generate a new unique id
    }

    if (itemType === "item-dropped" && !isConnected(itemId)) {  //<-- is an item that has been dragged and does not have any connection
        [x, y] = checkObjectClip(x, y);
        $networkObject.style.left = `${x}px`;
        $networkObject.style.top = `${y}px`;
    }

}

/**
 * Manages the deletion of an item from the board and deletes the information of the device stored
 * in the buffers and the background processes associated with the device.
 * @param {Event} event
 * @returns {void}
 */
function deleteItem(event) {

    event.stopPropagation();
    const $networkObject = event.target.closest(".item-dropped") || event.target.closest(".text-annotation");
    const interfaces = getInterfaces($networkObject.id);

    if (!isConnected($networkObject.id)) {
        //remove the information of the device stored in the buffers
        delete buffer[$networkObject.id];
        delete httpBuffer[$networkObject.id];
        delete dhcpOfferBuffer[$networkObject.id];
        delete tcpBuffer[$networkObject.id];
        delete traceBuffer[$networkObject.id];
        //remove the background processes associated with the device
        clearInterval(serverLeaseTimers[$networkObject.id]);
        clearInterval(clientLeaseTimers[`${$networkObject.id}-${interfaces[0]}`]);
        delete serverLeaseTimers[$networkObject.id];
        delete clientLeaseTimers[`${$networkObject.id}-${interfaces[0]}`];
        $networkObject.remove();
    }else {
        boardComponent.render(popupMessage(`<span>Error: </span>Cannot delete a device with connections.`));
    }

}

/**
 * Manages the drop of a package over an item on the board. When successful, it will trigger the
 * installation of a package using the **dpkg** utility.
 * @param {Event} event 
 * @returns {void}
 */
function dropPackageOverItem(event) {

    const package = event.dataTransfer.getData("json");
    const $networkObject = event.target.closest(".item-dropped");
    const networkObjectId = $networkObject.id;
    const itemType = JSON.parse(package).itemType;
    const itemId = JSON.parse(package).itemId;
    const packages = ["isc-dhcp-server", "isc-dhcp-client", "isc-dhcp-relay", "bind9", "apache2"];
    
    if (itemType !== "item") return; //<-- prevents from installing packages that are not items
    if (!packages.includes(itemId)) return; //<-- prevents from installing packages that are not those we are interested in

    try {
        dpkg(networkObjectId, "install", itemId);
        boardComponent.render(popupMessage(`Package ${itemId} was installed successfully.`));
    }catch(error) {
        boardComponent.render(popupMessage(error.message));
    }

}

/**
 * Manages the drop of a switch over an item on the board.
 * @param {Event} event 
 * @returns {void}
 */
function dropSwitchOverItem(event) {
    
    const switchInfo = event.dataTransfer.getData("json");
    const switchId = JSON.parse(switchInfo).itemId;

    if (!switchId.startsWith("switch-")) return;

    const switchX = JSON.parse(switchInfo).originx;
    const switchY = JSON.parse(switchInfo).originy;
    const $networkObject = event.target.closest(".item-dropped");
    const networkObjectId = $networkObject.id;
    const networkObjectX = $networkObject.style.left;
    const networkObjectY = $networkObject.style.top;
    const availableInterface = getAvailableInterface(networkObjectId);

    if (availableInterface) {
        CableObject(networkObjectX, networkObjectY, switchX, switchY, networkObjectId, switchId, availableInterface);
        addSwitchPort(switchId, networkObjectId);
        $networkObject.setAttribute(`data-switch-${availableInterface}`, switchId);
        if(!getAvailableInterface(networkObjectId)) $networkObject.querySelector("img").draggable = false;
    }

}