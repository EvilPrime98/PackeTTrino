/**
 * Parses all Apache virtual-host configuration files found under
 * `/etc/apache2/sites/` in the virtual filesystem of the given network device.
 * Each file is expected to be well-formed XML; comments and blank lines are stripped
 * before parsing. The function validates that every site declares at minimum an IP
 * address, a port, a DocumentRoot, and a DirectoryIndex.
 *
 * @param {string} networkObjectId - The DOM element ID of the network device.
 * @returns {Record<string, {ip: string, port: string, documentRoot: string, directoryIndex: string, serverName: string|null, indexesAllowed: boolean, followSymLinks: boolean}>}
 *   An object keyed by site filename, where each value contains the parsed virtual-host settings.
 * @throws {Error} If any site file contains malformed XML.
 * @throws {Error} If a site file is missing the IP address, port, DocumentRoot, or DirectoryIndex.
 *
 * @example
 * const sites = apacheSitesParser("pc-1");
 * // { "000-default.conf": { ip: "0.0.0.0", port: "80", documentRoot: "/var/www/html", ... } }
 */
function apacheSitesParser(networkObjectId) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectFileSystem = new FileSystem($networkObject);
    const sitesFiles = networkObjectFileSystem.ls("-R").split(" ").filter(el => el.startsWith("/etc/apache2/sites/")).map(el => el.split("/etc/apache2/sites/")[1]);

    const response = {};

    sitesFiles.forEach(siteFile => {

        const siteContent = networkObjectFileSystem.read(siteFile, ["etc", "apache2", "sites"]);
        const filteredSiteContent = siteContent.split("\n").map(line => line.trim()).filter(line => line !== "" && !line.startsWith("#")).join("\n");
        const parser = new DOMParser();
        const $apacheDOM = parser.parseFromString(filteredSiteContent, "application/xml");

        if ($apacheDOM.querySelector("parsererror")) throw new Error("Error parsing Apache XML configuration.");

        const $apacheVirtualHost = $apacheDOM.querySelector("VirtualHost");
        const $documentRoot = $apacheVirtualHost.querySelector("DocumentRoot");
        const $directoryIndex = $apacheVirtualHost.querySelector("DirectoryIndex");
        const $options = $apacheVirtualHost.querySelector("Options");
        const $serverName = $apacheVirtualHost.querySelector("ServerName");

        const ip = $apacheVirtualHost.getAttribute("ip");
        const port = $apacheVirtualHost.getAttribute("port");
        const directoryValue = $documentRoot?.getAttribute("value");
        const directoryIndexValue = $directoryIndex?.getAttribute("value");
        const serverNameValue = $serverName?.getAttribute("value");
        const indexesAllowed = $options?.getAttribute("Indexes") === "true";
        const followSymLinks = $options?.getAttribute("FollowSymLinks") === "true";

        if (!ip) throw new Error("Error: The server IP address has not been specified.");
        if (!port) throw new Error("Error: The server port has not been specified.");
        if (!directoryValue) throw new Error("Error: The server document root has not been specified.");
        if (!directoryIndexValue) throw new Error("Error: The server directory index has not been specified.");

        response[siteFile] = {
            ip: ip,
            port: port,
            documentRoot: directoryValue,
            directoryIndex: directoryIndexValue,
            serverName: serverNameValue,
            indexesAllowed: indexesAllowed,
            followSymLinks: followSymLinks
        }

    });


    return response;

}
