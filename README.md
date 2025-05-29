# Arina-Gemini

Arina-Gemini is a modern web application designed to provide advanced business analysis, recommendations, and forecasting tools. Built with a modular architecture, it leverages React (with Vite), TypeScript, Tailwind CSS, and a Node.js/Express backend. The project is structured for scalability and maintainability, supporting both client and server development.

## Features

- **Authentication**: Secure user authentication and profile management.
- **Chat Interface**: Real-time chat with AI-powered responses and streaming effects.
- **Business Tools**: Modules for business feasibility analysis, demand forecasting, and optimization analysis.
- **Recommendation Engine**: Personalized recommendations and dashboards.
- **Analysis History**: Track and review past analyses.
- **Internationalization (i18n)**: Multi-language support (English, Indonesian).
- **Modern UI**: Built with Tailwind CSS and reusable UI components.

## Project Structure

```
Arina-Gemini/
├── client/           # Frontend React app (Vite, TypeScript)
│   ├── src/
│   │   ├── components/      # UI and feature components
│   │   ├── contexts/        # React context providers
│   │   ├── hooks/           # Custom React hooks
│   │   ├── i18n/            # Internationalization files
│   │   ├── lib/             # Utility libraries (Firebase, Gemini, etc.)
│   │   ├── pages/           # Page components
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # Utility functions
│   └── ...
├── server/           # Backend (Node.js, Express, Drizzle ORM)
│   ├── services/           # Business logic and services
│   └── ...
├── shared/           # Shared code (schemas, engines)
├── package.json      # Project metadata and scripts
└── ...
```

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd Arina-Gemini
   ```
2. **Install dependencies for both client and server:**
   ```bash
   cd client && npm install
   cd ../server && npm install
   ```

### Running the App

#### Development
- **Client:**
  ```bash
  cd client
  npm run dev
  ```
- **Server:**
  ```bash
  cd server
  npm run dev
  ```

#### Production
- Build and serve the client, then start the server as per your deployment setup.

## Technologies Used
- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Backend:** Node.js, Express, Drizzle ORM
- **Database:** (MongoDB or other, as configured)
- **Authentication:** Firebase
- **AI/ML:** Gemini integration

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License
This project is licensed under the MIT License.
