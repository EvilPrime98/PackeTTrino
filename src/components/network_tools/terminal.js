import { dragModal } from "@/lib/component_lib";
import { unixParser } from "@/unix";
/**
 * Creates and returns the terminal modal component as a `<div>` DOM node.
 * The element includes a draggable title bar, a prompt line with a text input,
 * a pre-formatted output area, and a hidden file-editor panel. All necessary
 * keyboard and mouse event listeners are wired up on creation. The element is
 * not appended to the DOM; the caller is responsible for mounting it.
 *
 * @returns {HTMLDivElement} The fully configured terminal modal element.
 */
export function terminal() {

    const $terminal = document.createElement("div");
    $terminal.classList.add("terminal-component", "draggable-modal");
    $terminal.id = "terminal-network";
    $terminal.setAttribute("data-id", "");

    $terminal.innerHTML = `

        <div class="window-frame">Terminal</div>

        <p>
            <span id="terminal-prompt"></span>
            <input type="text" class="terminal-input" autofocus>
        </p>

        <pre class="terminal-output"></pre>

        <div class="editor-wrapper" style="display: none;">
            <div class="editor-buttons">
                <p><span>^S</span>Save and Exit</p>
            </div>
            <p class="file-editor-error"></p>
            <textarea class="file-editor" data-file=""></textarea>
            <div class="editor-frame"> <span></span>
        </div>
    `;

    $terminal.addEventListener("keydown", terminalKeyboard);
    $terminal.querySelector(".window-frame").addEventListener("mousedown", dragModal);
    $terminal.addEventListener("click", clickTerminal);
    $terminal.querySelector(".terminal-input").addEventListener("keydown", unixParser);
    $terminal.querySelector(".terminal-output").addEventListener("click", clickTerminal);
    $terminal.querySelector(".terminal-output").addEventListener("mousedown", event => { event.stopPropagation(); });
    $terminal.querySelector(".file-editor-error").addEventListener("mousedown", event => { event.stopPropagation(); });
    $terminal.querySelector(".file-editor-error").addEventListener("mouseup", event => { event.stopPropagation(); });
    $terminal.querySelector(".file-editor").addEventListener("mousedown", event => { event.stopPropagation(); });
    $terminal.querySelector(".file-editor").addEventListener("mouseup", event => { event.stopPropagation(); });
    $terminal.querySelector(".file-editor").addEventListener("click", event => { event.stopPropagation(); });
    $terminal.querySelector(".file-editor").addEventListener("dragstart", event => { event.stopPropagation(); });
    $terminal.querySelector(".file-editor").addEventListener("keydown", fileEditorKeyboard);

    return $terminal;

}

/**
 * Focuses the terminal's text input when the user clicks anywhere inside the terminal.
 *
 * @param {MouseEvent} event - The click event fired on the terminal component or its output.
 * @returns {void}
 */
export function clickTerminal(event) {
    const terminal = event.target.closest(".terminal-component");
    const input = terminal.querySelector("input");
    input.focus();
}

/**
 * Appends a message line to the terminal output area, but only if the terminal is
 * currently visible and bound to the specified network object.
 *
 * @param {string} message - The content to append. Interpreted as HTML when `isHtml` is true.
 * @param {string} networkObjectId - Id of the network object whose terminal should receive the message.
 * @param {boolean} [isHtml=true] - When true, the message is injected via `innerHTML`; otherwise via `textContent`.
 * @returns {void}
 */
export function terminalMessage(message, networkObjectId, isHtml = true) {
    const $terminal = document.querySelector(".terminal-component");
    const $output = document.querySelector(".terminal-output");
    if (window.getComputedStyle($terminal).display === "none") return;
    if ($terminal.dataset.id !== networkObjectId) return;
    if (isHtml) $output.innerHTML += `${message}\n`;
    else $output.textContent += `${message}\n`;
}

/**
 * Handles global keyboard shortcuts while the terminal has focus:
 * - `Ctrl+C` — cancels any running ping interval and clears the output area.
 * - `Escape` — closes the terminal.
 * - `ArrowUp` — navigates backward through the command history buffer.
 * - `ArrowDown` — navigates forward through the command history buffer.
 *
 * @param {KeyboardEvent} event - The keydown event fired on the terminal component.
 * @returns {void}
 */
export function terminalKeyboard(event) {

    if (event.ctrlKey && event.key === "c") {
        event.preventDefault();
        clearInterval(window.pingInterval);
        document.querySelector(".terminal-output").innerHTML = "";
    }

    if (event.key === "Escape") {
        closeTerminal(event);
    }

    if (event.key === "ArrowUp") {
        event.preventDefault();
        if (currentCommandIndex === 0) return;
        currentCommandIndex--;
        document.querySelector(".terminal-component").querySelector("input").value = terminalBuffer[currentCommandIndex];
    }

    if (event.key === "ArrowDown") {
        event.preventDefault();
        if (currentCommandIndex === terminalBuffer.length) return;
        currentCommandIndex++;
        document.querySelector(".terminal-component").querySelector("input").value = terminalBuffer[currentCommandIndex] || "";
    }
}

/**
 * Animates the terminal modal to a minimized thumbnail at the bottom-right corner of
 * the viewport (30 % of its current size). Resolves immediately if the terminal is
 * not present or is already hidden. Returns a Promise that resolves when the CSS
 * transition ends.
 *
 * @returns {Promise<void>} Resolves when the minimize animation completes.
 */
