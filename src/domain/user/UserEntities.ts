export interface UserProfile {
  id: string;
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
  email?: string;
}

export interface UserProcess {
  id: string;
  userId: string;
  serviceSlug: string;
  status: string;
  currentStep?: number;
  createdAt: string;
  applicationId?: string;
  dateOfBirth?: string;
  grandmotherName?: string;
  isSecondAttempt?: boolean;
  consularLogin?: string;
}
