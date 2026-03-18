import { UserProfile } from "@/domain/user/UserEntities";

export interface IProfileRepository {
  findById(id: string): Promise<UserProfile | null>;
  save(profile: UserProfile): Promise<void>;
}
