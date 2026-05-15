// Cambio de tema claro/oscuro
(function () {
    const root = document.documentElement;
    const sw = document.getElementById('darkModeSwitch');
    const saved = localStorage.getItem('bs-theme') || 'light';
    root.setAttribute('data-bs-theme', saved);
    if (sw) {
        sw.checked = saved === 'dark';
        sw.addEventListener('change', () => {
            const t = sw.checked ? 'dark' : 'light';
            root.setAttribute('data-bs-theme', t);
            localStorage.setItem('bs-theme', t);
        });
    }
})();
