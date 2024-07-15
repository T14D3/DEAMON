# API Tools and Resources for The First Descendant

This is a sandbox application built with React for managing and interacting with modular components.

## Overview

The Sandbox allows users to:

- Add modules from a predefined list.
- Arrange modules in a 12-slot grid.
- Modify module properties such as level and slot.
- Export and import module configurations.

## Features

### Adding Modules

Modules can be added to the sandbox by searching and selecting from a predefined list. Each module has properties such as name, image, and stats associated with it.

### Arranging Modules

Modules can be arranged within a 12-slot grid. Users can drag and drop modules to different slots.

### Editing Module Details

Users can click on a module to view and edit its details in a modal. Details that can be edited include the module's level and other configurable properties.

### Exporting and Importing Configurations

The application supports exporting the current module configuration to a JSON file (`sandbox-config.json`). It also allows importing configurations from JSON files, updating the current state with the imported data.

## Setup

To run the application locally:

1. Clone this repository.
2. Install dependencies using `npm install`.
3. Start the development server with `npm start`.

## Project Structure

The project is structured as follows:

- **src/**
  - [`App.css`](src/App.css): CSS styles for the main App component.
  - [`App.js`](src/App.js): Main component handling the application routing and layout.
  - [`App.test.js`](src/App.test.js): Test file for the App component.
  - [`LandingPage.js`](src/LandingPage.js): Component for the landing page of the application.
  - [`index.css`](src/index.css): Global styles for the application.
  - [`index.js`](src/index.js): Entry point of the application.
  - [`logo.svg`](src/logo.svg): Logo file for the application.
  - [`reportWebVitals.js`](src/reportWebVitals.js): Utility for reporting web vitals.
  - [`server.js`](src/server.js): Server script for local API caching.
  - [`setupTests.js`](src/setupTests.js): Setup file for Jest tests.
  
- **src/components/**
  - [`DraggableBox.js`](src/components/DraggableBox.js): Component representing draggable modules.
  - [`GridSlot.js`](src/components/GridSlot.js): Component representing slots in the grid where modules can be placed.
  - [`Header.css`](src/components/Header.css): CSS styles for the header component.
  - [`Header.js`](src/components/Header.js): Component for the application header.
  - [`Layout.css`](src/components/Layout.css): CSS styles for the application layout.
  - [`Layout.js`](src/components/Layout.js): Component defining the main layout structure of the application.
  - [`Modal.css`](src/components/Modal.css): CSS styles for the modal component.
  - [`Modal.js`](src/components/Modal.js): Component for displaying a modal to edit module details.
  - [`ModuleDisplay.css`](src/components/ModuleDisplay.css): CSS styles for displaying modules.
  - [`ModuleDisplay.js`](src/components/ModuleDisplay.js): Component for displaying module details.
  - [`ModuleSearch.js`](src/components/ModuleSearch.js): Component for searching and adding modules.

- **src/pages/**
  - [`Sandbox.css`](src/pages/Sandbox.css): CSS styles specific to the Sandbox page.
  - [`Sandbox.js`](src/pages/Sandbox.js): Main component (`Sandbox`) where the main logic and state management of the application reside.
  - [`User.css`](src/pages/User.css): CSS styles specific to the User page.
  - [`User.js`](src/pages/User.js): Component for the User page.
  - [`Zones.css`](src/pages/Zones.css): CSS styles specific to the Zones page.
  - [`Zones.js`](src/pages/Zones.js): Component for the Zones page.
  - [`dev.css`](src/pages/dev.css): CSS styles for development purposes.
  - [`dev.js`](src/pages/dev.js): Development related component.
  - [`sandbox.backup.js`](src/pages/sandbox.backup.js): Backup file related to the Sandbox page.

- **src/util/**
  - [`api.js`](src/util/api.js): Utility functions for API interactions.
  - [`helpers.js`](src/util/helpers.js): Additional helper functions.


### API Integration

The application integrates with an external API to fetch module data. To run the application yourself, you need to provide your own Nexon API key by defining it as the `REACT_APP_API_KEY` environment variable.

### Local API (for Caching)

To avoid excessive requests to Nexon's API, module data is cached locally using a server (`server.js`) with Node.js.

## Contributing

Contributions are welcome! If you find any issues or have suggestions for improvements, please submit an issue or a pull request.
