# Use a base image with Node.js pre-installed
FROM node:14

# Create and set the working directory
WORKDIR /usr/src/app

COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the application files to the working directory
COPY . .

# Expose the port your application will run on
EXPOSE 3000

# Specify the command to run your application
CMD ["node", "app.js"]
