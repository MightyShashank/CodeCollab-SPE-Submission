# --- Stage 1: Build Stage ---
# Use an official Node.js runtime as a parent image.
# The 'alpine' version is lightweight.
FROM node:18-alpine AS build

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json first
# This leverages Docker's layer caching. If these files don't change,
# Docker won't re-run 'npm install' on subsequent builds.
COPY package*.json ./

# Install app dependencies
# Using 'ci' is recommended for reproducible builds in CI/CD environments
RUN npm ci

# Copy the rest of your application source code
COPY . .

# --- Stage 2: Production Stage ---
# Use a smaller, more secure base image for the final product
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy only the necessary files from the 'build' stage
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./
COPY --from=build /app .

# Expose the port the app runs on
# Your server listens on process.env.PORT || 3000
EXPOSE 3000

# Define the command to run your app
# This will be executed when the container starts
CMD ["node", "src/index.js"]

