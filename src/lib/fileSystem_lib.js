/**
 * @description Simulates a Unix-like virtual filesystem stored as a nested JSON object in the
 * `filesystem` attribute of a network object DOM element. Supports standard operations such as
 * ls, touch, cp, rm, rmdir, mkdir, cd, read, and write.
 */
class FileSystem {

    /**
     * @param {Element} $item - The network object DOM element that holds the `filesystem` attribute.
     */
    constructor($item) {
        this.item = $item;
        this.structure = JSON.parse((this.item).getAttribute("filesystem"));
        this.dirpermissions = "drwx ";
        this.filepermissions = "-rwx ";
        this.owner = "root ";
        this.group = "root ";
    }

    /**
     * @description Serialises the current in-memory filesystem structure back to the DOM element's
     * `filesystem` attribute.
     * @returns {void}
     */
    compile() {
        (this.item).setAttribute("filesystem", JSON.stringify(this.structure));
    }

    /**
     * @description Returns the directory object at the current working directory path (`$PWD`).
     * @returns {Object} The nested object representing the current directory.
     */
    getPWD() {
        let currentDirectory = (this.structure)["/"];
        for (let i = 0; i < $PWD.length; i++) currentDirectory = currentDirectory[$PWD[i]];
        return currentDirectory;
    }

    /**
     * @description Creates a deep copy of a plain object (non-object primitives are returned
     * as-is). Used internally to clone directory subtrees during `cp`.
     * @param {*} obj - Value to deep-copy.
     * @returns {*} A deep copy of `obj`.
     */
    deepCopy(obj) {
        if (typeof obj !== "object" || obj === null) return obj;

        const copy = {};
        for (const key in obj) {
            if (Object.hasOwn(obj, key)) {
                copy[key] = this.deepCopy(obj[key]);
            }
        }
        return copy;
    }

    /**
     * @description Lists the contents of the current working directory. Supports `-l` for long
     * format (permissions, owner, group) and `-R` for recursive listing.
     * @param {...string} options - Option flags (e.g. "-l", "-R").
     * @returns {string} Newline-separated string (long format) or space-separated string (short format)
     *   of file and directory names.
     */
    ls(...options) {

        const currentDirectory = this.getPWD();
        const dirpermissions = (options.includes("-l")) ? this.dirpermissions : "";
        const filepermissions = (options.includes("-l")) ? this.filepermissions : "";
        const owner = (options.includes("-l")) ? this.owner : "";
        const group = (options.includes("-l")) ? this.group : "";
        const isRecursive = options.includes("-R");
        let output = [];

        recursiveSearch(currentDirectory, "/");

        function recursiveSearch(objt, currentPath) {
            for (const key in objt) {
                if (objt[key] instanceof Object) {
                    output.push(dirpermissions + owner + group + (currentPath + "/" + key).slice(1));
                    if (isRecursive) recursiveSearch(objt[key], currentPath + "/" + key);
                } else {
                    output.push(filepermissions + owner + group + (currentPath + "/" + key).slice(1));
                }
            }
        }

        if (!options.includes("-l")) output = output.join(" ");
        else output = output.join("\n");

        return output;

    }

    /**
     * @description Creates a new empty file at the specified path. Throws if any directory in the
     * path does not exist or if the file already exists.
     * @param {string} fileName - Name of the file to create.
     * @param {string[]} directoryPath - Array of directory names forming the path from root.
     * @returns {void}
     * @throws {Error} If a directory in the path does not exist or is not a directory, or if the
     *   file already exists.
     */
    touch(fileName, directoryPath) {

        let currentDirectory = this.structure["/"];

        for (let i = 0; i < directoryPath.length; i++) {
            if (!currentDirectory[directoryPath[i]]) throw new Error(`Directory ${directoryPath[i]} does not exist`);
            if (!(currentDirectory[directoryPath[i]] instanceof Object)) throw new Error(`${directoryPath[i]} is not a directory`);
            currentDirectory = currentDirectory[directoryPath[i]];
        }

        if (Object.hasOwn(currentDirectory, fileName)) throw new Error(`Cannot create file ${fileName}: already exists`);
        currentDirectory[fileName] = "";
        this.compile();

    }

