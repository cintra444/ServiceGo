import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "@servicego/token";
const EMAIL_KEY = "@servicego/email";
const ROLE_KEY = "@servicego/role";
const USER_ID_KEY = "@servicego/user_id";

export interface StoredSession {
  token: string;
  email: string;
  role: string;
  userId?: number;
}

export const sessionStorage = {
  async saveSession(token: string, email: string, role: string, userId?: number) {
    const pairs: [string, string][] = [
      [TOKEN_KEY, token],
      [EMAIL_KEY, email],
      [ROLE_KEY, role],
    ];
    if (userId !== undefined) {
      pairs.push([USER_ID_KEY, String(userId)]);
    }
    await AsyncStorage.multiSet(pairs);
    if (userId === undefined) {
      await AsyncStorage.removeItem(USER_ID_KEY);
    }
  },
  async clearSession() {
    await AsyncStorage.multiRemove([TOKEN_KEY, EMAIL_KEY, ROLE_KEY, USER_ID_KEY]);
  },
  async getSession(): Promise<StoredSession | null> {
    const pairs = await AsyncStorage.multiGet([TOKEN_KEY, EMAIL_KEY, ROLE_KEY, USER_ID_KEY]);
    const values = Object.fromEntries(pairs);
    const token = values[TOKEN_KEY];
    const email = values[EMAIL_KEY];
    const role = values[ROLE_KEY];
    const userIdRaw = values[USER_ID_KEY];
    if (!token || !email || !role) {
      return null;
    }
    const parsedUserId = userIdRaw ? Number(userIdRaw) : undefined;
    const userId = Number.isInteger(parsedUserId) && parsedUserId > 0 ? parsedUserId : undefined;
    return { token, email, role, userId };
  },
};
