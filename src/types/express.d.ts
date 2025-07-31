declare namespace Express {
  export interface Request {
    userId?: number;
    subscriptionExpiring?: Date | null;
  }
}