// const url = '82.165.10.57:3000'
const url = 'ap1.casaroja.app';

document.getElementById('encender').addEventListener('click', () => {
  mostrarLoader();

    fetch(`https://${url}/encender-canal`, { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(response => {
        ocultarLoader();
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
        ocultarLoader();
      console.log(data);
      document.getElementById('estadoEncenderCanal').textContent = 'Canal encendido. ID del contenedor: ' + data.containerId;
      document.getElementById('estadoEncenderCanal').className = 'verde'; // Establece el color a verde
    })
    .catch((error) => {
        ocultarLoader();
      console.error('Error:', error);
      document.getElementById('estadoEncenderCanal').textContent = 'Error al encender el canal';
      document.getElementById('estadoEncenderCanal').className = 'rojo'; // Establece el color a rojo
    });
  });

document.getElementById('encenderT').addEventListener('click', () => {
  mostrarLoader();

    fetch(`https://${url}/encender-canalT`, { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(response => {
        ocultarLoader();
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
        ocultarLoader();
      console.log(data);
      document.getElementById('estadoEncenderCanal').textContent = 'Canal transcoding encendido. ID del contenedor: ' + data.containerId;
      document.getElementById('estadoEncenderCanal').className = 'verde'; // Establece el color a verde
    })
    .catch((error) => {
        ocultarLoader();
      console.error('Error:', error);
      document.getElementById('estadoEncenderCanal').textContent = 'Error al encender el canal';
      document.getElementById('estadoEncenderCanal').className = 'rojo'; // Establece el color a rojo
    });
  });

document.getElementById('apagar').addEventListener('click', () => {
  mostrarLoader();

    fetch(`https://${url}/apagar-canal`, { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(response => {
        ocultarLoader();
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
        ocultarLoader();
      console.log(data);
      document.getElementById('estadoApagarCanal').textContent = data.message;
      document.getElementById('estadoApagarCanal').className = 'verde'; // Cambia el color a rojo para indicar que el canal está apagado
    })
    .catch((error) => {
        ocultarLoader();
      console.error('Error:', error);
      document.getElementById('estadoApagarCanal').textContent = 'Error al apagar el canal';
      document.getElementById('estadoApagarCanal').className = 'rojo';
    });
  });

document.getElementById('apagarT').addEventListener('click', () => {
  mostrarLoader();

    fetch(`https://${url}/apagar-canalT`, { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(response => {
        ocultarLoader();
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
        ocultarLoader();
      console.log(data);
      document.getElementById('estadoApagarCanal').textContent = data.message;
      document.getElementById('estadoApagarCanal').className = 'verde'; 
    })
    .catch((error) => {
        ocultarLoader();
      console.error('Error:', error);
      document.getElementById('estadoApagarCanal').textContent = 'Error al apagar el canal';
      document.getElementById('estadoApagarCanal').className = 'rojo';
    });
  });

  function mostrarLoader() {
    document.getElementById('loader').style.display = 'block';
}

function ocultarLoader() {
    document.getElementById('loader').style.display = 'none';
}

function verificarEstadoCanal() {
  mostrarLoader();
  fetch(`https://${url}/estado-canal`, { 
    method: 'GET',
  })
  .then(response => response.json())
  .then(data => {
    ocultarLoader();
    document.getElementById('estadoCanal').textContent = data.estado;
    const color = data.estado.includes('Canal encendido') ? 'verde' : 'rojo';
    document.getElementById('estadoCanal').className = color;
  })
  .catch((error) => {
    ocultarLoader();
    console.error('Error:', error);
    document.getElementById('estadoCanal').textContent = 'Error al verificar el estado del canal';
    document.getElementById('estadoCanal').className = 'rojo';
  });
}

// Verificar el estado del canal cada 10 segundos
document.getElementById('refrescar').addEventListener('click', function() {
    verificarEstadoCanal();
});

// Verificar el estado del canal al cargar la página
verificarEstadoCanal();
