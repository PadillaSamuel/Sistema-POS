FROM node:20-alpine AS build
WORKDIR /app
ARG VITE_API_URL
ARG VITE_IMPRESORA_COCINA
ARG VITE_IMPRESORA_FACTURA
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_IMPRESORA_COCINA=$VITE_IMPRESORA_COCINA
ENV VITE_IMPRESORA_FACTURA=$VITE_IMPRESORA_FACTURA

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html

RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
    } \
    error_page 405 =200 $uri; \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]