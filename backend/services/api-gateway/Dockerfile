# filename: Dockerfile
FROM node:18-slim
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY . .
EXPOSE 8080
CMD ["node", "gateway-server.js"]

# docker build -t mightyshashank/codecollab:api-gateway-image-v42 .
# docker push mightyshashank/codecollab:api-gateway-image-v42
