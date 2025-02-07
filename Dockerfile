# Use official Node.js image as a base
FROM node:18.14-alpine AS build

# Set working directory
WORKDIR /app

# Temporarily disable SSL checks for apk and install ca-certificates
RUN apk --no-cache --update add --repository http://dl-cdn.alpinelinux.org/alpine/v3.17/main ca-certificates && \
    apk --no-cache --update add --repository http://dl-cdn.alpinelinux.org/alpine/v3.17/community ca-certificates

# Disable strict SSL checking for npm (bypass self-signed certificate errors)
RUN npm config set strict-ssl false

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install

# Copy the entire project and build it
COPY . .
RUN npm run build

# Use Nginx to serve the static files
FROM nginx:alpine

# Copy built React app to Nginx's web root
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
