import { IProfileRepository } from "@/application/ports/IProfileRepository";
import { UserProfile } from "@/domain/user/UserEntities";

export class GetUserProfile {
  constructor(private profileRepository: IProfileRepository) {}

  async execute(userId: string): Promise<UserProfile | null> {
    return await this.profileRepository.findById(userId);
  }
}
