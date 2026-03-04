/**ESTA CLASE DEFINE UN TOKEN DE COMPONENTE A PARTIR DE UN NODO. TIENE MÉTODOS COMO RENDER, EVENT, ETC.*/
class componentToken {

    constructor(element) {
        this.element = element;
    }
    
    async render(...componentes) {
        const $elements = document.querySelectorAll(this.element);
        componentes = await Promise.all(componentes);
        $elements.forEach($element => {
            componentes.forEach(componente => $element.appendChild(componente));
        });
    }

    event(evento, resultado) {
        const $elements = document.querySelectorAll(this.element);    
        $elements.forEach( $element => $element.addEventListener(evento, resultado));
    }

}

/**ESTA FUNCION RECIBE LA POSICIÓN DE UN OBJETO Y DEVUELVE NUEVAS POSICIONES SI EL OBJETO QUEDA CLIPEADO FUERA DE LA MESA DE TRABAJO */
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

    //calculamos la posicion del objeto en funcion de su posicion en el tablero
    
    let objectLeft = (x - objectWidth / 2);
    let objectRight = (x + objectWidth / 2);
    let objectTop = (y - objectHeight / 2);
    let objectBot = (y + objectHeight / 2);

    if (objectLeft < 0) { //el objeto acaba oculto por la izquierda
        let diffLeft = Math.abs(objectLeft);
        newX = x + diffLeft + spareSpace;
    }

    if (objectRight > boardWidth) { //el objeto acaba oculto por la derecha
        let diffRight = Math.abs(objectRight - boardWidth);
        newX = x - diffRight - spareSpace;
    }

    if (objectTop < 0) { //el objeto acaba oculto por arriba
        let diffTop = Math.abs(objectTop);
        newY = y + diffTop + spareSpace;
    }

    if (objectBot > boardHeight) { //el objeto acaba oculto por abajo
        let diffBot = Math.abs(objectBot - boardHeight);
        newY = y - diffBot - spareSpace;
    }

    return [newX, newY];
}

/**ESTA FUNCION MUESTRA LAS OPCIONES AVANZADAS DE UN OBJETO */
function showAdvancedOptions(event) {

    event.preventDefault();
    event.stopPropagation();

    const $board = document.querySelector(".board");
    const boardProperties = window.getComputedStyle($board, null);
    const boardHeight = parseInt(boardProperties.getPropertyValue("height")); //altura del tablero
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

/**ESTA FUNCION MUESTRA UN MODAL DE UN OBJETO, RECALCULANDO LAS POSICIONES DEL MODAL EN FUNCION DE LA POSICION DEL OBJETO */
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

    //obtenemos el ancho y alto del elemento

    $Table.style.display = "flex";
    let currentTableWidth = parseInt($Table.offsetWidth);
    let currentTableHeight = parseInt($Table.offsetHeight);
    $Table.style.display = "none";

    //inicializamos la posicion del modal tabla arp

    $Table.style.left = "50%";
    $Table.style.top = "50%";

    //dependiendo del diffX y diffY, cambiamos la posicion del modal

    let tableLeftSide = objectX - currentTableWidth / 2;
    let tableRightSide = objectX + currentTableWidth / 2;
    let tableTopSide = objectY - currentTableHeight / 2;
    let tableBotSide = objectY + currentTableHeight / 2;

    if ( tableLeftSide < 0) { //el modal acaba oculto por la izquierda
        let diffLeftSide = parseInt(0 - tableLeftSide);
        $Table.style.left = `calc(50% + ${Math.abs(diffLeftSide)}px + 5px)`;
    }

    if (tableRightSide > boardWidth) { //el modal acaba oculto por la derecha
        let diffRightSide = parseInt(tableRightSide - boardWidth);
        $Table.style.left = `calc(50% - ${Math.abs(diffRightSide)}px - 5px)`;
    }

    if (tableTopSide < 0) { //el modal acaba oculto por arriba
        let diffTopSide = parseInt(0 - tableTopSide);
        $Table.style.top = `calc(50% + ${Math.abs(diffTopSide)}px + 5px)`;
    }

    if (tableBotSide > boardHeight) { //el modal acaba oculto por abajo
        let diffBotSide = parseInt(tableBotSide - boardHeight);
        $Table.style.top = `calc(50% - ${Math.abs(diffBotSide)}px - 5px)`;
    }

    $advancedOptionsModal.style.display = "none";

    if (darkMode) $Table.classList.add("dark-mode")
    else $Table.classList.remove("dark-mode");

    $Table.style.display = "flex";

}

