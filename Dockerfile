FROM nginx:alpine as production

COPY ./dist /srv
COPY ./data/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
