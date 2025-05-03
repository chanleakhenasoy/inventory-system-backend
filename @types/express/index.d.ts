import { RoleEnum } from './../../src/utils/enum';
declare global {
    namespace Express {
      interface Request {
        user?: {
          id: string;
          role: RoleEnum; // Use your RoleEnum type
        };
      }
    }
  }