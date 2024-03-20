# Usa una imagen base de Node.js
FROM node:latest

# Instala PM2 globalmente
RUN npm install pm2 -g

# Instala NGINX y SQLite
RUN apt-get update && \
    apt-get install -y nginx sqlite3 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copia tu configuración de NGINX al contenedor
COPY nginx/default.conf /etc/nginx/sites-available/default

# Establece el directorio de trabajo para tu aplicación Node.js
WORKDIR /usr/src/app

# Copia los archivos de tu aplicación al contenedor
COPY app/ .

# Instala las dependencias de tu aplicación Node.js
RUN npm install

# Expone los puertos que tu aplicación utiliza
EXPOSE 80 3000

# Configura el volumen para el socket de Docker
VOLUME ["/var/run/docker.sock"]

# Define el comando para iniciar tu aplicación usando PM2 y NGINX
CMD ["sh", "-c", "service nginx start && pm2-runtime start server.js"]
