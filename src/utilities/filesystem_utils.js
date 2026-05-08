/**
 * Handles the `mkdir` terminal command by creating a directory in the network object's filesystem.
 *
 * @param {string} networkObjectId - The DOM element ID of the network object running the command.
 * @param {string} pathInput - Absolute or relative path for the new directory.
 * @returns {void}
 */
function command_mkdir(networkObjectId, pathInput) {

    const $networkObject = document.getElementById(networkObjectId);
    const fileSystem = new FileSystem($networkObject);
    const directoryPath = pathBuilder(pathInput);
    const folderName = directoryPath.pop();

    try {
        fileSystem.mkdir(folderName, directoryPath);
    }catch(e) {
        terminalMessage(e.message, networkObjectId);
    }

}

/**
 * Handles the `touch` terminal command by creating an empty file in the network object's filesystem.
 *
 * @param {string} networkObjectId - The DOM element ID of the network object running the command.
 * @param {string} pathInput - Absolute or relative path for the new file.
 * @returns {void}
 */
function command_touch(networkObjectId, pathInput) {

    const $networkObject = document.getElementById(networkObjectId);
    const fileSystem = new FileSystem($networkObject);
    const directoryPath = pathBuilder(pathInput);
    const fileName = directoryPath.pop();

    try {
        fileSystem.touch(fileName, directoryPath);
    }catch(e) {
        terminalMessage(e.message, networkObjectId);
    }

}

/**
 * Handles the `cp` terminal command by copying a file within the network object's filesystem.
 *
 * @param {string} networkObjectId - The DOM element ID of the network object running the command.
 * @param {Array<string>} args - Two-element array: [originPath, destinationPath].
 * @returns {void}
 */
function command_cp(networkObjectId, args) {

    const $networkObject = document.getElementById(networkObjectId);
    const originInput = args[0];
    const destinationInput = args[1];

    const fileSystem = new FileSystem($networkObject);
    const directoryPath = pathBuilder(originInput);
    const destinationPath = pathBuilder(destinationInput);
    const fileName = directoryPath.pop();
    const destinationFileName = destinationPath.pop();

    try {

        fileSystem.cp(fileName, destinationFileName, directoryPath, destinationPath);

    }catch(e) {

        terminalMessage(`cp: ${e.message}`, networkObjectId);

    }

}

/**
 * Handles the `ls` terminal command by listing the contents of a directory in the network object's filesystem.
 *
 * Passes all provided args directly to the underlying `FileSystem.ls` method (e.g. `-R` for recursive).
 *
 * @param {string} networkObjectId - The DOM element ID of the network object running the command.
 * @param {Array<string>} args - Options and optional path forwarded to `FileSystem.ls`.
 * @returns {void}
 */
function command_ls(networkObjectId, args) {

    const $networkObject = document.getElementById(networkObjectId);

    const fileSystem = new FileSystem($networkObject);

    try {

        const output = fileSystem.ls(...args);
        terminalMessage(output, networkObjectId);

    } catch (e) {
        terminalMessage(`ls: ${e.message}`, networkObjectId);

    }

}

/**
 * Handles the `rm` terminal command by removing a file or directory from the network object's filesystem.
 *
 * @param {string} networkObjectId - The DOM element ID of the network object running the command.
 * @param {string} inputPath - Absolute or relative path to the file or directory to remove.
 * @returns {void}
 */
function command_rm(networkObjectId, inputPath) {

    const $networkObject = document.getElementById(networkObjectId);
    const fileSystem = new FileSystem($networkObject);
    const directoryPath = pathBuilder(inputPath);
    const fileName = directoryPath.pop();

    try {
        fileSystem.rm(fileName, directoryPath);
    }catch(e) {
        terminalMessage(e.message, networkObjectId);
    }
}

/**
 * Handles the `cd` terminal command by changing the current working directory in the terminal.
 *
 * Updates the terminal prompt element to reflect the new path. Errors (e.g. non-existent directory)
 * are printed to the terminal.
 *
 * @param {string} networkObjectId - The DOM element ID of the network object running the command.
 * @param {string} pathInput - Absolute or relative path to navigate to.
 * @returns {void}
 */
function command_cd(networkObjectId, pathInput) {

    const $networkObject = document.getElementById(networkObjectId);
    const directoryPath = pathBuilder(pathInput);
    const fileSystem = new FileSystem($networkObject);

    try {
        fileSystem.cd(directoryPath);
        const $terminalPrompt = document.querySelector(".terminal-component").querySelector("#terminal-prompt");
        $terminalPrompt.innerHTML = `root@${$networkObject.id}:/${directoryPath.join("/")}#`;
    }catch(e) {
        terminalMessage(e.message, networkObjectId);
    }

}

/**
 * Handles the `cat` terminal command by printing the contents of a file to the terminal.
 *
 * Content is printed without HTML escaping (raw mode). Errors are caught and printed.
 *
 * @param {string} networkObjectId - The DOM element ID of the network object running the command.
 * @param {string} file - Absolute or relative path to the file to read.
 * @returns {void}
 */
function command_cat(networkObjectId, file) {

    const $networkObject = document.getElementById(networkObjectId);
    const fileSystem = new FileSystem($networkObject);
    const directoryPath = pathBuilder(file);
    const fileName = directoryPath.pop();

    try {
        const fileContent = fileSystem.read(fileName, directoryPath);
        terminalMessage(fileContent, networkObjectId, false);
    } catch (e) {
        terminalMessage(e.message, networkObjectId);
    }

}

/**
 * Converts a path string into an ordered array of directory segments relative to the filesystem root.
 *
 * Absolute paths (starting with "/") are split from the root. Relative paths are resolved
 * against the global `$PWD` array representing the current working directory.
 *
 * @param {string} pathInput - The path string to parse (absolute or relative).
 * @returns {Array<string>} An array of path segment strings (e.g. ["etc", "network", "interfaces"]).
 */
function pathBuilder(pathInput) {

    let path;

    if (pathInput.startsWith("/")) {
        path = pathInput.split("/").slice(1);
    } else {
        path = [...$PWD];
        pathInput.split("/").map(dir => path.push(dir));
    }

    return path;
}
