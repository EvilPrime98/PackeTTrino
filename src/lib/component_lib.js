/**
 * @description Represents a component token tied to a CSS selector. Provides methods to render
 * child components into all matching elements and attach event listeners.
 */
class componentToken {

    /**
     * @param {string} element - CSS selector for the target DOM element(s).
     */
    constructor(element) {
        this.element = element;
    }

    /**
     * @description Appends one or more components as children to all elements matching the stored
     * selector. Awaits all component Promises before appending.
     * @param {...Promise<Element>|Element} componentes - Component elements or Promises resolving to elements.
     * @returns {Promise<void>}
     */
    async render(...componentes) {
        const $elements = document.querySelectorAll(this.element);
        componentes = await Promise.all(componentes);
        $elements.forEach($element => {
            componentes.forEach(componente => $element.appendChild(componente));
        });
    }

    /**
     * @description Attaches an event listener to all elements matching the stored selector.
     * @param {string} evento - Event type (e.g. "click", "change").
     * @param {Function} resultado - Event handler callback.
     * @returns {void}
     */
    event(evento, resultado) {
        const $elements = document.querySelectorAll(this.element);
        $elements.forEach( $element => $element.addEventListener(evento, resultado));
    }

}

/**
 * @description Clamps the position of a board object so it stays fully visible within the board
 * boundaries, adding a small spare margin on each edge.
 * @param {number} x - Proposed horizontal position in pixels.
 * @param {number} y - Proposed vertical position in pixels.
 * @returns {[number, number]} Adjusted [x, y] position that keeps the object within the board.
 */
function checkObjectClip(x, y) {

    const $board = document.querySelector(".board");
    const boardProperties = window.getComputedStyle($board, null);
    const boardHeight = parseInt(boardProperties.getPropertyValue("height"));
    const boardWidth = parseInt(boardProperties.getPropertyValue("width"));
    const objectWidth = 80;
    const objectHeight = 80;
    const spareSpace = 10;
    let newX = x;
    let newY = y;

    //compute the object position relative to its position on the board

    const objectLeft = (x - objectWidth / 2);
    const objectRight = (x + objectWidth / 2);
    const objectTop = (y - objectHeight / 2);
    const objectBot = (y + objectHeight / 2);

    if (objectLeft < 0) { //the object ends up clipped on the left
        const diffLeft = Math.abs(objectLeft);
        newX = x + diffLeft + spareSpace;
    }

    if (objectRight > boardWidth) { //the object ends up clipped on the right
        const diffRight = Math.abs(objectRight - boardWidth);
        newX = x - diffRight - spareSpace;
    }

    if (objectTop < 0) { //the object ends up clipped at the top
        const diffTop = Math.abs(objectTop);
        newY = y + diffTop + spareSpace;
    }

    if (objectBot > boardHeight) { //the object ends up clipped at the bottom
        const diffBot = Math.abs(objectBot - boardHeight);
        newY = y - diffBot - spareSpace;
    }

    return [newX, newY];
}

/**
 * @description Displays the advanced-options modal for the network object nearest to the right-click
 * position, positioning the modal in the screen quadrant opposite the cursor to avoid clipping.
 * @param {MouseEvent} event - The contextmenu mouse event.
 * @returns {void}
 */
function showAdvancedOptions(event) {

    event.preventDefault();
    event.stopPropagation();

    const $board = document.querySelector(".board");
    const boardProperties = window.getComputedStyle($board, null);
    const boardHeight = parseInt(boardProperties.getPropertyValue("height")); //board height
    const boardWidth = parseInt(boardProperties.getPropertyValue("width"));
    const boardRect = $board.getBoundingClientRect();
    const networkObject = event.target.closest(".item-dropped") || event.target.closest(".text-annotation");
    const $modal = networkObject.querySelector(".advanced-options-modal");
    const x = event.clientX - boardRect.left;
    const y = event.clientY - boardRect.top;

    if (y < boardHeight / 2 && x < boardWidth / 2) {
        $modal.style.top = "30%";
        $modal.style.bottom = "";
        $modal.style.left = "50%";
        $modal.style.right = "";
    }

    if (y < boardHeight / 2 && x > boardWidth / 2) {
        $modal.style.top = "30%";
        $modal.style.bottom = "";
        $modal.style.left = "";
        $modal.style.right = "30%";
    }

    if (y > boardHeight / 2 && x < boardWidth / 2) {
        $modal.style.top = "";
        $modal.style.bottom = "30%";
        $modal.style.left = "30%";
        $modal.style.right = "";
    }

    if (y > boardHeight / 2 && x > boardWidth / 2) {
        $modal.style.top = "";
        $modal.style.bottom = "30%";
        $modal.style.left = "";
        $modal.style.right = "30%";
    }

    if (darkMode) $modal.classList.add("modal-dark-mode")
    else $modal.classList.remove("modal-dark-mode");

    $modal.style.display = "flex";
}

