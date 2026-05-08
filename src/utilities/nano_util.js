/**
 * Opens a file in the GUI text editor panel and populates it with the file's content.
 * If the file cannot be read, an error message is printed to the terminal instead.
 *
 * @param {string} networkObjectId - The DOM element ID of the network object whose filesystem is used.
 * @param {string} file - The full path string of the file to open (e.g. "/etc/hosts").
 * @returns {void}
 *
 * @example
 * command_nano("pc-1", "/etc/hosts");
 */
function command_nano(networkObjectId, file) {

    const $networkObject = document.getElementById(networkObjectId);
    const frameTitle = document.querySelector(".editor-frame").querySelector("span");
    const fileEditorContainer = document.querySelector(".editor-wrapper");
    const editorArea = fileEditorContainer.querySelector(".file-editor");
    const fileSystem = new FileSystem($networkObject);
    const directoryPath = pathBuilder(file);
    const fileName = directoryPath.pop();

    try {
        const fileContent = fileSystem.read(fileName, directoryPath); //<-- try to open the file
        frameTitle.innerHTML = file; //<-- set the editor title visually
        editorArea.setAttribute("data-file", file); //<-- set the file name in the editor
        editorArea.value = fileContent; //<-- dump the file content
        fileEditorContainer.style.display = "block"; //<-- show the editor
        editorArea.focus();
    } catch (e) {
        terminalMessage(`nano: ${e.message}`, networkObjectId);
    }

}
