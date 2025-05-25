export interface UserData {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    roles?: string[];
    username?: string;
    createdAt?: Date;
    lastLogin?: Date;
} 