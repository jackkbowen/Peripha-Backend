# Peripha Documentation

Documentation for **Peripha.**

Peripha is a web based platform to share and review different computer peripherals for any use case. Users will be able to create their own profile to showcase what peripherals they are currently using or have used, and rate them based on their performance and usability.

This guide will help you get started with Peripha, understand its structure, and provide instructions for development, building, and deployment.

## Table of Contents

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Project Structure](#project-structure)
4. [Building and Deployment](#building-and-deployment)

## Introduction

Peripha is a web application designed to provide a responsive and seamless user experience. This project is built using **React** for the UI components, **Vite** as the development and build tool, and **Tailwind CSS** for styling. It leverages modern JavaScript and TypeScript, along with tools for linting, testing, and code quality to ensure a smooth development process.

## Installation

To get started with Peripha, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/jackkbowen/peripha-frontend.git
   cd peripha
   ```

2. Install dependencies:
    ```bash
   npm install
   ```

## Project Structure
The Peripha project follows a standard structure for React applications with Vite:
```
peripha/
├── node_modules/        # Installed dependencies
├── public/              # Static assets
├── src/                 # Application source code
│   ├── components/      # React components
│        ├── LandingPage #
│        ├── LoginRegister
│        ├── Product
│        ├── Profile
│        ├── Search
│        ├── Navbar
│   ├── styles/          # Tailwind CSS and other styles
│   ├── App.jsx          # Main application component
│   └── index.jsx        # Entry point for React
├── .eslintrc.js         # ESLint configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── vite.config.js       # Vite configuration
└── package.json         # Project metadata and scripts
```

## Building and Deployment

To build this applicaiton for prodction:
```
npm run build
```

This will generate optimized static files in the dist/ directory, ready for deployment.

To test the production build locally:
```
npm run preview
```