    /**
     * @description Copies a file (or directory when `recursive` is true) from one path to another.
     * @param {string} fileName - Name of the source file or directory.
     * @param {string} destinationFileName - Name for the copy at the destination.
     * @param {string[]} directoryPath - Source directory path array from root.
     * @param {string[]} destinationPath - Destination directory path array from root.
     * @param {boolean} [recursive=false] - Whether to allow copying directories recursively.
     * @returns {void}
     * @throws {Error} If any path component is invalid, or if copying a directory without `-r`.
     */
    cp(fileName, destinationFileName, directoryPath, destinationPath, recursive = false) {

        let currentDirectory = this.structure["/"];
        let destinationDirectory = this.structure["/"];

        //verify the source file

        for (let i = 0; i < directoryPath.length; i++) {
            if (!currentDirectory[directoryPath[i]]) throw new Error(`Directory ${directoryPath[i]} does not exist`);
            if (typeof currentDirectory[directoryPath[i]] !== "object") throw new Error(`${directoryPath[i]} is not a directory`);
            currentDirectory = currentDirectory[directoryPath[i]];
        }

        if (!Object.hasOwn(currentDirectory, fileName)) throw new Error(`File or directory ${fileName} does not exist`);

        const source = currentDirectory[fileName];

        if (typeof source === "object" && !recursive) throw new Error(`-r not specified; omitting directory ${fileName}`);

        //verify the destination directory

        for (let i = 0; i < destinationPath.length; i++) {
            if (!destinationDirectory[destinationPath[i]]) throw new Error(`Directory ${destinationPath[i]} does not exist`);
            if (typeof destinationDirectory[destinationPath[i]] !== "object") throw new Error(`${destinationPath[i]} is not a directory`);
            destinationDirectory = destinationDirectory[destinationPath[i]];
        }

        if (!recursive && typeof destinationDirectory[destinationFileName] === "object") {
            throw new Error(`Cannot overwrite ${destinationFileName}: it is a directory`);
        }

        destinationDirectory[destinationFileName] = (typeof source === "object") ? this.deepCopy(source): source;

        this.compile();

    }

    /**
     * @description Removes a file from the filesystem.
     * @param {string} fileName - Name of the file to remove.
     * @param {string[]} directoryPath - Directory path array from root where the file resides.
     * @returns {void}
     * @throws {Error} If a path component is invalid or the file does not exist.
     */
    rm(fileName, directoryPath) {

        let currentDirectory = this.structure["/"];

        for (let i = 0; i < directoryPath.length; i++) {
            if (!currentDirectory[directoryPath[i]]) throw new Error(`Directory ${directoryPath[i]} does not exist`);
            if (!(currentDirectory[directoryPath[i]] instanceof Object)) throw new Error(`${directoryPath[i]} is not a directory`);
            currentDirectory = currentDirectory[directoryPath[i]];
        }

        if (!Object.hasOwn(currentDirectory, fileName)) throw new Error(`File ${fileName} does not exist`);
        delete currentDirectory[fileName];
        this.compile();

    }

    /**
     * @description Removes an empty directory from the filesystem.
     * @param {string} folderName - Name of the directory to remove.
     * @param {string[]} directoryPath - Parent directory path array from root.
     * @returns {void}
     * @throws {Error} If a path component is invalid or the directory does not exist.
     */
    rmdir(folderName, directoryPath) {

        let currentDirectory = (this.structure)["/"];

        for (let i = 0; i < directoryPath.length; i++) {
            if (!Object.hasOwn(currentDirectory, directoryPath[i])) throw new Error(`Directory ${directoryPath[i]} does not exist`);
            if (!(currentDirectory[directoryPath[i]] instanceof Object)) throw new Error(`${directoryPath[i]} is not a directory`);
            currentDirectory = currentDirectory[directoryPath[i]];
        }

        if (!Object.hasOwn(currentDirectory, folderName)) throw new Error(`Directory ${folderName} does not exist`);
        delete currentDirectory[folderName];
        this.compile();

    }

    /**
     * @description Creates a directory (and any missing parent directories) at the given path.
     * Does nothing if the directory already exists.
     * @param {string} folderName - Name of the directory to create.
     * @param {string[]} directoryPath - Parent directory path array from root.
     * @returns {void}
     * @throws {Error} If a component of the path exists but is a file, not a directory.
     */
    mkdir(folderName, directoryPath) {

        let currentDirectory = (this.structure)["/"];

        for (let i = 0; i < directoryPath.length; i++) {
            if (!Object.hasOwn(currentDirectory, directoryPath[i])) {
                currentDirectory[directoryPath[i]] = {};
            } else if (!(currentDirectory[directoryPath[i]] instanceof Object)) {
                throw new Error(`${directoryPath[i]} is not a directory`);
            }
            currentDirectory = currentDirectory[directoryPath[i]];
        }

        if (Object.hasOwn(currentDirectory, folderName)) return;
        currentDirectory[folderName] = {};
        this.compile();

    }

