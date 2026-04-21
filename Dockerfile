# Build Stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -- --configuration production

# Production Stage
FROM nginx:stable-alpine
# Copia o build do Angular (ajuste o caminho se o nome do projeto mudar em angular.json)
COPY --from=build /app/dist/anota-corts-web/browser /usr/share/nginx/html

# Configuração customizada do Nginx para Angular SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
