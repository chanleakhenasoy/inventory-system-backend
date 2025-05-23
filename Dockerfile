# Use official Node.js image,
FROM node:18-alpine

# Set working directory,
WORKDIR /app

# Copy package files and install dependencies,
COPY package*.json ./
RUN npm install

# Copy all project files,
COPY . .

# Build the Next.js app,
RUN npm run build

# Expose port 3000,
EXPOSE 3002

# Start the app in production mode,
CMD ["npm", "start"]