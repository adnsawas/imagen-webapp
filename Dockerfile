# Use official Node.js image
FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Copy app files
COPY package*.json ./
RUN npm install

COPY . .

# Run app on port 3000
EXPOSE 3000
CMD [ "npm", "start" ]