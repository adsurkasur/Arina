import 'express-session';
import { SessionData } from 'express-session';

declare module 'express-session' {
  interface SessionData {
    user?: {
      id: string;
      email?: string;
      name?: string;
      // Add other user properties as needed
    };
  }
}

declare module 'express-serve-static-core' {
  interface Request {
    session: SessionData;
  }
}