/**
 * @description Shows a table modal for a network object, auto-adjusting its CSS position so it
 * stays within the board boundaries relative to the object's current location on the board.
 * @param {MouseEvent} event - The triggering mouse event.
 * @param {string} selector - CSS selector for the table modal element within the network object.
 * @returns {void}
 */
function showObjectModalTable(event, selector) {

    event.preventDefault();
    event.stopPropagation();

    const $board = document.querySelector(".board");
    const $networkObject = event.target.closest(".item-dropped")
    const $advancedOptionsModal = $networkObject.querySelector(".advanced-options-modal");
    const $Table = $networkObject.querySelector(selector);
    const boardProperties = window.getComputedStyle($board, null);
    const boardHeight = parseInt(boardProperties.getPropertyValue("height"));
    const boardWidth = parseInt(boardProperties.getPropertyValue("width"));
    const objectX = parseInt($networkObject.style.left);
    const objectY = parseInt($networkObject.style.top);

    //get the element's width and height

    $Table.style.display = "flex";
    const currentTableWidth = parseInt($Table.offsetWidth);
    const currentTableHeight = parseInt($Table.offsetHeight);
    $Table.style.display = "none";

    //initialize the table modal position

    $Table.style.left = "50%";
    $Table.style.top = "50%";

    //adjust the modal position based on diffX and diffY

    const tableLeftSide = objectX - currentTableWidth / 2;
    const tableRightSide = objectX + currentTableWidth / 2;
    const tableTopSide = objectY - currentTableHeight / 2;
    const tableBotSide = objectY + currentTableHeight / 2;

    if ( tableLeftSide < 0) { //the modal ends up clipped on the left
        const diffLeftSide = parseInt(0 - tableLeftSide);
        $Table.style.left = `calc(50% + ${Math.abs(diffLeftSide)}px + 5px)`;
    }

    if (tableRightSide > boardWidth) { //the modal ends up clipped on the right
        const diffRightSide = parseInt(tableRightSide - boardWidth);
        $Table.style.left = `calc(50% - ${Math.abs(diffRightSide)}px - 5px)`;
    }

    if (tableTopSide < 0) { //the modal ends up clipped at the top
        const diffTopSide = parseInt(0 - tableTopSide);
        $Table.style.top = `calc(50% + ${Math.abs(diffTopSide)}px + 5px)`;
    }

    if (tableBotSide > boardHeight) { //the modal ends up clipped at the bottom
        const diffBotSide = parseInt(tableBotSide - boardHeight);
        $Table.style.top = `calc(50% - ${Math.abs(diffBotSide)}px - 5px)`;
    }

    $advancedOptionsModal.style.display = "none";

    if (darkMode) $Table.classList.add("dark-mode")
    else $Table.classList.remove("dark-mode");

    $Table.style.display = "flex";

}

/**
 * @description Hides the table modal for a network object.
 * @param {MouseEvent} event - The triggering mouse event.
 * @param {string} selector - CSS selector for the table modal element within the network object.
 * @returns {void}
 */
function closeObjectModalTable(event, selector) {
    event.stopPropagation();
    const $networkObject = event.target.closest(".item-dropped");
    const $table = $networkObject.querySelector(selector);
    $table.style.display = "none";
}

/**
 * @description Creates and appends a packet indicator icon over the network object identified by
 * the given id, positioned at the object's current board coordinates.
 * @param {string} id - DOM id of the target network object element.
 * @returns {void}
 */
function createPacketIndicator(id) {

    const $networkObject = document.getElementById(id)
    const $board = document.querySelector(".board");

    //create the indicator
    const $indicator = document.createElement("article");
    const $indicatorIcon = document.createElement("img");
    $indicator.classList.add("pack-cursor");
    $indicatorIcon.src = "./assets/board/pack.svg";
    $indicator.appendChild($indicatorIcon);

    //get the object's coordinates
    const x = parseInt($networkObject.style.left);
    const y = parseInt($networkObject.style.top);
    $indicator.style.left = `${x}px`;
    $indicator.style.top = `${y}px`;

    //append the indicator to the board
    $board.appendChild($indicator);
}

