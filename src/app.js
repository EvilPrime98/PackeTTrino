/**
 * @fileoverview Application entry point. Instantiates the root UI components,
 * mounts them into the DOM, registers the global keyboard handler, and
 * schedules the post-load initialization sequence via startApp.
 * TODO: remove componentToken, it's a mess :P
 */

//PACKETTRINO DEVELOPED BY AMÍN PÉREZ (2025-PRESENT)

var htmlComponent = new componentToken("html");
var bodyComponent = new componentToken("body");
var rootComponent = new componentToken("#root");
var boardComponent = new componentToken(".board");

rootComponent.render(
    itemBoard(),
    itemPanel()
);

bodyComponent.render(
    pc_menu(),
    dns_server_menu(),
    dhcp_server_menu(),
    dhcp_agent_menu(),
    router_menu(),
    AnimationControls(),
    terminal(),
    browser(),
    packetTracer(),
    GeneralOptions(),
);

htmlComponent.event("keydown", documentKeyboardHandler);

$('html').addEventListener('wheel', documentWheelHandler,  {
    passive: false
})

setTimeout(startApp, 1000);

/**
 * Initializes the application UI after the initial load delay.
 *
 * Fades out and hides the loading screen, restores or detects the user's
 * dark-mode preference (checking `localStorage` first, then
 * `prefers-color-scheme`), reveals the item panel with a staggered entrance
 * animation (10 ms between each item), and starts the tutorial for
 * first-time visitors.
 *
 * @returns {void}
 */
function startApp() {

    const $loadingScreen = $('#loading-screen');
    const $itemPanel = $('#item-panel');

    $loadingScreen.style.opacity = '0';

    setTimeout(() => {
        $loadingScreen.style.display = 'none';
    }, 500);

    if (localStorage.getItem("dark-mode") === null) {

        if (window
            .matchMedia('(prefers-color-scheme: dark)')
            .matches
        ) {
            $(".settings-modal #dark-mode").checked = true;
            activateDarkMode();
        }

    }else {

        if (localStorage.getItem("dark-mode") === "true") {
            $(".settings-modal #dark-mode").checked = true;
            activateDarkMode();
        }
        
    }
    
    $itemPanel.classList.remove('hidden');

    const $items = $$('.item', $itemPanel);
    let time = 0;
    $items.forEach((item) => {
        setTimeout( () => {
            item.classList.remove("hidden");
        }, time);
        time += 10;
    });

    if (localStorage.getItem("tutorial-seen") !== "true") setTimeout(startTutorial, 400);

}