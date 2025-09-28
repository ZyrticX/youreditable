import { supabaseClient } from './supabaseClient';

export const SupabaseAuth = {
  signUp: (email, password, options) => supabaseClient.signUp(email, password, options),
  signIn: (email, password) => supabaseClient.signIn(email, password),
  signOut: () => supabaseClient.signOut(),
  getCurrentUser: () => supabaseClient.getCurrentUser(),
  getCurrentSession: () => supabaseClient.getCurrentSession(),
  updateUser: (updates) => supabaseClient.updateUser(updates),
  resetPassword: (email) => supabaseClient.resetPassword(email),
  onAuthStateChange: (callback) => supabaseClient.onAuthStateChange(callback)
};

export const SupabaseDB = {
  from: (table) => supabaseClient.from(table),
  rpc: (functionName, params) => supabaseClient.rpc(functionName, params),
  storage: () => supabaseClient.storage()
};

// Placeholder entities for Base44 compatibility
// These will be replaced with Supabase database operations

class SupabaseEntity {
  constructor(tableName) {
    this.tableName = tableName;
  }

  async filter(conditions, orderBy = null) {
    let query = SupabaseDB.from(this.tableName).select('*');
    
    if (conditions) {
      Object.entries(conditions).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }
    
    if (orderBy) {
      const isDesc = orderBy.startsWith('-');
      const column = isDesc ? orderBy.substring(1) : orderBy;
      query = query.order(column, { ascending: !isDesc });
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async create(data) {
    const { data: result, error } = await SupabaseDB.from(this.tableName)
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return result;
  }

  async bulkCreate(dataArray) {
    const { data: result, error } = await SupabaseDB.from(this.tableName)
      .insert(dataArray)
      .select();
    
    if (error) throw error;
    return result;
  }

  async update(id, data) {
    const { data: result, error } = await SupabaseDB.from(this.tableName)
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return result;
  }

  async delete(id) {
    const { error } = await SupabaseDB.from(this.tableName)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { success: true };
  }

  // Method for updating current user's data
  async updateMyUserData(data) {
    // Get current user
    const { session } = await SupabaseAuth.getCurrentSession();
    if (!session?.user) {
      throw new Error('No authenticated user found');
    }

    // Update user profile in profiles table
    const { data: result, error } = await SupabaseDB.from(this.tableName)
      .update(data)
      .eq('id', session.user.id)
      .select()
      .single();
    
    if (error) throw error;
    return result;
  }
}

// Create entity instances
export const Project = new SupabaseEntity('projects');
export const Video = new SupabaseEntity('videos');
export const VideoVersion = new SupabaseEntity('video_versions');
export const Note = new SupabaseEntity('notes');
export const Approval = new SupabaseEntity('approvals');
export const Notification = new SupabaseEntity('notifications');
export const User = new SupabaseEntity('profiles');

// Alias for compatibility
export const UserEntity = User;