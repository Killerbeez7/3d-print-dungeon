export interface User {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    isAdmin?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    bio?: string;
    website?: string;
    location?: string;
    socialLinks?: {
        twitter?: string;
        facebook?: string;
        instagram?: string;
        github?: string;
    };
} 