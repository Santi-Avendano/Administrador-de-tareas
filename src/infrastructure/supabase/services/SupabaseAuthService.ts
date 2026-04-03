import type { SupabaseClient } from '@supabase/supabase-js';
import type { IAuthService, AuthResult } from '../../../domain/services/IAuthService';

export class SupabaseAuthService implements IAuthService {
  constructor(private readonly client: SupabaseClient) {}

  async signUp(email: string, password: string): Promise<AuthResult> {
    const { error } = await this.client.auth.signUp({ email, password });
    if (error) return { success: false, error: error.message };
    return { success: true };
  }

  async signIn(email: string, password: string): Promise<AuthResult> {
    const { error } = await this.client.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };
    return { success: true };
  }

  async signOut(): Promise<void> {
    await this.client.auth.signOut();
  }
}