export async function minimizeTerminal() {
    return new Promise(resolve => {
        const $terminal = document.querySelector(".terminal-component");
        if (!$terminal || window.getComputedStyle($terminal).display === "none") return resolve();
        const rect = $terminal.getBoundingClientRect();
        const targetWidth = rect.width * 0.3;
        const targetHeight = rect.height * 0.3;
        const windowHeight = window.innerHeight;
        $terminal.style.transition = "all 1s ease-in-out";
        $terminal.style.width = `${targetWidth}px`;
        $terminal.style.height = `${targetHeight}px`;
        $terminal.style.top = `${windowHeight - targetHeight}px`;
        $terminal.style.left = "100%";
        $terminal.style.transform = "translate(-100%, 0)";
        $terminal.addEventListener("transitionend", resolve, { once: true });
    });
}

/**
 * Animates the terminal modal back to its default centered position
 * (1000 × 500 px, centered at 50 % / 40 %). Resolves immediately if the terminal
 * is not present or is hidden. Clears the transition property after animation to
 * prevent interference with subsequent drag operations.
 *
 * @returns {Promise<void>} Resolves when the maximize animation completes.
 */
export async function maximizeTerminal() {
    return new Promise(resolve => {
        const $terminal = document.querySelector(".terminal-component");
        if (!$terminal || window.getComputedStyle($terminal).display === "none") return resolve();
        $terminal.style.transition = "all 1s ease-in-out";
        $terminal.style.width = "1000px";
        $terminal.style.height = "500px";
        $terminal.style.top = "40%";
        $terminal.style.left = "50%";
        $terminal.style.transform = "translate(-50%, -50%)";
        $terminal.addEventListener("transitionend", () => {
            $terminal.style.transition = "none";
            resolve();
        }, { once: true });
    });
}

/**
 * Makes the terminal visible and binds it to the network object that triggered the event.
 * Sets the prompt to `root@<id>:/#`, hides the advanced-options modal of the source
 * device, and focuses the terminal input.
 *
 * @param {MouseEvent} event - The click event fired from the network object's advanced options.
 * @returns {void}
 */
export function showTerminal(event) {
    event.stopPropagation();
    const $networkObject = event.target.closest(".item-dropped");
    const $terminal = document.querySelector(".terminal-component");
    const $advOptsModal = $networkObject.querySelector(".advanced-options-modal");
    $terminal.setAttribute("data-id", $networkObject.id);
    $terminal.querySelector("#terminal-prompt").innerHTML = `root@${$networkObject.id}:/#`;
    $terminal.style.display = "block";
    $terminal.querySelector(".terminal-input").focus();
    $advOptsModal.style.display = "none";
}

/**
 * Closes the terminal modal and fully resets its state: cancels any active ping
 * interval, clears the command history buffer and index, wipes the output area,
 * resets the prompt to `root@debian:/#`, resets the current working directory
 * (`$PWD`), and returns the terminal to its default centered position.
 *
 * @param {Event} event - The event that triggered the close action (keyboard or click).
 * @returns {void}
 */
export function closeTerminal(event) {
    event.preventDefault();
    const $terminal = document.querySelector(".terminal-component");
    clearInterval(window.pingInterval);
    terminalBuffer = [];
    currentCommandIndex = 0;
    document.querySelector(".terminal-output").innerHTML = "";
    $terminal.querySelector("input").value = "";
    $terminal.querySelector("#terminal-prompt").innerHTML = "root@debian:/#";
    $PWD = [];
    $terminal.style.top = "40%";
    $terminal.style.left = "50%";
    $terminal.style.transform = "translate(-50%, -50%)";
    $terminal.style.display = "none";
}

/**
 * Handles keyboard shortcuts inside the terminal's file editor panel:
 * - `Ctrl+S` — writes the editor's current content to the virtual filesystem of the
 *   bound network object using the path stored in the textarea's `data-file` attribute,
 *   then hides the editor and refocuses the terminal input. Displays an error message
 *   in the editor's error area if the write fails.
 * - `Tab` — inserts a literal tab character at the cursor position instead of shifting focus.
 *
 * @param {KeyboardEvent} event - The keydown event fired inside the file editor textarea.
 * @returns {void}
 */
export function fileEditorKeyboard(event) {

    event.stopPropagation();

    const $terminal = document.querySelector(".terminal-component");
    const $fileEditorContainer = $terminal.querySelector(".editor-wrapper");
    const $fileEditorArea = $fileEditorContainer.querySelector(".file-editor");
    const fileContent = $fileEditorArea.value; //<-- get the editor content
    const networkObjectId = $terminal.dataset.id; //<-- get the network object id from the terminal dataset
    const $networkObject = document.getElementById(networkObjectId);
    const fileFullPath = $fileEditorArea.getAttribute("data-file"); //<-- get the full file path

    if (event.ctrlKey && event.key === "s") {

        event.preventDefault();

        const networkElementFileSystem = new FileSystem($networkObject); //<-- create a filesystem object
        const directoryPath = pathBuilder(fileFullPath); //<-- build the full file path
        const fileName = directoryPath.pop(); //<-- get the filename

        try {
            networkElementFileSystem.write(fileName, directoryPath, fileContent); //<-- try to write file content to the filesystem
            $fileEditorContainer.style.display = "none"; //<-- hide the editor
            $terminal.querySelector("input").focus(); //<-- focus the terminal input when exiting the editor
        } catch (e) {
            terminalMessage(e.message, networkObjectId);
            console.log(e);
        }

    }

    if (event.key === "Tab") {
        event.preventDefault();
        const start = $fileEditorArea.selectionStart;
        const end = $fileEditorArea.selectionEnd;
        $fileEditorArea.value = $fileEditorArea.value.substring(0, start) + "\t" + $fileEditorArea.value.substring(end);
        $fileEditorArea.selectionStart = $fileEditorArea.selectionEnd = start + 1;
    }

}
