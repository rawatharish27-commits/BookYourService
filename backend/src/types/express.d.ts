// backend/src/types/express.d.ts
import { User } from '@prisma/client';

declare global {
  namespace Express {
    export interface Request {
      user?: User; // or a more specific decoded JWT payload type
    }
  }
}
