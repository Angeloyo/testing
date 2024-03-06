document.getElementById('encender').addEventListener('click', () => {
    fetch('http://localhost:3000/encender-canal', { // Asegúrate de que la URL es correcta
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
      document.getElementById('estadoCanal').textContent = 'Canal encendido. ID del contenedor: ' + data.containerId;
      document.getElementById('estadoCanal').className = 'verde';
    })
    .catch((error) => {
      console.error('Error:', error);
      document.getElementById('estadoCanal').textContent = 'Error al encender el canal';
      document.getElementById('estadoCanal').className = 'rojo';
    });
  });
  