import { authService } from "@features/auth/lib/auth";
import { storageService } from "@features/auth/services/storage";

export async function updateProfile(params: {
  userId: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  currentEmail: string;
}): Promise<{ emailChanged: boolean }> {
  await authService.updateAccount(params.userId, {
    full_name: params.fullName,
    phone_number: params.phoneNumber,
  });

  const emailChanged = params.email !== params.currentEmail;
  if (emailChanged) {
    await authService.updateEmail(params.email);
  }

  return { emailChanged };
}

export async function uploadProfilePhoto(userId: string, file: File): Promise<string> {
  const url = await storageService.uploadProfilePhoto(userId, file);
  await authService.updateAccount(userId, { avatar_url: url });
  return url;
}
