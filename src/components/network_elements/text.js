/**
 * Creates and returns a draggable text annotation element as an `<article>` DOM node.
 * The element is positioned absolutely at `(x, y)`, contains a text `<input>` that
 * auto-expands as the user types, and includes an advanced-options modal with a
 * "Delete" button. The annotation stores its current text value in the `data-text`
 * attribute.
 *
 * @param {number} x - Left position in pixels relative to the board.
 * @param {number} y - Top position in pixels relative to the board.
 * @returns {HTMLElement} The configured text annotation `<article>` element.
 */
function TextObject(x, y) {

    const $textObject = document.createElement("article");
    const $input = document.createElement("input");
    const $advancedOptions = document.createElement("div");

    //general characteristics

    $textObject.id = "text-" + itemIndex;
    $textObject.classList.add("text-annotation");
    $textObject.style.left = `${x}px`;
    $textObject.style.top = `${y}px`;
    $textObject.setAttribute("data-text", "");

    //advanced options

    $advancedOptions.classList.add("advanced-options-modal");
    $advancedOptions.innerHTML = `<button onclick="deleteItem(event)">Delete</button>`;

    //input

    $input.type = "text";

    //events

    $textObject.setAttribute("onmousedown", "dragText(event)");
    $input.setAttribute("oninput", "autoExtendText.call(this)");
    $textObject.setAttribute("oncontextmenu", "showAdvancedOptions(event)");

    //build the object

    $textObject.appendChild($advancedOptions);
    $textObject.appendChild($input);

    return $textObject;
}

/**
 * Resizes the text annotation container to fit its input's current text content.
 * Measures the rendered width of the input value using a hidden `<span>` with
 * matching font styles, then applies a minimum width of 40 px plus a 20 px buffer.
 * Also centers the container by applying a negative left margin equal to half its
 * width, and keeps the `data-text` attribute in sync with the input value.
 * Must be called with `this` bound to the `<input>` element (e.g. via `.call(this)`).
 *
 * @this {HTMLInputElement} The input element inside the text annotation container.
 * @returns {void}
 */
function autoExtendText() {
    const container = this.parentElement;
    const input = container.querySelector("input");
    const content = input.value;
    const temp = document.createElement('span');
    temp.style.visibility = 'hidden';
    temp.style.position = 'absolute';
    temp.style.whiteSpace = 'pre';
    temp.style.font = window.getComputedStyle(input).font;
    temp.textContent = this.value || 'W';
    document.body.appendChild(temp);
    const width = temp.getBoundingClientRect().width;
    document.body.removeChild(temp);
    const newWidth = Math.max(40, width + 20);
    container.style.width = `${newWidth}px`;
    container.style.marginLeft = `-${newWidth/2}px`;
    container.setAttribute("data-text", content);
}

/**
 * Enables free mouse-drag repositioning of a text annotation element.
 * Attaches `mousemove` and `mouseup` listeners to `document` for the duration of
 * the drag, clamps the position to the visible viewport, and restores focus to the
 * annotation's `<input>` once the drag ends.
 *
 * @param {MouseEvent} event - The `mousedown` event fired on the text annotation.
 * @returns {void}
 */
function dragText(event) {
    event.preventDefault();
    const text = event.target.closest(".text-annotation");
    const rect = text.getBoundingClientRect();
    const offsetX = event.clientX - rect.left - rect.width / 2;
    const offsetY = event.clientY - rect.top - rect.height / 2;
    text.style.position = 'absolute';

    /**
     * Moves the text annotation to follow the cursor, clamped to the viewport.
     *
     * @param {MouseEvent} moveEvent - The `mousemove` event from the document listener.
     * @returns {void}
     */
    function moveText(moveEvent) {
        document.body.style.cursor = "none";
        const x = moveEvent.clientX - offsetX;
        const y = moveEvent.clientY - offsetY;
        const maxX = window.innerWidth - text.offsetWidth;
        const maxY = window.innerHeight - text.offsetHeight;
        text.style.left = `${Math.max(0, Math.min(x, maxX))}px`;
        text.style.top = `${Math.max(0, Math.min(y, maxY))}px`;
    }

    /**
     * Cleans up drag listeners, restores the cursor, and re-focuses the input.
     *
     * @returns {void}
     */
    function stopDragging() {
        document.removeEventListener('mousemove', moveText);
        document.removeEventListener('mouseup', stopDragging);
        const input = text.querySelector('input');
        if (input) input.focus();
        document.body.style.cursor = "default";
    }

    document.addEventListener('mousemove', moveText);
    document.addEventListener('mouseup', stopDragging);
}
