
import { IAuthService } from "@/application/ports/IAuthService";

export class SendPasswordResetEmail {
  constructor(private authService: IAuthService) {}

  async execute(email: string): Promise<{ error?: string }> {
    return this.authService.sendPasswordResetEmail(email);
  }
}
