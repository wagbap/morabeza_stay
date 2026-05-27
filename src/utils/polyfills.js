// src/utils/polyfills.js
// Prevenir erro do share-modal.js
if (typeof window !== 'undefined') {
    // Prevenir erro de script share-modal
    window.addEventListener('load', () => {
        // Remover qualquer script share-modal problemático
        const scripts = document.querySelectorAll('script[src*="share-modal"]');
        scripts.forEach(script => script.remove());
    });
    
    // Mock para prevenir erro
    if (!window.ShareModal) {
        window.ShareModal = {
            init: () => {},
            show: () => {},
            close: () => {}
        };
    }
}