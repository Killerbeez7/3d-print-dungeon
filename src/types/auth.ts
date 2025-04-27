export interface UserData {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    role?: string;
    username?: string;
    createdAt?: Date;
    lastLogin?: Date;
} 