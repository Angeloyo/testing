document.getElementById('encender').addEventListener('click', () => {
    document.getElementById('loader').style.display = 'block';
    fetch('http://82.165.10.57:3000/encender-canal', { // Asegúrate de que la URL es correcta
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(response => {
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      console.log(data);
      document.getElementById('estadEncenderCanal').textContent = 'Canal encendido. ID del contenedor: ' + data.containerId;
      document.getElementById('estadEncenderCanal').className = 'verde'; // Establece el color a verde
    })
    .catch((error) => {
      console.error('Error:', error);
      document.getElementById('estadEncenderCanal').textContent = 'Error al encender el canal';
      document.getElementById('estadEncenderCanal').className = 'rojo'; // Establece el color a rojo
    });

    document.getElementById('loader').style.display = 'none';
  });

  
document.getElementById('apagar').addEventListener('click', () => {
    document.getElementById('loader').style.display = 'block';

    fetch('http://82.165.10.57:3000/apagar-canal', { // Asegúrate de que la URL es correcta
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(response => {
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      console.log(data);
      document.getElementById('estadoApagarCanal').textContent = data.message;
      document.getElementById('estadoApagarCanal').className = 'verde'; // Cambia el color a rojo para indicar que el canal está apagado
    })
    .catch((error) => {
      console.error('Error:', error);
      document.getElementById('estadoApagarCanal').textContent = 'Error al apagar el canal';
      document.getElementById('estadoApagarCanal').className = 'rojo';
    });

    document.getElementById('loader').style.display = 'none';

  });
  


function verificarEstadoCanal() {
  fetch('http://82.165.10.57:3000/estado-canal', { // Asegúrate de que la URL es correcta
    method: 'GET',
  })
  .then(response => response.json())
  .then(data => {
    document.getElementById('estadoCanal').textContent = data.estado;
    const color = data.estado === 'Canal encendido' ? 'verde' : 'rojo';
    document.getElementById('estadoCanal').className = color;
  })
  .catch((error) => {
    console.error('Error:', error);
    document.getElementById('estadoCanal').textContent = 'Error al verificar el estado del canal';
    document.getElementById('estadoCanal').className = 'rojo';
  });
}

// Verificar el estado del canal cada 10 segundos
setInterval(verificarEstadoCanal, 6000);

// Verificar el estado del canal al cargar la página
verificarEstadoCanal();
