/**
 * @description Represents a single slide in a tutorial presentation, containing a title, media
 * asset URL, and HTML content text.
 */
class slide {
    /**
     * @param {string} [title=""] - Slide title displayed as an `<h1>`.
     * @param {string} [media=""] - URL of the image to display in the slide.
     * @param {string} [text=""] - HTML content string for the slide body.
     */
    constructor(title, media, text ) {
        this.title = title || "";
        this.media = media || "";
        this.content = text || "";
        this.mediaHeight = "200px";
        this.mediaBackgroundColor = "transparent";
        this.mediaShadow = "0 15px 35px rgba(0, 0, 0, 0.2)";
    }
}

/**
 * @description Manages a modal slide-show presentation. Slides are added via `addSlide`, rendered
 * into the DOM by `startPresentation`, navigated with `render`, and dismissed with `endPresentation`.
 */
class slidePresentation {

    constructor() {
        this.slides = [];
        this.currentSlide = 0;
        this.isRendered = false;
    }

    /**
     * @description Appends one or more `slide` instances to the presentation's slide list.
     * @param {...slide} slides - Slides to add.
     * @returns {void}
     */
    addSlide(...slides) {
        this.slides.push(...slides);
    }

    /**
     * @description Builds and injects the full slide-presentation HTML into the DOM, shows the
     * modal overlay, and displays the first slide.
     * @returns {void}
     */
    startPresentation() {

        const $slidePresentationHTML = document.createElement('div');

        $slidePresentationHTML.classList.add('slide-presentation');

        $slidePresentationHTML.innerHTML = `
            ${
                this.slides.map((slide, index) => {

                    const slideStyle = `
                        height: ${slide.mediaHeight};
                        background-color: ${slide.mediaBackgroundColor};
                        box-shadow: ${slide.mediaShadow};
                    `;

                    return `<div class="slide" id="slide-${index}">
                        <h1 class="slide__title">${slide.title}</h1>
                        <div class="main-content">
                            <img class="slide__media" src="${slide.media}" style="${slideStyle}" alt="media">
                            <p class="slide__content">${slide.content}</p>
                        </div>
                    </div>`;

                }).join('')
            }

            <div class="page-selector">
                ${
                    this.slides.map((slide, index) => {
                        return `<button class="page-selector__btn" onclick="tutorial.render(${index});">${index + 1}</button>`;
                    }).join('')
                }
                <img class="next-slide-btn" src="./assets/tutorial/next.svg" alt="next" onclick="tutorial.render(tutorial.currentSlide + 1);">
                <button class="end-presentation btn-modern-blue" onclick="tutorial.endPresentation();">Done!</button>
            </div>
            <div class="links">
                <a href="https://github.com/EvilPrime98/PackeTTrino" target="_blank">
                    <img src="./assets/github.svg" alt="github">
                </a>
                <a href="https://www.linkedin.com/in/josé-amín-pérez-alconchel-2191b430b" target="_blank">
                    <img src="./assets/linkedin.svg" alt="linkedin">
                </a>
            </div>
        `;

        $slidePresentationHTML.querySelectorAll('.slide').forEach( $slide => $slide.classList.add('hidden') );
        $slidePresentationHTML.querySelectorAll('.slide')[0].classList.remove('hidden');
        $slidePresentationHTML.querySelectorAll('.page-selector__btn')[0].classList.add('active');
        document.querySelector(".modal-overlay").style.display = "block";
        bodyComponent.render($slidePresentationHTML);

        this.isRendered = true;
    }

    /**
     * @description Transitions to the given slide number with a short hide animation. Does nothing
     * if the presentation is not rendered, the slide number equals the current slide, or the slide
     * index is out of range.
     * @param {number} slideNumber - Zero-based index of the slide to navigate to.
     * @returns {void}
     */
    render(slideNumber) {

        if (!this.isRendered) return;
        if (this.currentSlide === slideNumber) return;
        if (slideNumber >= this.slides.length) return;

        const $currentButton = document.querySelector('.slide-presentation').querySelectorAll('.page-selector__btn')[this.currentSlide];
        const $nextButton = document.querySelector('.slide-presentation').querySelectorAll('.page-selector__btn')[slideNumber];
        const $currentSlide = document.querySelector('.slide-presentation').querySelectorAll('.slide')[this.currentSlide];
        const $nextSlide = document.querySelector('.slide-presentation').querySelectorAll('.slide')[slideNumber];

        $currentSlide.classList.add('hiding');

        setTimeout(() => {
            $currentSlide.classList.remove('hiding');
            $currentSlide.classList.add('hidden');
            $nextSlide.classList.remove('hidden');
            $currentButton.classList.remove('active');
            $nextButton.classList.add('active');
        }, 200);

        this.currentSlide = slideNumber;
    }