    /**
     * @description Changes the current working directory (`$PWD`) to the given path. Empty path
     * segments are skipped (behaves like `cd //foo` → `/foo`).
     * @param {string[]} directoryPath - Array of directory names to navigate to from root.
     * @returns {void}
     * @throws {Error} If any component does not exist or is not a directory.
     */
    cd(directoryPath) {

        let currentDirectory = this.structure["/"];
        const provisionalPWD = [];

        directoryPath.forEach(dir => {
            if (!dir) return;
            if (!Object.hasOwn(currentDirectory, dir)) throw new Error(`Directory ${dir} does not exist`);
            if (!(currentDirectory[dir] instanceof Object)) throw new Error(`${dir} is not a directory`);
            currentDirectory = currentDirectory[dir];
            provisionalPWD.push(dir);
        });

        $PWD = [...provisionalPWD];

    }

    /**
     * @description Reads and returns the string content of a file.
     * @param {string} fileName - Name of the file to read.
     * @param {string[]} directoryPath - Directory path array from root where the file resides.
     * @returns {string} The file's content.
     * @throws {Error} If a path component is invalid, the file does not exist, or the target is a directory.
     */
    read(fileName, directoryPath) {

        let currentDirectory = this.structure["/"];

        for (let i = 0; i < directoryPath.length; i++) {
            if (!currentDirectory[directoryPath[i]]) throw new Error(`Directory ${directoryPath[i]} does not exist`);
            if (!(currentDirectory[directoryPath[i]] instanceof Object)) throw new Error(`${directoryPath[i]} is not a directory`);
            currentDirectory = currentDirectory[directoryPath[i]];
        }

        if (!Object.hasOwn(currentDirectory, fileName)) throw new Error(`File ${fileName} does not exist`);
        if (currentDirectory[fileName] instanceof Object) throw new Error(`Cannot open ${fileName}: it is a directory`);

        return currentDirectory[fileName];

    }

    /**
     * @description Overwrites the content of an existing file with new content.
     * @param {string} fileName - Name of the file to write.
     * @param {string[]} directoryPath - Directory path array from root where the file resides.
     * @param {string} content - New content to write to the file.
     * @returns {void}
     * @throws {Error} If a path component is invalid, the file does not exist, or the target is a directory.
     */
    write(fileName, directoryPath, content) {

        let currentDirectory = this.structure["/"];

        for (let i = 0; i < directoryPath.length; i++) {
            if (!currentDirectory[directoryPath[i]]) throw new Error(`Directory ${directoryPath[i]} does not exist`);
            if (!(currentDirectory[directoryPath[i]] instanceof Object)) throw new Error(`${directoryPath[i]} is not a directory`);
            currentDirectory = currentDirectory[directoryPath[i]];
        }

        if (!Object.hasOwn(currentDirectory, fileName)) throw new Error(`File ${fileName} does not exist`);
        if (currentDirectory[fileName] instanceof Object) throw new Error(`Cannot write to ${fileName}: it is a directory`);

        currentDirectory[fileName] = content;

        this.compile();

    }

    /**
     * @description Returns `true` if the given name at the given path is a directory.
     * @param {string} fileName - Name of the entry to check.
     * @param {string[]} directoryPath - Directory path array from root.
     * @returns {boolean} `true` if the entry exists and is a directory, `false` otherwise.
     */
    isDirectory(fileName, directoryPath) {

        let currentDirectory = this.structure["/"];

        for (let i = 0; i < directoryPath.length; i++) {
            if (!currentDirectory[directoryPath[i]]) return false;
            if (!(currentDirectory[directoryPath[i]] instanceof Object)) return false;
            currentDirectory = currentDirectory[directoryPath[i]];
        }

        if (!Object.hasOwn(currentDirectory, fileName)) return false;
        if (!(currentDirectory[fileName] instanceof Object)) return false;

        return true;

    }

    /**
     * @description Returns `true` if the given name at the given path is a regular file (not a directory).
     * @param {string} fileName - Name of the entry to check.
     * @param {string[]} directoryPath - Directory path array from root.
     * @returns {boolean} `true` if the entry exists and is a file, `false` otherwise.
     */
    isFile(fileName, directoryPath) {

        let currentDirectory = this.structure["/"];

        for (let i = 0; i < directoryPath.length; i++) {
            if (!currentDirectory[directoryPath[i]]) return false;
            if (!(currentDirectory[directoryPath[i]] instanceof Object)) return false;
            currentDirectory = currentDirectory[directoryPath[i]];
        }

        if (!Object.hasOwn(currentDirectory, fileName)) return false;
        if (currentDirectory[fileName] instanceof Object) return false;

        return true;

    }

}