/**
 * @description Returns all SVG `<line>` and `<circle>` connection elements whose `end-start`
 * attribute matches the given network object id.
 * @param {string} networkObjectId - DOM id of the network object whose connections to retrieve.
 * @returns {[SVGLineElement[], SVGCircleElement[]]} Tuple of [lines, circles] connected to the object.
 */
function getConns(networkObjectId) {
    const $lines = document.querySelectorAll("line");
    const $circles = document.querySelectorAll("circle");
    const finalLines = [];
    const finalCircles = [];

    for (let i = 0; i < $lines.length; i++) {
        const conn = $lines[i];
        if (conn.getAttribute("end-start") === networkObjectId) {
            finalLines.push(conn);
        }
    }

    for (let i = 0; i < $circles.length; i++) {
        const conn = $circles[i];
        if (conn.getAttribute("end-start") === networkObjectId) {
            finalCircles.push(conn);
        }
    }

    return [finalLines, finalCircles];
}

/**
 * @description Enables dragging of a modal dialog. On mousedown, locks the modal to a fixed
 * position and follows cursor movement, clamped to the viewport. Restores the cursor and
 * focuses any input inside the modal on release.
 * @param {MouseEvent} event - The mousedown event on the modal's drag handle.
 * @returns {void}
 */
function dragModal(event) {

    event.preventDefault();
    const $modal = event.target.closest(".draggable-modal");
    const rect = $modal.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;

    $modal.style.left = `${rect.left}px`;
    $modal.style.top = `${rect.top}px`;
    $modal.style.transform = 'none';
    $modal.style.position = 'fixed';

    function moveModal(moveEvent) {
        const x = moveEvent.clientX - offsetX;
        const y = moveEvent.clientY - offsetY;
        const maxX = window.innerWidth - $modal.offsetWidth;
        const maxY = window.innerHeight - $modal.offsetHeight;
        $modal.style.left = `${Math.max(0, Math.min(x, maxX))}px`;
        $modal.style.top = `${Math.max(0, Math.min(y, maxY))}px`;
        document.body.style.cursor = "grabbing";
    }

    function stopDraggingModal() {
        document.body.style.cursor = "default";
        document.removeEventListener('mousemove', moveModal);
        document.removeEventListener('mouseup', stopDraggingModal);
        const input = $modal.querySelector('input');
        if (input) input.focus();
    }

    document.addEventListener('mousemove', moveModal);
    document.addEventListener('mouseup', stopDraggingModal);

}

/**
 * @description Initiates smooth dragging of a board item (`.item-dropped`) by listening to
 * mousemove events and updating the element's position, clamped within board boundaries.
 * @param {MouseEvent} event - The mousedown event on the board item.
 * @returns {void}
 */
function startBoardItemMove(event) {

    const $networkObject = event.target.closest(".item-dropped");

    document.addEventListener("mousemove", boardItemMove);
    document.addEventListener("mouseup", boardItemMoveStop);

    function boardItemMove(event) {
        const [x, y] = checkObjectClip(event.clientX, event.clientY);
        $networkObject.style.left = `${x}px`;
        $networkObject.style.top = `${y}px`;
        event.stopPropagation();
    }

    function boardItemMoveStop() {
        document.removeEventListener("mousemove", boardItemMove);
        document.removeEventListener("mouseup", boardItemMoveStop);
    }

}

/**
 * @description Splits a string on only the first occurrence of the separator.
 * @param {string} text - Input string.
 * @param {string} separator - Separator to split on.
 * @returns {string[]} Array with at most two elements: the part before and the part after the first match.
 *   Returns a single-element array if the separator is not found.
 */
function splitFirst(text, separator) {
    const index = text.indexOf(separator);
    if (index === -1) return [text];
    return [text.substring(0, index), text.substring(index + separator.length)];
}

/**
 * @description Splits a string on only the last occurrence of the separator.
 * @param {string} text - Input string.
 * @param {string} separator - Separator to split on.
 * @returns {string[]} Array with at most two elements: the part before and the part after the last match.
 *   Returns a single-element array if the separator is not found.
 */
function splitLast(text, separator) {
    const index = text.lastIndexOf(separator);
    if (index === -1) return [text];
    return [text.substring(0, index), text.substring(index + separator.length)];
}

