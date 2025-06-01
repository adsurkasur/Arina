# Arina-Gemini

Arina-Gemini is a next-generation web application designed to empower businesses with advanced analysis, forecasting, and personalized recommendations. Built with a modular, scalable architecture, it leverages modern technologies including React (Vite), TypeScript, Tailwind CSS, and a robust Node.js/Express backend. The project is engineered for maintainability, extensibility, and high performance, supporting both rapid prototyping and production-grade deployments.

## Features

- **Authentication & User Management**: Secure authentication (Firebase) with user profile management and session handling.
- **AI-Powered Chat Interface**: Real-time chat with Gemini AI integration, streaming responses, and natural language understanding.
- **Business Analysis Tools**: Modules for feasibility analysis, demand forecasting, and optimization, tailored for business decision-making.
- **Recommendation Engine**: Personalized dashboards and actionable recommendations based on user data and analysis history.
- **Analysis History**: Persistent tracking and review of past analyses for auditability and learning.
- **Internationalization (i18n)**: Multi-language support (English, Indonesian) with easy extensibility for additional locales.
- **Modern UI/UX**: Responsive, accessible, and visually appealing interface using Tailwind CSS and reusable component library.
- **Modular Architecture**: Clear separation of concerns between client, server, and shared code for easy maintenance and scaling.

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
- **Node.js** (v18+ recommended)
- **npm** or **yarn**

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

### Running the Application

#### Development Mode
- **Start the client:**
  ```bash
  cd client
  npm run dev
  ```
- **Start the server:**
  ```bash
  cd server
  npm run dev
  ```

#### Production Mode
1. **Build the client:**
   ```bash
   cd client
   npm run build
   ```
2. **Serve the client and start the server:**
   - Deploy the `client/dist` folder using your preferred static hosting (Vercel, Netlify, etc.)
   - Start the server:
     ```bash
     cd server
     npm run start
     ```
   - Configure environment variables and reverse proxy as needed for your deployment.

## Configuration

- **Environment Variables:**
  - Both `client` and `server` may require environment variables for API keys, database URIs, and third-party integrations. See `.env.example` files in respective folders for details.
- **Database:**
  - The backend uses Drizzle ORM and supports MongoDB (or other, as configured). Ensure your database is running and accessible.
- **Authentication:**
  - Firebase is used for authentication. Set up your Firebase project and update configuration files accordingly.

## Technologies Used

- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Backend:** Node.js, Express, Drizzle ORM
- **Database:** MongoDB (or other, as configured)
- **Authentication:** Firebase
- **AI/ML:** Gemini API integration
- **Testing:** (Add your testing framework, e.g., Jest, React Testing Library)
- **Deployment:** Vercel, Netlify, or custom server

## Production API Routing (Vercel)

- The file `client/vercel.json` rewrites all `/api/*` requests to your backend server in production.
- If you deploy your backend to a new URL or environment, update the `destination` field in `vercel.json` accordingly:

```
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://your-backend-url/api/$1"
    }
  ]
}
```
- No changes are needed in `vite.config.ts` for production API routing. The `server.proxy` setting is only used for local development.

## Contributing

Contributions are welcome! To get started:
1. Fork the repository and create your branch (`git checkout -b feature/your-feature`)
2. Commit your changes (`git commit -am 'Add new feature'`)
3. Push to the branch (`git push origin feature/your-feature`)
4. Open a pull request describing your changes

For major changes, please open an issue first to discuss your proposal.

## License
This project is licensed under the Apache License 2.0. See the [LICENSE](LICENSE) file for details.
