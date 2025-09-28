import { useState, useEffect } from 'react';
import { SupabaseAuth, SupabaseDB } from '@/api/entities';

export const useSupabaseAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getSession = async () => {
      try {
        const { session, error } = await SupabaseAuth.getCurrentSession();
        if (error) throw error;
        setUser(session?.user || null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = SupabaseAuth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
        setLoading(false);
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  const signUp = async (email, password, options = {}) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await SupabaseAuth.signUp(email, password, options);
      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      setError(err.message);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await SupabaseAuth.signIn(email, password);
      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      setError(err.message);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await SupabaseAuth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (err) {
      setError(err.message);
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    signUp,
    signIn,
    signOut
  };
};

export const useSupabaseQuery = (table, query = null, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let queryBuilder = SupabaseDB.from(table);
        
        if (query) {
          queryBuilder = query(queryBuilder);
        }
        
        const { data: result, error } = await queryBuilder;
        if (error) throw error;
        
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [table, ...dependencies]);

  const refetch = async () => {
    setLoading(true);
    setError(null);
    try {
      let queryBuilder = SupabaseDB.from(table);
      
      if (query) {
        queryBuilder = query(queryBuilder);
      }
      
      const { data: result, error } = await queryBuilder;
      if (error) throw error;
      
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
};

export const useSupabaseRealtime = (table, filter = null) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let subscription;

    const setupRealtime = async () => {
      try {
        let query = SupabaseDB.from(table);
        if (filter) {
          query = filter(query);
        }
        const { data: initialData, error } = await query;
        if (error) throw error;
        setData(initialData || []);

        const { supabase } = await import('../lib/supabase');
        subscription = supabase
          .channel(`${table}_changes`)
          .on('postgres_changes', 
            { event: '*', schema: 'public', table }, 
            (payload) => {
              console.log('Realtime update:', payload);
              
              switch (payload.eventType) {
                case 'INSERT':
                  setData(prev => [...prev, payload.new]);
                  break;
                case 'UPDATE':
                  setData(prev => prev.map(item => 
                    item.id === payload.new.id ? payload.new : item
                  ));
                  break;
                case 'DELETE':
                  setData(prev => prev.filter(item => item.id !== payload.old.id));
                  break;
                default:
                  break;
              }
            }
          )
          .subscribe();

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    setupRealtime();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [table, filter]);

  return { data, loading, error };
};

// Specific hooks for your app's entities
export const useProjects = (userId) => {
  return useSupabaseQuery('projects', (query) => 
    query
      .select('*, videos(count)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    [userId]
  );
};

export const useProjectDetails = (projectId) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const { data: result, error } = await SupabaseDB.rpc('get_project_details', {
          project_uuid: projectId
        });
        
        if (error) throw error;
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProjectDetails();
    }
  }, [projectId]);

  return { data, loading, error };
};

export const useVideoDetails = (videoId) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVideoDetails = async () => {
      try {
        const { data: result, error } = await SupabaseDB.rpc('get_video_details', {
          video_uuid: videoId
        });
        
        if (error) throw error;
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (videoId) {
      fetchVideoDetails();
    }
  }, [videoId]);

  return { data, loading, error };
};

export const useNotifications = (userId) => {
  return useSupabaseRealtime('notifications', (query) =>
    query
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
  );
};

export const useProjectsByShareToken = (shareToken) => {
  return useSupabaseQuery('projects', (query) =>
    query
      .select(`
        *,
        videos (
          *,
          video_versions!current_version_id (*)
        )
      `)
      .eq('share_token', shareToken)
      .gt('share_expires_at', new Date().toISOString()),
    [shareToken]
  );
};
