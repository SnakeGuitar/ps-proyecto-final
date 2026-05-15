// Cambio de portada del producto al seleccionar archivo
(function () {
    const select = document.querySelector('select[name=ArchivoId]');
    const img = document.querySelector('img.portada');
    if (select && img) {
        const url = img.dataset.url || '';
        select.addEventListener('change', () => {
            if (select.value) {
                img.src = `${url}/api/archivos/${select.value}`;
            } else {
                img.src = 'https://via.placeholder.com/300x450';
            }
        });
    }
})();
