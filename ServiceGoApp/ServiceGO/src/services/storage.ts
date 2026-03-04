import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "@servicego/token";
const EMAIL_KEY = "@servicego/email";
const ROLE_KEY = "@servicego/role";

export interface StoredSession {
  token: string;
  email: string;
  role: string;
}

export const sessionStorage = {
  async saveSession(token: string, email: string, role: string) {
    await AsyncStorage.setMany({
      [TOKEN_KEY]: token,
      [EMAIL_KEY]: email,
      [ROLE_KEY]: role,
    });
  },
  async clearSession() {
    await AsyncStorage.removeMany([TOKEN_KEY, EMAIL_KEY, ROLE_KEY]);
  },
  async getSession(): Promise<StoredSession | null> {
    const values = await AsyncStorage.getMany([TOKEN_KEY, EMAIL_KEY, ROLE_KEY]);
    const token = values[TOKEN_KEY];
    const email = values[EMAIL_KEY];
    const role = values[ROLE_KEY];
    if (!token || !email || !role) {
      return null;
    }
    return { token, email, role };
  },
};
