FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5175

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# docker build -t codecollab-frontend:latest .
# kind load docker-image codecollab-frontend:latest --name codecollab-local-cluster


# DOCKER_BUILDKIT=0 docker build -t mightyshashank/codecollab:frontend-latest .
# docker push mightyshashank/codecollab:frontend-latest

