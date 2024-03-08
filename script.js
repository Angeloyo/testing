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
      document.getElementById('estadoEncenderCanal').className = 'verde'; 
    })
    .catch((error) => {
        ocultarLoader();
      console.error('Error:', error);
      document.getElementById('estadoEncenderCanal').textContent = 'Error al encender el canal';
      document.getElementById('estadoEncenderCanal').className = 'rojo'; 
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
      document.getElementById('estadoEncenderCanalT').textContent = 'Canal transcoding encendido.';
      document.getElementById('estadoEncenderCanalT').className = 'verde'; 
    })
    .catch((error) => {
        ocultarLoader();
      console.error('Error:', error);
      document.getElementById('estadoEncenderCanalT').textContent = 'Error al encender el canal';
      document.getElementById('estadoEncenderCanalT').className = 'rojo'; 
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
      document.getElementById('estadoApagarCanalT').textContent = data.message;
      document.getElementById('estadoApagarCanalT').className = 'verde'; 
    })
    .catch((error) => {
        ocultarLoader();
      console.error('Error:', error);
      document.getElementById('estadoApagarCanalT').textContent = 'Error al apagar el canal';
      document.getElementById('estadoApagarCanalT').className = 'rojo';
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
    const color = data.estado.includes('encendido') ? 'verde' : 'rojo';
    document.getElementById('estadoCanal').className = color;
  })
  .catch((error) => {
    ocultarLoader();
    console.error('Error:', error);
    document.getElementById('estadoCanal').textContent = 'Error al verificar el estado del canal';
    document.getElementById('estadoCanal').className = 'rojo';
  });
}

function verificarEstadoCanalT() {
  mostrarLoader();
  fetch(`https://${url}/estado-canalT`, { 
    method: 'GET',
  })
  .then(response => response.json())
  .then(data => {
    ocultarLoader();
    document.getElementById('estadoCanalT').textContent = data.estado;
    const color = data.estado.includes('encendido') ? 'verde' : 'rojo';
    document.getElementById('estadoCanalT').className = color;
  })
  .catch((error) => {
    ocultarLoader();
    console.error('Error:', error);
    document.getElementById('estadoCanalT').textContent = 'Error al verificar el estado del canal';
    document.getElementById('estadoCanalT').className = 'rojo';
  });
}

// Verificar el estado del canal manualmente
document.getElementById('refrescar').addEventListener('click', function() {
    verificarEstadoCanal();
    verificarEstadoCanalT();
});

// Verificar el estado del canal al cargar la página
verificarEstadoCanal();
verificarEstadoCanalT();


function crearCanal() {
  // Recoger los valores del formulario
  const nombreCanal = document.getElementById('nombre-canal').value;
  const idCanal = document.getElementById('id-canal').value;

  // Generar el HTML para el nuevo canal
  const nuevoCanalHTML = `
    <div class="canal" id="canal-${idCanal}">
      <h3>${nombreCanal}</h3>
      <p>${idCanal}</p>
      <button onclick="encenderCanal('${idCanal}')">Encender Canal</button>
      <button onclick="apagarCanal('${idCanal}')">Apagar Canal</button>
      <button onclick="refrescarCanal('${idCanal}')">Refrescar</button>
      <button onclick="eliminarCanal('${idCanal}')">Eliminar</button>
    </div>
  `;

  // Agregar el nuevo canal al DOM
  document.body.innerHTML += nuevoCanalHTML;

  // Opcional: Llamar a una API para guardar el canal en el servidor
  // guardarCanal(nombreCanal, idCanal);
}

function cancelarCreacion() {
  document.getElementById('nombre-canal').value = '';
  document.getElementById('id-canal').value = '';
}

function eliminarCanal(idCanal) {
  // Eliminar el canal del DOM
  const elementoCanal = document.getElementById(`canal-${idCanal}`);
  if (elementoCanal) {
    elementoCanal.parentNode.removeChild(elementoCanal);
  }

  // Opcional: Enviar solicitud al backend para eliminar el canal de la base de datos
  // eliminarCanalBackend(idCanal);
}

window.onload = function() {
    obtenerCanalesYMostrar();
};

function obtenerCanalesYMostrar() {
    fetch('/api/canales')
        .then(function (response) {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json(); // Parsea la respuesta JSON
        })
        .then(function (canales) {
            const listaCanales = document.getElementById('lista-canales');
            listaCanales.innerHTML = ''; // Limpiar la lista antes de mostrar los resultados
            canales.forEach(canal => {
                const elemento = document.createElement('div');
                elemento.innerHTML = `Nombre: ${canal.nombre}, ID: ${canal.id}, Docker ID: ${canal.docker_id || 'No Encendido'}`;
                listaCanales.appendChild(elemento);
            });
        })
        .catch(function (error) {
            console.error('Error al obtener los canales:', error);
        });
}

document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("crear-canal-form");

    form.addEventListener("submit", function(event) {
        event.preventDefault(); // Evitar el envío del formulario por defecto

        const nombre = document.getElementById("nombre-canal").value;
        const id = document.getElementById("id-canal").value;

        // Objeto con los datos del canal a crear
        const datosCanal = { id, nombre };

        // Envío de los datos al servidor usando fetch
        fetch("/api/canales", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(datosCanal),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
            alert("Canal creado exitosamente");
            // Opcional: actualiza la UI o limpia el formulario aquí
        })
        .catch((error) => {
            console.error("Error al crear el canal:", error);
        });
    });
});