/**ESTA FUNCION OCULTA UN MODAL DE UN OBJETO */
function closeObjectModalTable(event, selector) {
    event.stopPropagation();
    const $networkObject = event.target.closest(".item-dropped");
    const $Table = $networkObject.querySelector(selector);
    $Table.style.display = "none";
}

/**ESTA FUNCION CREA UN INDICADOR DE PAQUETE SOBRE UN OBJETO */
function createPacketIndicator(id) {

    const $networkObject = document.getElementById(id)
    const $board = document.querySelector(".board");

    //creamos el indicator
    const $indicator = document.createElement("article");
    const $indicatorIcon = document.createElement("img");
    $indicator.classList.add("pack-cursor");
    $indicatorIcon.src = "./assets/board/pack.svg";
    $indicator.appendChild($indicatorIcon);

    //obtenermos las coordenadas del objeto
    const x = parseInt($networkObject.style.left);
    const y = parseInt($networkObject.style.top);
    $indicator.style.left = `${x}px`;
    $indicator.style.top = `${y}px`;
    
    //agregamos el indicator al tablero
    $board.appendChild($indicator);
}

/**ESTA FUNCION DEVUELVE LOS ELEMENTOS SVGS QUE FORMAN LAS CONEXIONES DE UN OBJETO CON UN SWITCH*/
function getConns(networkObjectId) {
    const $lines = document.querySelectorAll("line");
    const $circles = document.querySelectorAll("circle");
    let finalLines = [];
    let finalCircles = [];

    for (let i = 0; i < $lines.length; i++) {
        let conn = $lines[i];
        if (conn.getAttribute("end-start") === networkObjectId) {
            finalLines.push(conn);
        }
    }

    for (let i = 0; i < $circles.length; i++) {
        let conn = $circles[i];
        if (conn.getAttribute("end-start") === networkObjectId) {
            finalCircles.push(conn);
        }
    }

    return [finalLines, finalCircles];
}

/**ESTA FUNCION PERMITE A LOS MODALES SER ARRASTRADOS  */
function dragModal(event) {

    event.preventDefault();
    const $modal = event.target.closest(".draggable-modal");
    let rect = $modal.getBoundingClientRect();
    let offsetX = event.clientX - rect.left;
    let offsetY = event.clientY - rect.top;

    $modal.style.left = `${rect.left}px`;
    $modal.style.top = `${rect.top}px`;
    $modal.style.transform = 'none';
    $modal.style.position = 'fixed';

    function moveModal(moveEvent) {
        let x = moveEvent.clientX - offsetX;
        let y = moveEvent.clientY - offsetY;
        let maxX = window.innerWidth - $modal.offsetWidth;
        let maxY = window.innerHeight - $modal.offsetHeight;
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

/**ESTA FUNCION PERMITE ARRASTAR LOS OBJETOS EN EL TABLERO DE FORMA SUAVE */
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

/**ESTA FUNCION HACE SPLIT DE UNA CADENA DE TEXTO CON SOLO LA PRIMERA COINCIDENCIA CON UN SEPARADOR*/
function splitFirst(text, separator) {
    const index = text.indexOf(separator);
    if (index === -1) return [text];
    return [text.substring(0, index), text.substring(index + separator.length)];
}

/**ESTA FUNCION HACE SPLIT DE UNA CADENA DE TEXTO CON SOLO LA ÚLTIMA COINCIDENCIA DE UN TEXTO*/
function splitLast(text, separator) {
    const index = text.lastIndexOf(separator);
    if (index === -1) return [text];
    return [text.substring(0, index), text.substring(index + separator.length)];
}

/**ESTA FUNCION GESTIONA LA SUBIDA DE UN ARCHIVO EN EL PANEL */
function fileInputChangeHandler(event) {
    let fileName = event.target.files[0].name;
    bodyComponent.render(popupMessage(`Archivo <em>${fileName}</em> cargado con éxito. Para mostrar el contenido, haz click en:`, "/assets/panel/load.svg"));
}

/**ESTA FUNCION GESTIONA LA CARGA DE UN ARCHIVO EN EL PANEL */
function fileInputLoadHandler() {

    const archivoInput = document.getElementById("fileInput");

    if (archivoInput.files.length === 0) {
        boardComponent.render(popupMessage("Por favor, sube un archivo primero."));
        return;
    }

    const fileName = archivoInput.files[0].name;

    bodyComponent.render(confirmPopup(`¿Deseas cargar el archivo ${fileName}?`, loadState));

}

/**ESTA FUNCION GESTIONA LA DESCARGA DE UN ARCHIVO EN EL PANEL */
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

/**ESTA FUNCION GESTIONA LA CARGA DE UN ARCHIVO EN LA APLICACION */
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
        let indexes = [];
    
        itemsDropped.forEach(item => {
            let itemid = item.id;
            let itemindex = parseInt(itemid.split("-")[1]);
            if (!isNaN(itemindex)) indexes.push(itemindex);
        });
    
        itemsText.forEach(item => {
            let itemid = item.id;
            let itemindex = parseInt(itemid.split("-")[1]);
            if (!isNaN(itemindex)) indexes.push(itemindex);
        });
    
        itemIndex = (indexes.length > 0) ? Math.max(...indexes) + 1 : 1;
    
    }

    function setTextContents() {

        const itemsText = document.querySelectorAll(".text-annotation");

        for (let i = 0; i < itemsText.length; i++) {
            let text = itemsText[i].getAttribute("data-text");
            let input = itemsText[i].querySelector("input");
            input.value = text;
        }
    }

}

