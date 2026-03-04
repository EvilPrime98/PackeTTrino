//PACKETTRINO DESARROLLADO POR AMÍN PÉREZ (2025)

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

setTimeout(startApp, 1000);

function startApp() {

    const loadingScreen = document.getElementById('loading-screen');

    loadingScreen.style.opacity = '0';

    setTimeout(() => {
        loadingScreen.style.display = 'none';
    }, 500);

    if (localStorage.getItem("dark-mode") === null) {

        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.querySelector(".settings-modal").querySelector("#dark-mode").checked = true;
            activateDarkMode();
        }

    }else {

        if (localStorage.getItem("dark-mode") === "true") {
            document.querySelector(".settings-modal").querySelector("#dark-mode").checked = true;
            activateDarkMode();
        }
        
    }
    
    document.querySelector("#item-panel").classList.remove("hidden");

    const $items = document.querySelector("#item-panel").querySelectorAll(".item");
    let time = 0;

    $items.forEach((item) => {
        setTimeout( () => {
            item.classList.remove("hidden");
        }, time);
        time += 10;
    });

    simulateFileUpload("/assets/templates/red.ptt");

    //if (localStorage.getItem("tutorial-seen") !== "true") setTimeout(startTutorial, 400);

}