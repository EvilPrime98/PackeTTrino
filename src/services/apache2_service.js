/**
 * Processes an incoming HTTP packet against the Apache2 service running on a network object.
 * If the Apache2 service is enabled, builds an HTTP reply by resolving the requested resource
 * through the virtual-host configuration. Returns undefined if the service is off.
 *
 * @param {string} networkObjectId - The DOM element ID of the network object acting as the server.
 * @param {Object} packet - The incoming HTTP request packet.
 * @param {string} packet.origin_ip - Source IP address of the request.
 * @param {string} packet.origin_mac - Source MAC address of the request.
 * @param {number} packet.dport - Destination port of the request (used as source port for the reply).
 * @param {number} packet.sport - Source port of the request (used as destination port for the reply).
 * @param {string} packet.method - HTTP method (e.g. "GET").
 * @param {string} packet.host - Host header value of the request.
 * @param {string} packet.destination_ip - Destination IP address of the request.
 * @param {string} packet.resource - Requested resource path.
 * @returns {Promise<Object|undefined>} The constructed HTTP reply packet, or undefined if Apache2 is off.
 */
async function apache_service(networkObjectId, packet) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectInterface = getInterfaces($networkObject.id)[0];
    const networkObjectIp = $networkObject.getAttribute(`ip-${networkObjectInterface}`);
    const networkObjectMac = $networkObject.getAttribute(`mac-${networkObjectInterface}`);
    const isApacheOn = $networkObject.getAttribute("apache2") === "true";

    if (!isApacheOn) return;

    const newPacket = new httpReply(
        networkObjectIp, //source IP
        packet.origin_ip, //destination IP
        networkObjectMac, //source MAC
        packet.origin_mac, //destination MAC
        packet.dport, //source port
        packet.sport, //destination port
        packet.method, //method
        packet.host //host
    );

    //define the request

    const requestObject = {
        requestedPort: packet.dport,
        requestedIp: packet.destination_ip,
        requestedResource: packet.resource,
        requestedMethod: packet.method,
        requestedHost: packet.host
    }

    const apacheResult = obtainApacheContent(networkObjectId, requestObject);
    let apacheContent = apacheResult[0];
    const codeError = apacheResult[1];

    if (!apacheContent) apacheContent = $404ERRORCONTENT;
    newPacket.body = apacheContent;
    newPacket.statusCode = codeError;

    return newPacket;

}


/**
 * Resolves the content and HTTP status code for a given request against the Apache2
 * virtual-host configuration of the specified network object.
 *
 * Parses the Apache sites configuration, matches the request against configured virtual hosts
 * by port, IP, and server name, then reads the appropriate file from the virtual filesystem.
 * Falls back to 404 content when no match is found or when a resource does not exist.
 *
 * @param {string} networkObjectId - The DOM element ID of the network object whose Apache config is read.
 * @param {Object} requestObject - Describes the incoming HTTP request.
 * @param {number} requestObject.requestedPort - Port the request arrived on.
 * @param {string} requestObject.requestedIp - Destination IP of the request.
 * @param {string} requestObject.requestedResource - Requested URI path (trailing slash stripped).
 * @param {string} requestObject.requestedMethod - HTTP method of the request.
 * @param {string} requestObject.requestedHost - Host header value of the request.
 * @returns {[string, number]} A tuple of [responseBody, httpStatusCode].
 *   Status codes: 200 (OK), 403 (Forbidden), 404 (Not Found), 500 (Internal Server Error).
 */
function obtainApacheContent(networkObjectId, requestObject) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectFileSystem = new FileSystem($networkObject);

    //break down the request

    const requestedPort = requestObject.requestedPort;
    const requestedIp = requestObject.requestedIp;
    const requestedResource = (requestObject.requestedResource).endsWith("/")
    ? (requestObject.requestedResource).slice(0, -1)
    : requestObject.requestedResource;
    const requestedMethod = requestObject.requestedMethod;
    const host = requestObject.requestedHost;

    //parse the Apache configuration file and retrieve the information

    let fileResponse;

    try {
        fileResponse = apacheSitesParser(networkObjectId);
    } catch (e) {
        return [$404ERRORCONTENT, 500]; //TODO: create a log in the filesystem for errors
    }

    //interpret the obtained information

    let apacheContent;

    for (const site in fileResponse) {

        const isValidPort = parseInt(fileResponse[site].port) === parseInt(requestedPort);
        const isValidIp = fileResponse[site].ip === "*" || fileResponse[site].ip === requestedIp;
        const isValidServerName = fileResponse[site].serverName === host || !fileResponse[site].serverName;

        if (!isValidPort || !isValidIp || !isValidServerName) continue;

        const directoryIndex = fileResponse[site].directoryIndex;
        const documentRoot = fileResponse[site].documentRoot;
        const serverName = fileResponse[site].serverName;
        const indexesAllowed = fileResponse[site].indexesAllowed;

        //try to get the requested content or the index content

        try {

            //if no resource was specified, return the index
            if (requestedResource === "") {

                if (networkObjectFileSystem.isFile(directoryIndex, documentRoot.split("/").slice(1))) {
                    apacheContent = networkObjectFileSystem.read(directoryIndex, documentRoot.split("/").slice(1));
                    return [apacheContent, 200];
                }

                //if the index file doesn't exist, return the directory listing
                if (indexesAllowed === true) {

                    const directoryIndexFiles = networkObjectFileSystem.ls("-R")
                    .split(" ")
                    .filter(el => el.startsWith(`${documentRoot}/`))
                    .map(el => el.split(`${documentRoot}/`)[1]);

                    apacheContent = $DIRECTORYINDEXCONTENT(documentRoot, directoryIndexFiles);
                    return [apacheContent, 200];

                }

                return [$FORBIDDENCONTENT, 403];

            }

            //resource was specified, return the content
            const dividedResource = splitLast(requestedResource, "/");
            let requestedFile; //requested file
            let requestedDir; //requested directory

            if (dividedResource.length < 2) {
                requestedFile = dividedResource[0];
                requestedDir = [];
            } else {
                requestedFile = dividedResource[1];
                requestedDir = dividedResource[0].split("/");
            }

            const newFullPath = [...documentRoot.split("/").slice(1), ...requestedDir];

            //the requested resource is a directory
            if (networkObjectFileSystem.isDirectory(requestedFile, newFullPath)) {

                if (networkObjectFileSystem.isFile(directoryIndex, [...newFullPath, requestedFile])) {
                    apacheContent = networkObjectFileSystem.read(directoryIndex, [...newFullPath, requestedFile]);
                    return [apacheContent, 200];
                }

                //directory listing is allowed
                if (indexesAllowed === true) {

                    const directoryIndexFiles = networkObjectFileSystem.ls("-R", newFullPath)
                    .split(" ")
                    .filter(el => el.startsWith(`${documentRoot}/${requestedFile}/`))
                    .map(el => el.split(`${documentRoot}/${requestedFile}/`)[1]);

                    apacheContent = $DIRECTORYINDEXCONTENT(`${newFullPath.join("/")}/${requestedFile}`, directoryIndexFiles);
                    return [apacheContent, 200];

                }

                return [$FORBIDDENCONTENT, 403];
            }

            //the requested resource is a file
            if (networkObjectFileSystem.isFile(requestedFile, newFullPath)) {
                apacheContent = networkObjectFileSystem.read(requestedFile, newFullPath);
                return [apacheContent, 200];
            }

            //the requested resource does not exist
            return [$404ERRORCONTENT, 404];

        } catch (e) {

            return [$404ERRORCONTENT, 404];

        }


    }

    return [$404ERRORCONTENT, 404];

}
