# Declare which image to pull
# We use a minimal system with NodeJS and NPM installed
FROM node:lts-buster-slim

# Set working directory
WORKDIR '/app'

# Copy data
COPY . .

# Install requirements
RUN npm install
RUN npm install -g @angular/cli
RUN npm install @angular/cli
RUN npm install d3
RUN npm install tslib

EXPOSE 4200

# Start development server
CMD sh -c "npm run start:docker"
