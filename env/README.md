# Environment

Development will be done for the Raspberry Pi 3 B+, but code may still be compatible with Raspberry Pi 4 models.

## Nginx
Please verify
```
[Install and run nginx]
sudo apt-get update
sudo apt-get install nginx
sudo systemctl enable nginx
# set /etc/nginx/nginx.conf if needed
# enable ports 80 and 443 (or other ports) if needed
sudo systemctl start nginx
```

## Firewall

## Development Environment Setup