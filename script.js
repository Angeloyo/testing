// script.js
document.getElementById('encender').addEventListener('click', () => {
    fetch('/encender', { method: 'POST' })
        .then(response => {
            if (!response.ok) {
                throw new Error('Hubo un problema al iniciar el contenedor Docker.');
            }
            return response.text();
        })
        .then(data => {
            document.getElementById('estadoCanal').textContent = 'Canal encendido';
            document.getElementById('estadoCanal').classList.add('verde');
        })
        .catch(error => {
            document.getElementById('estadoCanal').textContent = 'Error: ' + error.message;
            document.getElementById('estadoCanal').classList.add('rojo');
        });
});

document.getElementById('apagar').addEventListener('click', () => {
    // Código para apagar el contenedor
});

// Comprobación periódica del estado del contenedor
setInterval(() => {
    fetch('/estado')
        .then(response => response.json())
        .then(data => {
            if (data.estado === 'activo') {
                document.getElementById('estadoCanal').textContent = 'Canal encendido';
                document.getElementById('estadoCanal').classList.remove('rojo');
                document.getElementById('estadoCanal').classList.add('verde');
            } else {
                document.getElementById('estadoCanal').textContent = 'Canal apagado';
                document.getElementById('estadoCanal').classList.remove('verde');
                document.getElementById('estadoCanal').classList.add('rojo');
            }
        })
        .catch(error => {
            console.error('Error al obtener el estado del contenedor:', error);
        });
}, 2000);
