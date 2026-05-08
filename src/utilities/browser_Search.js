/**
 * Handles a browser address-bar search, performs the HTTP request, and renders the response.
 *
 * Reads the URL from the `.address-input` field of the active browser component, parses the
 * protocol, address, port, and resource, then dispatches the appropriate request function
 * (`http` or `ptt`). The response body is rendered into the browser's iframe-like content area.
 * For the `ptt` protocol the content is first shown via a loader overlay before the real src is set.
 *
 * Port numbers 80 and 443 are hidden from the displayed address bar.
 * The terminal is minimised during the request when visual animations are enabled.
 * On any error the browser displays the global error page (`$BROWSERERRORPAGE`).
 *
 * @returns {Promise<void>}
 */
async function browserSearch() {

    const $networkObject = document.getElementById(document.querySelector(".browser-component").getAttribute("data-id"));
    const $browser = document.querySelector(".browser-component");
    const $browserContent = $browser.querySelector(".browser-content");
    const $addressInput = $browser.querySelector(".address-input");

    if (visualToggle) await minimizeBrowser();

        try {

            $browserContent.removeAttribute("src");

            //variables and maps

            const search = parseSearch($addressInput.value.trim());

            const portsToHide = [80, 443];

            const requestFunctions = {
                "http": async () => {
                    return http($networkObject.id, {
                        address: search.address,
                        method: "GET",
                        dport: search.port,
                        resource: search.resource
                    });
                },

                "ptt": async () => {
                    return http($networkObject.id, {
                        address: search.address,
                        method: "GET",
                        dport: search.port,
                        resource: search.resource
                    });
                },
            };

            const replyFunctions = {
                "http": (httpReply) => $browserContent.srcdoc = httpReply.body,
                "https": (httpReply) => $browserContent.srcdoc = httpReply.body,
                "ptt": (httpReply) => {
                    $browserContent.srcdoc = $LOADERCONTENT(httpReply.body);
                    setTimeout(() => {
                        $browserContent.src = httpReply.body;
                        $browserContent.removeAttribute("srcdoc");
                    }, 700);
                }
            }

            //update the address bar

            $browser.querySelector(".address-input").value = [
                `${search.protocol}://${search.address}`,
                (portsToHide.includes(search.port)) ? "" : `:${search.port}`,
                `/${search.resource}`
            ].join('');

            //perform the request

            const httpReply = await requestFunctions[search.protocol]();
            replyFunctions[search.protocol](httpReply);

        } catch (error) {

            $browserContent.srcdoc = $BROWSERERRORPAGE;

        }

    if (visualToggle) await maximizeBrowser();

}
