FROM node:24.4.0-alpine3.22 AS build
WORKDIR /build
COPY . .
RUN npm i
RUN npm run export:web

FROM nginx:1.29.0-alpine3.22
COPY --from=build /build/dist /usr/share/nginx/html
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]