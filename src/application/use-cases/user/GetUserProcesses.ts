import { IUserProcessRepository } from "@/application/ports/IUserProcessRepository";
import { UserProcess } from "@/domain/user/UserEntities";

export class GetUserProcesses {
  constructor(private userProcessRepository: IUserProcessRepository) {}

  async execute(userId: string): Promise<UserProcess[]> {
    return await this.userProcessRepository.findByUserId(userId);
  }
}