/**
 * @description Handles the file input change event in the panel, displaying a popup message with
 * the name of the uploaded file.
 * @param {Event} event - The file input `change` event.
 * @returns {void}
 */
function fileInputChangeHandler(event) {
    const fileName = event.target.files[0].name;
    bodyComponent.render(popupMessage(`File <em>${fileName}</em> loaded successfully. To display the contents, click:`, "/assets/panel/load.svg"));
}

/**
 * @description Handles the load action in the panel. Shows an error popup if no file has been
 * selected, otherwise prompts the user to confirm loading the selected file.
 * @returns {void}
 */
function fileInputLoadHandler() {

    const $inputFile = document.getElementById("fileInput");

    if ($inputFile.files.length === 0) {
        boardComponent.render(popupMessage("Please upload a file first."));
        return;
    }

    const fileName = $inputFile.files[0].name;

    bodyComponent.render(confirmPopup(`Do you want to load the file ${fileName}?`, loadState));

}

/**
 * @description Serialises the current board workspace as an HTML blob and triggers a browser
 * download with the filename `red.ptt`.
 * @returns {void}
 */
function downloadState() {
    const $workspace = document.querySelector(".board");
    const workspaceHTML = ($workspace.innerHTML).replace(/\s+/g, " ");
    const blob = new Blob([workspaceHTML], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const $link = document.createElement("a");
    $link.href = url;
    $link.download = "red.ptt";
    document.body.appendChild($link);
    $link.click();
    document.body.removeChild($link);
    URL.revokeObjectURL(url);
}

/**
 * @description Loads a previously saved workspace from a `.ptt` file into the board. After
 * injecting the HTML, it cleans up timers, resets ARP/DNS cache tables, recalculates the item
 * index, restores text-annotation input values, and restarts DHCP lease timers.
 * @param {FileList|undefined} [files] - Optional FileList from a drop event. If omitted, reads
 *   from the `#fileInput` element.
 * @returns {void}
 */
function loadState(files = undefined) {

    const $inputFile = (!files)
    ? (document.getElementById("fileInput").files[0])
    : files[0];

    const reader = new FileReader();

    reader.onload = function (event) {
        const content = event.target.result;
        document.querySelector(".board").innerHTML = content;
        cleanUpWorkspace();
        resetArpTables();
        resetDnsCacheTables();
        setNewIndex();
        setTextContents();
        startLeaseTimers();
    };

    reader.readAsText($inputFile);

    function setNewIndex() {

        const itemsDropped = document.querySelectorAll(".item-dropped");
        const itemsText = document.querySelectorAll(".text-annotation");
        const indexes = [];

        itemsDropped.forEach(item => {
            const itemid = item.id;
            const itemindex = parseInt(itemid.split("-")[1]);
            if (!isNaN(itemindex)) indexes.push(itemindex);
        });

        itemsText.forEach(item => {
            const itemid = item.id;
            const itemindex = parseInt(itemid.split("-")[1]);
            if (!isNaN(itemindex)) indexes.push(itemindex);
        });

        itemIndex = (indexes.length > 0) ? Math.max(...indexes) + 1 : 1;

    }

    function setTextContents() {

        const itemsText = document.querySelectorAll(".text-annotation");

        for (let i = 0; i < itemsText.length; i++) {
            const text = itemsText[i].getAttribute("data-text");
            const input = itemsText[i].querySelector("input");
            input.value = text;
        }
    }

}

/**
 * @description Handles the `dragstart` event for panel items. Encodes the dragged item's type
 * and id into the dataTransfer object as JSON so the drop target can identify the item.
 * @param {DragEvent} event - The dragstart event.
 * @returns {void}
 */
function dragStart(event) {
    const networkObjectId = event.target.closest("img").alt;
    const itemType = "item";

    event.dataTransfer.setData("json", JSON.stringify({
        itemType: itemType,
        itemId: networkObjectId,
    }));

}

/**
 * @description Toggles the quick-ping cursor mode. When activated, hides the default cursor and
 * shows a custom packet icon that follows the mouse. Calling the function again while active
 * deactivates the mode and removes the custom cursor.
 * @returns {void}
 */
function quickPingStart() {

    if (quickPingToggle) {
        quickPingEnd();
        return;
    }

    quickPingToggle = true;

    //create the cursor
    const $cursor = document.createElement("article");
    const $cursorIcon = document.createElement("img");
    $cursor.classList.add("pack-cursor");
    $cursorIcon.src = "./assets/board/pack.svg";
    $cursor.appendChild($cursorIcon);
    document.body.appendChild($cursor);

    //hide the default cursor
    document.body.style.cursor = "none";

    //mouse events
    document.addEventListener("mousemove", moveCursor);

    function moveCursor(event) {
        $cursor.style.top = `${event.clientY}px`;
        $cursor.style.left = `${event.clientX}px`;
    }

    function quickPingEnd() {
        quickPingToggle = false;
        const $cursor = document.querySelectorAll(".pack-cursor");
        $cursor.forEach(cursor => { cursor.removeEventListener("mousemove", moveCursor); });
        $cursor.forEach(cursor => { cursor.remove(); });
        document.body.style.cursor = "default";
    }

}

/**
 * @description Appends a tooltip with the given name to the panel item that contains the event
 * target. Does nothing if a tooltip is already present.
 * @param {string} name - Text to display inside the tooltip.
 * @param {MouseEvent} event - The mouseenter event on the panel item.
 * @returns {void}
 */
function showTooltip(name, event) {
    const $panelItem = event.target.closest(".item");
    if ($panelItem.querySelector(".tooltip")) return;
    $panelItem.appendChild(tooltip(name));
}

/**
 * @description Removes the tooltip element from the panel item that contains the event target.
 * @param {MouseEvent} event - The mouseleave event on the panel item.
 * @returns {void}
 */
function deleteTooltip(event) {
    const $panelItem = event.target.closest(".item");
    if ($panelItem.querySelector(".tooltip")) {
        $panelItem.querySelector(".tooltip").remove();
    }
}

/**
 * @description Returns true if the value is a non-null, non-array plain object with no own
 * enumerable keys.
 * @param {*} obj - Value to test.
 * @returns {boolean} `true` if `obj` is an empty plain object, `false` otherwise.
 */
function isEmptyObject(obj) {
  return obj && typeof obj === 'object' && !Array.isArray(obj) && Object.keys(obj).length === 0;
}

/**
 * @description Returns a Promise that resolves after the specified number of milliseconds.
 * @param {number} ms - Duration to wait in milliseconds.
 * @returns {Promise<void>}
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * @description Clears and removes all active DHCP server lease timers, DHCP client lease timers,
 * ARP entry timers, and DNS cache timers. Intended to be called when loading a new workspace.
 * @returns {void}
 */
function cleanUpWorkspace() {

    for (const serverLeaseTime in serverLeaseTimers) {
        clearInterval(serverLeaseTimers[serverLeaseTime]);
        delete serverLeaseTimers[serverLeaseTime];
    }

    for (const clientLeaseTime in clientLeaseTimers) {
        clearInterval(clientLeaseTimers[clientLeaseTime]);
        delete clientLeaseTimers[clientLeaseTime];
    }

    for (const arpEntryTime in arpEntryTimers) {
        clearTimeout(arpEntryTimers[arpEntryTime]);
        delete arpEntryTimers[arpEntryTime];
    }

    for (const dnsCacheTimer in dnsCacheTimers) {
        clearTimeout(dnsCacheTimers[dnsCacheTimer]);
        delete dnsCacheTimers[dnsCacheTimer];
    }

}

/**
 * @description Removes all data rows (keeping the header) from the ARP table of every
 * `.item-dropped` element currently on the board. Used when loading a saved workspace.
 * @returns {void}
 */
function resetArpTables() {
    const $droppedItems = document.querySelectorAll(".item-dropped");
    $droppedItems.forEach(item => {
        const $arpTable = item?.querySelector(".arp-table");
        if ($arpTable) {
            const $rows = $arpTable.querySelectorAll("tr");
            for (let i = 1; i < $rows.length; i++) $rows[i].remove();
        }
    });
}

/**
 * @description Removes all data rows (keeping the header) from the DNS cache table of every
 * `.item-dropped` element currently on the board. Used when loading a saved workspace.
 * @returns {void}
 */
function resetDnsCacheTables() {
    const $droppedItems = document.querySelectorAll(".item-dropped");
    $droppedItems.forEach(item => {
        const $dnsCacheTable = item?.querySelector(".cache-dns-table");
        if ($dnsCacheTable) {
            const $rows = $dnsCacheTable.querySelectorAll("tr");
            for (let i = 1; i < $rows.length; i++) $rows[i].remove();
        }
    });
}