/**ESTA FUNCION GESTIONA EL DRAG START DE UN OBJETO EN EL PANEL */
function dragStart(event) {
    const networkObjectId = event.target.closest("img").alt;
    const itemType = "item";

    event.dataTransfer.setData("json", JSON.stringify({
        itemType: itemType,
        itemId: networkObjectId,
    }));

}

/**ESTA FUNCION GESTIONA LA UTILIDAD DE CONEXIÓN RÁPIDA EN EL PANEL */
function quickPingStart() {

    if (quickPingToggle) {
        quickPingEnd();
        return;
    }

    quickPingToggle = true;

    //creamos el cursor
    const $cursor = document.createElement("article");
    const $cursorIcon = document.createElement("img");
    $cursor.classList.add("pack-cursor");
    $cursorIcon.src = "./assets/board/pack.svg";
    $cursor.appendChild($cursorIcon);
    document.body.appendChild($cursor);

    //ocultamos el cursor por defecto
    document.body.style.cursor = "none";

    //eventos del mouse
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

/**ESTA FUNCION MUESTRA EL TOOLTIP DE UN OBJETO EN EL PANEL */
function showTooltip(name, event) {
    const $panelItem = event.target.closest(".item");
    if ($panelItem.querySelector(".tooltip")) return;
    $panelItem.appendChild(tooltip(name));
}

/**ESTA FUNCION ELIMINA EL TOOLTIP DE UN OBJETO EN EL PANEL */
function deleteTooltip(event) {
    const $panelItem = event.target.closest(".item");
    if ($panelItem.querySelector(".tooltip")) {
        $panelItem.querySelector(".tooltip").remove();
    }
}

/**ESTA FUNCIÓN DEVUELVE TRUE SI EL OBJETO ES UN OBJETO VACIO*/
function isEmptyObject(obj) {
  return obj && typeof obj === 'object' && !Array.isArray(obj) && Object.keys(obj).length === 0;
}

/**ESTA FUNCIÓN GENERA UN DELAY COMO PROMESA*/
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**ESTA FUNCIÓN LIMPIA TODOS LOS BUFFERS Y TEMPORIZADORES*/
function cleanUpWorkspace() {

    for (let serverLeaseTime in serverLeaseTimers) {
        clearInterval(serverLeaseTimers[serverLeaseTime]);
        delete serverLeaseTimers[serverLeaseTime];
    }

    for (let clientLeaseTime in clientLeaseTimers) {
        clearInterval(clientLeaseTimers[clientLeaseTime]);
        delete clientLeaseTimers[clientLeaseTime];
    }

    for (let arpEntryTime in arpEntryTimers) {
        clearTimeout(arpEntryTimers[arpEntryTime]);
        delete arpEntryTimers[arpEntryTime];
    }

    for (let dnsCacheTimer in dnsCacheTimers) {
        clearTimeout(dnsCacheTimers[dnsCacheTimer]);
        delete dnsCacheTimers[dnsCacheTimer];
    }

}

/**ESTA FUNCION LIMPIA LA TABLA DE ARP DE TODOS LOS OBJETOS DE RED*/
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

/**ESTA FUNCION LIMPIA LA TABLA DE CACHE DNS DE TODOS LOS OBJETOS DE RED*/
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

/**SIMULATES THE UPLOAD OF A FILE*/
async function simulateFileUpload(filePath) {
    try {
        const response = await fetch(filePath);
        const blob = await response.blob();
        const fileName = filePath.split("/").pop();
        const file = new File([blob], fileName, { type: "text/html" });
        loadState([file]);
    }catch(error) {
        console.log(error);
    }
}