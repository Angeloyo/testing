document.getElementById('encender').addEventListener('click', () => {
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
  });
  
  document.getElementById('apagar').addEventListener('click', () => {
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
      document.getElementById('estadoApagarCanal').className = 'rojo'; // Cambia el color a rojo para indicar que el canal está apagado
    })
    .catch((error) => {
      console.error('Error:', error);
      document.getElementById('estadoApagarCanal').textContent = 'Error al apagar el canal';
      document.getElementById('estadoApagarCanal').className = 'rojo';
    });
  });
  