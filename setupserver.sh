# set up AIO stream server (Ubuntu)
# ports to be open 8000-8005, 3000, 80

#wget https://raw.githubusercontent.com/Angeloyo/testing/main/setupserver.sh -O /tmp/install.sh; bash /tmp/install.sh

# sudo apt update && sudo apt upgrade -y && sudo reboot

# install docker (and docker compose)

wget https://raw.githubusercontent.com/Angeloyo/boilerplates/main/scripts/installdocker.sh -O /tmp/install.sh; bash /tmp/install.sh

# install dependencies

sudo apt install nginx git nodejs npm -y

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

}

server {
    listen 8000;
    listen [::]:8000;
    server_name $serverip;

    location / {
        proxy_pass http://127.0.0.1:8050;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $serverip:8000;
        proxy_cache_bypass \$http_upgrade;

        proxy_set_header X-Real-IP 127.0.0.1;
        proxy_set_header X-Forwarded-For 127.0.0.1;
    }

}

server {
    listen 8001;
    listen [::]:8001;
    server_name $serverip;

    location / {
        proxy_pass http://127.0.0.1:8051;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $serverip:8001;
        proxy_cache_bypass \$http_upgrade;

        proxy_set_header X-Real-IP 127.0.0.1;
        proxy_set_header X-Forwarded-For 127.0.0.1;
    }

}

server {
    listen 8002;
    listen [::]:8002;
    server_name $serverip;

    location / {
        proxy_pass http://127.0.0.1:8052;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $serverip:8002;
        proxy_cache_bypass \$http_upgrade;

        proxy_set_header X-Real-IP 127.0.0.1;
        proxy_set_header X-Forwarded-For 127.0.0.1;
    }

}

server {
    listen 8003;
    listen [::]:8003;
    server_name $serverip;

    location / {
        proxy_pass http://127.0.0.1:8053;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $serverip:8003;
        proxy_cache_bypass \$http_upgrade;

        proxy_set_header X-Real-IP 127.0.0.1;
        proxy_set_header X-Forwarded-For 127.0.0.1;
    }

}

server {
    listen 8004;
    listen [::]:8004;
    server_name $serverip;

    location / {
        proxy_pass http://127.0.0.1:8054;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $serverip:8004;
        proxy_cache_bypass \$http_upgrade;

        proxy_set_header X-Real-IP 127.0.0.1;
        proxy_set_header X-Forwarded-For 127.0.0.1;
    }

}

server {
    listen 8005;
    listen [::]:8005;
    server_name $serverip;

    location / {
        proxy_pass http://127.0.0.1:8055;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $serverip:8005;
        proxy_cache_bypass \$http_upgrade;

        proxy_set_header X-Real-IP 127.0.0.1;
        proxy_set_header X-Forwarded-For 127.0.0.1;
    }

}

" >> /etc/nginx/sites-available/default

#apply changes
sudo systemctl reload nginx

sudo rm -rf /var/www/html/*

git clone https://github.com/Angeloyo/testing /var/www/html/

cd /var/www/html/

npm install

