if ('serviceWorker' in navigator) {
    window.addEventListener('load', (event) => {
        navigator.serviceWorker
            .register('./service-worker.js')
            .then(registration => {
                console.log('Service Worker: registered.');
            })
            .catch(error => {
                console.log("Service worker err, "+ error);
            })
    })
}