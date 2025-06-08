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

### Local Development (Quick Start)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/adsurkasur/Arina.git
   cd Arina
   ```
2. **Prepare your environment variables:**
   - Create a `.env` file in the project root with the following variables (replace the values with your own):
     
     ```env
     # Firebase (Client)
     VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
     VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
     VITE_FIREBASE_API_KEY=your_firebase_api_key
     VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
     VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
     VITE_FIREBASE_APP_ID=your_firebase_app_id
     VITE_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
     
     # Gemini & Google APIs (Client)
     VITE_GEMINI_API_KEY=your_gemini_api_key
     VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
     VITE_GOOGLE_WEATHER_API_KEY=your_google_weather_api_key
     
     # reCAPTCHA (Client & Server)
     RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key
     VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
     
     # Database (Server)
     MONGO_URI=your_mongodb_uri
     
     # API URLs
     VITE_API_URL=your_api_url
     
     # Ports
     PORT=8080
     BACKEND_PORT=8080
     ```

3. **Start the application:**
   ```bash
   npm run dev
   ```
   This command will automatically install dependencies, copy environment variables, and start both the client and server for local development.

> **Note:**
> - The `.env` file in the project root will be copied to both `client` and `server` automatically.

## Production Build

1. **Build both client and server:**
   ```bash
   npm run build
   ```
2. **Start the server (serves API and production client):**
   ```bash
   npm start
   ```
   - The server will run from `server/dist/index.js`.
   - Deploy the `client/dist` folder to your preferred static hosting if needed.

## Additional Scripts
- **Check TypeScript:**
  ```bash
  npm run check
  ```
- **Push database migrations (Drizzle ORM):**
  ```bash
  npm run db:push
  ```

## Environment Variables
- Place a `.env` file in the project root. It will be copied to both `client` and `server` automatically.
- The required variables are:
  
  ```env
  # Firebase (Client)
  VITE_FIREBASE_STORAGE_BUCKET
  VITE_FIREBASE_AUTH_DOMAIN
  VITE_FIREBASE_API_KEY
  VITE_FIREBASE_PROJECT_ID
  VITE_FIREBASE_MESSAGING_SENDER_ID
  VITE_FIREBASE_APP_ID
  VITE_FIREBASE_MEASUREMENT_ID
  
  # Gemini & Google APIs (Client)
  VITE_GEMINI_API_KEY
  VITE_GOOGLE_MAPS_API_KEY
  VITE_GOOGLE_WEATHER_API_KEY
  
  # reCAPTCHA (Client & Server)
  RECAPTCHA_SECRET_KEY
  VITE_RECAPTCHA_SITE_KEY
  
  # Database (Server)
  MONGO_URI
  
  # API URLs
  VITE_API_URL
  
  # Ports
  PORT
  BACKEND_PORT
  ```

## Database
- The backend uses Drizzle ORM. Ensure your database is running and accessible.

## Authentication
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
