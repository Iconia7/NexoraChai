(function() {
    // 1. Configuration: Read from the script tag
    const scriptTag = document.currentScript;
    const username = scriptTag.getAttribute('data-username') || 'nexora';
    const primaryColor = scriptTag.getAttribute('data-color') || '#914D00';
    const position = scriptTag.getAttribute('data-position') || 'right';

    // 2. Styles: Inject widget CSS
    const styles = `
        #nexora-chai-trigger {
            position: fixed;
            bottom: 24px;
            ${position}: 24px;
            background: ${primaryColor};
            color: white;
            padding: 12px 20px;
            border-radius: 9999px;
            display: flex;
            items-center;
            gap: 10px;
            cursor: pointer;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 999999;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            font-size: 12px;
            border: none;
            outline: none;
        }
        #nexora-chai-trigger:hover {
            transform: scale(1.05) translateY(-2px);
            box-shadow: 0 20px 30px -10px rgba(0, 0, 0, 0.3);
        }
        #nexora-chai-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            backdrop-filter: blur(8px);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 9999999;
        }
        #nexora-chai-iframe {
            width: 100%;
            max-width: 500px;
            height: 90vh;
            border: none;
            border-radius: 32px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
    `;

    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);

    // 3. Elements: Create the button and the overlay
    const button = document.createElement("button");
    button.id = "nexora-chai-trigger";
    button.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>
        Buy me a Chai
    `;

    const overlay = document.createElement("div");
    overlay.id = "nexora-chai-overlay";

    const iframe = document.createElement("iframe");
    iframe.id = "nexora-chai-iframe";
    iframe.allow = "payment";

    overlay.appendChild(iframe);
    document.body.appendChild(button);
    document.body.appendChild(overlay);

    // 4. Events: Toggle the modal
    button.onclick = () => {
        iframe.src = `https://chai.nexoracreatives.co.ke/embed/${username}`;
        overlay.style.display = "flex";
        document.body.style.overflow = "hidden"; // Prevent background scroll
    };

    overlay.onclick = (e) => {
        if (e.target.id === "nexora-chai-overlay") {
            closeChai();
        }
    };

    // 5. Communication: Listen for close message from iframe
    window.addEventListener('message', function(event) {
        if (event.data === 'close-chai-widget') {
            closeChai();
        }
    });

    function closeChai() {
        overlay.style.display = "none";
        document.body.style.overflow = "auto";
        iframe.src = "about:blank"; // Clear iframe
    }
})();
