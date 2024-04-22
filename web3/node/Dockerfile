# Use official Node.js LTS (Long Term Support) image as base image
FROM node:lts-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all source code to the working directory
COPY . .

# Expose port on which the application will run (change if needed)
EXPOSE 3000

# Command to run the application
CMD ["node", "index.js"]