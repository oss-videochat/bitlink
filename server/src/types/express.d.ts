import Room from "../interfaces/Room";

declare global {
    namespace Express {
        export interface Request {
            room?: Room
        }
    }
}
