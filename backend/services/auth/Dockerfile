# filename: Dockerfile

# Use a slim Node.js image for a smaller final image size
FROM node:18-slim

# Set the working directory inside the container
WORKDIR /app

# Copy package manifests first to leverage Docker's layer caching
COPY package*.json ./

# Install production dependencies
RUN npm install --only=production

# Copy the rest of your application source code
COPY . .

# Expose the port the app runs on (5000 according to your index.js)
EXPOSE 5000

# Define the command to run your app when the container starts
CMD ["node", "index.js"]
