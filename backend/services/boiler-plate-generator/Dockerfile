# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package manifests and install dependencies
COPY package*.json ./
RUN npm install --only=production

# Copy the rest of your application code
COPY . .

# Expose the port the app runs on
EXPOSE 4000

# Define the command to run your app
CMD ["node", "index.js"]
