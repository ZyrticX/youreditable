import { supabase } from '../lib/supabase'

export class SupabaseClient {
  constructor() {
    this.supabase = supabase
  }

  async signUp(email, password, options = {}) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: options.metadata || {}
      }
    })
    return { data, error }
  }

  async signIn(email, password) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut()
    return { error }
  }

  async getCurrentUser() {
    const { data: { user }, error } = await this.supabase.auth.getUser()
    return { user, error }
  }

  async getCurrentSession() {
    const { data: { session }, error } = await this.supabase.auth.getSession()
    return { session, error }
  }

  async updateUser(updates) {
    const { data, error } = await this.supabase.auth.updateUser(updates)
    return { data, error }
  }

  async resetPassword(email) {
    const { data, error } = await this.supabase.auth.resetPasswordForEmail(email)
    return { data, error }
  }

  onAuthStateChange(callback) {
    return this.supabase.auth.onAuthStateChange(callback)
  }

  async from(table) {
    return this.supabase.from(table)
  }

  async storage() {
    return this.supabase.storage
  }

  async rpc(functionName, params = {}) {
    const { data, error } = await this.supabase.rpc(functionName, params)
    return { data, error }
  }

}

export const supabaseClient = new SupabaseClient()
export default supabaseClient
