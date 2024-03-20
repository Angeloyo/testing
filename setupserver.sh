# set up AIO stream server (Ubuntu)
# ports to be open 3000 (express server), 80(http)

#wget https://raw.githubusercontent.com/Angeloyo/testing/main/setupserver.sh -O /tmp/install.sh; bash /tmp/install.sh

# sudo apt update && sudo apt upgrade -y && sudo reboot

# install docker (and docker compose)

wget https://raw.githubusercontent.com/Angeloyo/boilerplates/main/scripts/installdocker.sh -O /tmp/install.sh; bash /tmp/install.sh

# install dependencies

sudo apt install nginx git nodejs npm sqlite3 pm2 -y

# new nginx configuration (we save the old one)
sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/old

sudo rm /etc/nginx/sites-available/default

sudo touch /etc/nginx/sites-available/default

echo "What is the IP of your server ?"

read serverip

sudo echo "

server {
    listen 80;
    listen [::]:80;
    server_name $serverip;

    root /var/www/html;
    index index.html index.htm index.nginx-debian.html;

    location / {
	    try_files \$uri \$uri/ =404;
    }

    location /api {
        proxy_pass http://127.0.0.1:3000;
    }

    location /watch/0/ace {
        proxy_pass http://127.0.0.1:8050/ace;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $serverip:443/watch/0;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP 127.0.0.1;
        proxy_set_header X-Forwarded-For 127.0.0.1;
    }

    location /watch/1/ace {
        proxy_pass http://127.0.0.1:8051/ace;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $serverip:80/watch/1;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP 127.0.0.1;
        proxy_set_header X-Forwarded-For 127.0.0.1;
    }

    location /watch/2/ace {
        proxy_pass http://127.0.0.1:8052/ace;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $serverip:80/watch/2;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP 127.0.0.1;
        proxy_set_header X-Forwarded-For 127.0.0.1;
    }
}

" >> /etc/nginx/sites-available/default

#apply changes
sudo systemctl reload nginx

sudo rm -rf /var/www/*

sudo mkdir /var/www/html

sudo git clone https://github.com/Angeloyo/testing /var/www/html/

cd /var/www/html/

sudo npm install

pm2 start server.js

