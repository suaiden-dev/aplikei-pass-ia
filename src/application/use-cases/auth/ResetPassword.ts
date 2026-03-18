
import { IAuthService } from "@/application/ports/IAuthService";

export class ResetPassword {
  constructor(private authService: IAuthService) {}

  async execute(newPassword: string): Promise<{ error?: string }> {
    return this.authService.resetPassword(newPassword);
  }
}
