import type { User as FirebaseUser } from "firebase/auth";
import type { Timestamp } from "firebase/firestore";

export type CurrentUser = FirebaseUser;

export type Role = "user" | "artist" | "moderator" | "admin" | "superadmin";

export type Permission =
  | "read:models"
  | "write:models"
  | "moderate:forum"
  | "manage:users"
  | "manage:billing"
  | "manage:content";

export interface PrivateProfile {
  /* Identity */
  uid: string;
  email: string | null;
  authProvider: string;

  /* Authentication metadata */
  emailVerified: boolean;
  phoneNumber?: string;
  dateOfBirth?: Date;

  /* Access control */
  roles: Role[];
  permissions: Permission[];

  /* Account status */
  profileComplete: boolean;
  accountStatus: "active" | "suspended" | "deleted";
  suspensionReason?: string;

  /* Timestamps */
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  lastLoginAt: Timestamp | Date;
  lastPasswordChange?: Timestamp | Date;

  /* Stripe identifiers */
  stripeCustomerId?: string; // buyer side
  stripeConnectId?: string; // seller side
  stripeConnectStatus?: StripeConnectStatusSnapshot; // cached snapshot for quick checks

  /* Internal tracking */
  loginCount: number;
}

export interface StripeConnectStatusSnapshot {
  accountId: string | null;
  isEnabledForCharges: boolean;
  detailsSubmitted: boolean;
  requirementsDue: string[];
  isFullyActive: boolean;
  createdAt?: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export interface UserSettings {
  /* Notifications */
  notifications: {
    email: boolean;
    push: boolean;
    marketing: boolean;
    newFollowers: boolean;
    newLikes: boolean;
    newComments: boolean;
    modelUpdates: boolean;
  };

  /* Appearance */
  theme: "light" | "dark" | "auto";
  language: string;
  timezone: string;

  /* Privacy */
  privacy: {
    profileVisibility: "public" | "private" | "friends";
    showEmail: boolean;
    showLocation: boolean;
    showLastActive: boolean;
    allowMessages: "everyone" | "followers" | "none";
  };

  /* Security */
  security: {
    twoFactorEnabled: boolean;
    sessionTimeout: number; // minutes
    loginNotifications: boolean;
  };

  /* Artist settings */
  artistSettings?: {
    autoApproveComments: boolean;
    commissionEnabled: boolean;
    portfolioVisibility: "public" | "private";
  };
}

export interface ArtistPrivateProfile {
  stripeConnectId?: string;

  taxSettings?: {
    taxRatePercent?: number;
    country?: string;
    region?: string;
  };
  payoutSettings?: {
    defaultCurrency: string; // e.g., "USD"
    automaticPayouts: boolean;
  };

  /* Private commission configuration */
  commissionRates?: {
    small: number;
    medium: number;
    large: number;
  };

  /* Compliance */
  kyc: {
    status: "pending" | "verified" | "restricted";
    lastReviewAt?: Timestamp | Date;
  };

  /* Optional extras */
  portfolio?: {
    featuredWorks: string[];
  };
  notes?: string;

  /* Timestamps */
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export interface PrivateUploadDoc {
  modelId: string;
  addedAt: Timestamp | Date;
}

export interface PrivatePurchaseDoc {
  modelId: string;
  purchasedAt: Timestamp | Date;
  pricePaidCents: number;
  currency: string;
}
