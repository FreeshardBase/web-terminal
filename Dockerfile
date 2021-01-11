FROM nginx:alpine as production

COPY ./dist /srv
COPY ./aux/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80