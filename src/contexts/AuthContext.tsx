import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { User, Profile } from '../types';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: {
    full_name: string;
    phone: string;
    user_type: 'patient' | 'doctor';
  }) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', supabaseUser.id)
      .maybeSingle();

    if (profile) {
      let userData: User = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        user_type: profile.user_type,
        profile,
      };

      if (profile.user_type === 'doctor') {
        const { data: doctor } = await supabase
          .from('doctors')
          .select('*, specializations(*)')
          .eq('id', supabaseUser.id)
          .maybeSingle();

        if (doctor) {
          userData.doctor = doctor;
        }
      } else if (profile.user_type === 'patient') {
        const { data: patient } = await supabase
          .from('patients')
          .select('*')
          .eq('id', supabaseUser.id)
          .maybeSingle();

        if (patient) {
          userData.patient = patient;
        }
      }

      setUser(userData);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      (async () => {
        if (session?.user) {
          await loadUserProfile(session.user);
        }
        setLoading(false);
      })();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        if (session?.user) {
          await loadUserProfile(session.user);
        } else {
          setUser(null);
        }
        setLoading(false);
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (
    email: string,
    password: string,
    userData: { full_name: string; phone: string; user_type: 'patient' | 'doctor' }
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      if (!data.user) throw new Error('No user returned from signup');

      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        email,
        full_name: userData.full_name,
        phone: userData.phone,
        user_type: userData.user_type,
      });

      if (profileError) throw profileError;

      if (userData.user_type === 'doctor') {
        const { error: doctorError } = await supabase.from('doctors').insert({
          id: data.user.id,
        });
        if (doctorError) throw doctorError;
      } else {
        const { error: patientError } = await supabase.from('patients').insert({
          id: data.user.id,
        });
        if (patientError) throw patientError;
      }

      await loadUserProfile(data.user);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (data.user) {
        await loadUserProfile(data.user);
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const refreshUser = async () => {
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();
    if (supabaseUser) {
      await loadUserProfile(supabaseUser);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