    /**
     * @description TODO: Clarify intent.
     * @param {Element} element - Element to highlight.
     * @returns {void}
     */
    highlight(element) {

    }

    /**
     * @description Dismisses the presentation with a hide animation, removes it from the DOM,
     * hides the modal overlay, and persists a flag in `localStorage` so the tutorial is not shown
     * again automatically.
     * @returns {void}
     */
    endPresentation() {
        document.querySelector(".slide-presentation").classList.add('hiding');
        document.querySelector(".modal-overlay").style.display = "none";
        setTimeout(() => {
            document.querySelector(".slide-presentation").remove();
        }, 200);

        localStorage.setItem("tutorial-seen", "true");
    }

}


const introductionSlide = new slide(
  'Welcome to PackeTTrino 🥳',
  './assets/favicon.svg',
  `PackeTTrino is a graphical and interactive tool for learning networking in an intuitive way.
    In this tutorial, you will learn how to create devices, connect them, and simulate a complete network. Let's get started!`
);

introductionSlide.mediaShadow = "none";

const createAndConnectDevicesSlide = new slide(
  'Create and connect devices 💻',
  './assets/tutorial/slide1.gif',
  `To create a device, drag it from the bottom panel onto the workspace.
  You can drop computers, switches, routers, and more. Each one has its own menu for configuration.
  Try connecting PCs to switches, switches to routers, etc. Cables will appear visually on the workspace.`
);

const configureDevicesSlide = new slide(
  'Device options ⚙️',
  './assets/tutorial/slideDeviceSettings.gif',
  `Right-click on a device to access its configuration options.
  You will see different options depending on the device and the installed packages.`
);

const testNetworkSlide = new slide(
  'Connectivity Test 📡',
  './assets/tutorial/slidePing.gif',
  `Once the devices are connected and configured,
  test the network with <code>ping</code> between hosts. If everything is properly set up, you will see successful replies and know the network is working.`
);

const nowItsYourTurnSlide = new slide(
  'Now it\'s your turn! 🚀',
  './assets/tutorial/lastSlide.jpg',
  `Close this tutorial and try building
  your own network topology. Explore the options, experiment, and if you get lost… you can always come back to this tutorial
  or check the official documentation on GitHub. Good luck, future networking expert!`
);

const creditsSlide = new slide(
  'Credits 👨‍💻',
  './assets/tutorial/ies.png',
  `This application was developed entirely by <br><a href="https://www.linkedin.com/in/josé-amín-pérez-alconchel-2191b430b" target="_blank">José Amín Pérez Alconchel</a>
  as a Final Degree Project in Network Computer Systems Administration at IES Mar de Cádiz.
  <br><br>
  If you enjoy the world of networking you can also find information about various protocols and tools
  at <a href="https://www.fpgenred.es" target="_blank">www.fpgenred.es</a>`
);

creditsSlide.mediaShadow = "none";

const terminalSlide = new slide(
  'Integrated Terminal 🗔',
  './assets/tutorial/slideTerminal.gif',
  `The integrated terminal is a command tool for interacting with your device.
  You can use commands like <code>ping</code>, <code>curl</code>, <code>ifup</code>, or configure IPs and subnet masks.
  You can perform filesystem operations with commands like <code>ls</code>, <code>cat</code>, or <code>nano</code>.`
);

terminalSlide.mediaHeight = "250px";

const installPackagesSlide = new slide(
  'Install packages 📦',
  './assets/tutorial/slidePaquetes.gif',
  `To install packages, you can use the <code>apt</code> command from the integrated terminal or drag and drop the package onto the device.`
);

installPackagesSlide.mediaHeight = "250px";

const tutorial = new slidePresentation();

tutorial.addSlide(
    introductionSlide,
    createAndConnectDevicesSlide,
    configureDevicesSlide,
    terminalSlide,
    testNetworkSlide,
    installPackagesSlide,
    nowItsYourTurnSlide,
    creditsSlide
);

/**
 * @description Starts the tutorial slide presentation.
 * @returns {void}
 */
function startTutorial() {
    tutorial.startPresentation();
}
