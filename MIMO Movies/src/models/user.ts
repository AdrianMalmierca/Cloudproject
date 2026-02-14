import { User, UserAttributes } from "../db";

export const UserModel = {
  get model(): typeof User {
    return User;
  },

  async findByApiKey(apiKey: string): Promise<User | null> {
    return this.model.findOne({
      where: { apiKey },
    });
  },

  async findById(id: number): Promise<User | null> {
    return this.model.findByPk(id);
  },

  async findByUsername(username: string): Promise<User | null> {
    return this.model.findOne({
      where: { username },
    });
  },

  async create(user: UserAttributes): Promise<User> {
    return this.model.create(user);
  },
};

