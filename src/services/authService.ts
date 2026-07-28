import { UserProfile } from '../types';
import { storage } from './storageService';

export interface RoommateInvite {
  email: string;
  name: string;
  inviteCode: string;
  createdAt: string;
  status: 'invited' | 'accepted';
}

class AuthService {
  // Stored password mapping for local/demo authentication
  private getStoredPasswords(): Record<string, string> {
    try {
      const data = localStorage.getItem('bm_user_passwords');
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  private setStoredPasswords(passwords: Record<string, string>): void {
    try {
      localStorage.setItem('bm_user_passwords', JSON.stringify(passwords));
    } catch (e) {
      console.error("Failed to store user password", e);
    }
  }

  /**
   * Authenticates a roommate before switching view or logging in.
   * Accepts password 'password123' or 'demo123' as universal initial password,
   * or user's custom saved password.
   */
  public async authenticateRoommate(email: string, password: string, targetUserId: string): Promise<{ success: boolean; error?: string }> {
    const users = storage.getUsers();
    const user = users.find(u => u.id === targetUserId || u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return { success: false, error: 'Roommate account not found.' };
    }

    const passwords = this.getStoredPasswords();
    const savedPassword = passwords[user.id];

    // Standard valid passwords for initial seed & demo mode
    const isValid = (savedPassword && password === savedPassword) ||
                    password === 'password123' ||
                    password === 'demo123' ||
                    password === '123456';

    if (isValid) {
      // Save updated password if custom
      if (!savedPassword) {
        passwords[user.id] = password;
        this.setStoredPasswords(passwords);
      }
      return { success: true };
    }

    return { success: false, error: 'Incorrect email or password. Access denied.' };
  }

  /**
   * Invites and creates a new roommate account in current household.
   */
  public async inviteRoommate(name: string, email: string): Promise<UserProfile> {
    const users = storage.getUsers();
    const household = storage.getHousehold();

    // Check if email already exists
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (existing) {
      throw new Error(`Roommate with email "${email}" is already part of this household.`);
    }

    const newId = `user-${Date.now()}`;
    const colors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#3b82f6'];
    const assignedColor = colors[users.length % colors.length];

    const newUser: UserProfile = {
      id: newId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      avatarUrl: `https://images.unsplash.com/photo-${1534528741775 + users.length * 1000}?w=150&auto=format&fit=crop&q=80`,
      householdId: household.id,
      role: 'member',
      color: assignedColor
    };

    // Save to storage
    const updatedUsers = [...users, newUser];
    localStorage.setItem('bm_users', JSON.stringify(updatedUsers));

    // Save default password
    const passwords = this.getStoredPasswords();
    passwords[newId] = 'password123';
    this.setStoredPasswords(passwords);

    // Notify listeners
    storage.notify();

    return newUser;
  }
}

export const authService = new AuthService();
