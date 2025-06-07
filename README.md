# Arina

Arina is a next-generation web application designed to empower businesses with advanced analysis, forecasting, and personalized recommendations. Built with a modular, scalable architecture, it leverages modern technologies including React (Vite), TypeScript, Tailwind CSS, and a robust Node.js/Express backend. The project is engineered for maintainability, extensibility, and high performance, supporting both rapid prototyping and production-grade deployments.

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
Arina/
├── client/           # Frontend React app (Vite, TypeScript)
├── server/           # Backend code (schemas, engines, services)
├── package.json      # Project metadata and scripts (monorepo root)
└── ...
```

## Getting Started

### Prerequisites
- **Node.js** (v18+ recommended)
- **npm** (v9+ recommended)

### Installation (Monorepo)

1. **Clone the repository:**
   ```powershell
   git clone <repo-url>
   cd Arina-Gemini
   ```
2. **Install all dependencies (client & server):**
   ```powershell
   npm run install-all
   ```
   This will install dependencies in both `client` and `server` workspaces.

3. **Copy environment variables:**
   - Place your `.env` file in the project root.
   - To copy `.env` to both `client` and `server`, run:
     ```powershell
     npm run copy-env
     ```
   - This will automatically copy `.env` to the appropriate folders using cross-platform scripts.

### Running the Application

#### Development Mode (Full Stack)
- **Start both client and server concurrently:**
  ```powershell
  npm run dev
  ```
  - This will:
    - Ensure `.env` files are copied
    - Start the backend (`server`) and wait for it to be ready
    - Start the frontend (`client`) after the backend is up

#### Production Mode
1. **Build both client and server:**
   ```powershell
   npm run build
   ```
2. **Start the server (serves API and production client):**
   ```powershell
   npm start
   ```
   - The server will run from `server/dist/index.js`.
   - Deploy the `client/dist` folder to your preferred static hosting if needed.

### Additional Scripts
- **Check TypeScript:**
  ```powershell
  npm run check
  ```
- **Push database migrations (Drizzle ORM):**
  ```powershell
  npm run db:push
  ```

### Environment Variables
- Place a `.env` file in the project root. It will be copied to both `client` and `server` automatically.
- See `.env.example` in each folder for required variables.

### Database
- The backend uses Drizzle ORM. Ensure your database is running and accessible.

### Authentication
- Firebase is used for authentication. Set up your Firebase project and update configuration files accordingly.

## Technologies Used

- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Backend:** Node.js, Express, Drizzle ORM
- **Database:** MongoDB
- **Authentication:** Firebase
- **AI/ML:** Gemini API integration
- **Deployment:** Vercel and Railway (or other)

## Contributing

Contributions are welcome! To get started:
1. Fork the repository and create your branch (`git checkout -b feature/your-feature`)
2. Commit your changes (`git commit -am 'Add new feature'`)
3. Push to the branch (`git push origin feature/your-feature`)
4. Open a pull request describing your changes

For major changes, please open an issue first to discuss your proposal.

## License
This project is licensed under the Apache License 2.0. See the [LICENSE](LICENSE) file for details.
