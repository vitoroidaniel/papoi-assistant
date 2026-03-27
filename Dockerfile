FROM nginx:alpine
COPY papoi-assistant.html /usr/share/nginx/html/index.html
EXPOSE 80
