import type { Timestamp } from "firebase/firestore";
import type { Role, Permission } from "@/features/auth/types/permissions";

export interface PrivateProfile {
  uid: string;
  email: string | null;
  authProvider: string;

  emailVerified: boolean;
  phoneNumber?: string;
  dateOfBirth?: Date;

  roles: Role[];
  permissions: Permission[];

  profileComplete: boolean;
  accountStatus: "active" | "suspended" | "deleted";
  suspensionReason?: string;

  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  lastLoginAt: Timestamp | Date;
  lastPasswordChange?: Timestamp | Date;

  stripeCustomerId?: string;
  stripeConnectId?: string;
  stripeConnectStatus?: StripeConnectStatusSnapshot;

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
