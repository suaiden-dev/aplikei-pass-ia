
import { IAuthService, AuthResponse } from "@/application/ports/IAuthService";

export class LoginUser {
  constructor(private authService: IAuthService) {}

  async execute(email: string, password: string): Promise<AuthResponse> {
    return this.authService.login(email, password);
  }
}
