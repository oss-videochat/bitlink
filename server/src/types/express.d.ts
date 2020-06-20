import Room from "../models/Room";

declare global {
    namespace Express {
        export interface Request {
            room?: Room
        }
    }
}
