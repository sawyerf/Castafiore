# This docker is to build the android app
#
# docker-compose up --build
# docker exec -it <container_id> bash

FROM openjdk:11-jdk

# Install necessary packages and dependencies
RUN apt-get update && apt-get install -y \
    wget \
    unzip \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Set environment variables
ENV ANDROID_SDK_ROOT /opt/android-sdk
ENV PATH ${PATH}:${ANDROID_SDK_ROOT}/cmdline-tools/latest/bin:${ANDROID_SDK_ROOT}/platform-tools

# Download and install Android SDK command-line tools
RUN mkdir -p ${ANDROID_SDK_ROOT}/cmdline-tools \
    && cd ${ANDROID_SDK_ROOT}/cmdline-tools \
    && wget https://dl.google.com/android/repository/commandlinetools-linux-8512546_latest.zip -O commandlinetools.zip \
    && unzip commandlinetools.zip -d ${ANDROID_SDK_ROOT}/cmdline-tools \
    && mv ${ANDROID_SDK_ROOT}/cmdline-tools/cmdline-tools ${ANDROID_SDK_ROOT}/cmdline-tools/latest \
    && rm commandlinetools.zip

# Install SDK packages
RUN yes | sdkmanager --licenses \
    && sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"

RUN curl -fsSL https://deb.nodesource.com/setup_20.x | sh - && apt install nodejs -y

RUN npm install -g eas-cli

WORKDIR /app
COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json

WORKDIR /install
RUN ln -s /app/package.json /install/package.json
RUN ln -s /app/package-lock.json /install/package-lock.json
RUN npm install

ENV NODE_PATH=/install/node_modules

WORKDIR /app