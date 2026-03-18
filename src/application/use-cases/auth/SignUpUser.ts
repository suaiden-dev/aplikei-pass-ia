
import { IAuthService, AuthResponse, SignupRequest } from "@/application/ports/IAuthService";

export class SignUpUser {
  constructor(private authService: IAuthService) {}

  async execute(request: SignupRequest): Promise<AuthResponse> {
    return this.authService.signup(request);
  }
}
