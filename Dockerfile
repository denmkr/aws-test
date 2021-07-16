# Declare which image to pull
# We use a minimal system with NodeJS and NPM installed
FROM node:lts-buster-slim

# Set working directory
ENV APP_DIR=/var/opt/annotation

# Copy data
COPY ./ ${APP_DIR}

# Set working directory
WORKDIR ${APP_DIR}

# Install requirements
RUN npm install
RUN npm install -g @angular/cli@8.3.18
RUN npm install d3
RUN npm install tslib

# Start development server
CMD sh -c "npm run start:docker"
