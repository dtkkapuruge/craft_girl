'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
<<<<<<< HEAD
import {
  User,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
=======
import { 
  User, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut,
  onAuthStateChanged
>>>>>>> 24e10e7af165d9d6fee0db4791fe2a2a8a334ab3
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { UserRole } from '@/lib/rbac';
import { hasDashboardAccess } from '@/lib/rbac';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  role: UserRole;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  authModalOpen: boolean;
  setAuthModalOpen: (isOpen: boolean) => void;
  signInWithCredentials: (email: string, password: string) => Promise<boolean>;
<<<<<<< HEAD
  registerWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
=======
>>>>>>> 24e10e7af165d9d6fee0db4791fe2a2a8a334ab3
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  role: 'customer',
  isAdmin: false,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  authModalOpen: false,
  setAuthModalOpen: () => {},
  signInWithCredentials: async () => false,
<<<<<<< HEAD
  registerWithEmail: async () => {},
  signInWithEmail: async () => {},
});

async function resolveUserRole(currentUser: User): Promise<UserRole> {
  try {
    const userRef = doc(db, 'users', currentUser.uid);
    const userDoc = await getDoc(userRef);
    let userRole: UserRole = (userDoc.data()?.role as UserRole) || 'customer';

    if (currentUser.email) {
      const inviteRef = doc(db, 'user_invites', currentUser.email.toLowerCase());
      const inviteDoc = await getDoc(inviteRef);
      if (inviteDoc.exists()) {
        const invitedRole = inviteDoc.data()?.role as UserRole;
        if (invitedRole && invitedRole !== 'customer') {
          userRole = invitedRole;
        }
      }
    }

    if (!userDoc.exists()) {
      await setDoc(userRef, {
        email: currentUser.email,
        displayName: currentUser.displayName,
        photoURL: currentUser.photoURL,
        role: userRole,
        createdAt: new Date().toISOString(),
      });
    } else if (userDoc.data()?.role !== userRole && userRole !== 'customer') {
      await setDoc(userRef, { role: userRole, updatedAt: new Date().toISOString() }, { merge: true });
    }

    return userRole;
  } catch {
    return 'customer';
  }
}

=======
});

>>>>>>> 24e10e7af165d9d6fee0db4791fe2a2a8a334ab3
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole>('customer');
  const [isAdmin, setIsAdmin] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
<<<<<<< HEAD
    // Check for mock admin session first (legacy admin login)
=======
    // Check for mock admin session first
>>>>>>> 24e10e7af165d9d6fee0db4791fe2a2a8a334ab3
    const mockSession = typeof window !== 'undefined' ? localStorage.getItem('mock_admin_session') : null;
    if (mockSession) {
      try {
        const parsed = JSON.parse(mockSession);
        setUser(parsed);
        setRole(parsed.role);
        setIsAdmin(parsed.role === 'admin' || parsed.role === 'super-admin');
        setLoading(false);
        document.cookie = 'admin_session=true; path=/; max-age=86400';
        return;
<<<<<<< HEAD
      } catch {
        localStorage.removeItem('mock_admin_session');
=======
      } catch (e) {
        console.error("Failed to parse mock session:", e);
>>>>>>> 24e10e7af165d9d6fee0db4791fe2a2a8a334ab3
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
<<<<<<< HEAD

      if (currentUser) {
        const userRole = await resolveUserRole(currentUser);
        setRole(userRole);
        const isAdminUser = userRole === 'admin' || userRole === 'super-admin';
        setIsAdmin(isAdminUser);

        if (hasDashboardAccess(userRole)) {
          document.cookie = 'admin_session=true; path=/; max-age=86400';
        } else {
          document.cookie = 'admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
=======
      
      if (currentUser) {
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userRef);
          let userRole: UserRole = (userDoc.data()?.role as UserRole) || 'customer';

          // Apply pre-assigned role from invite if user doc is missing or still customer
          if (currentUser.email) {
            const inviteRef = doc(db, 'user_invites', currentUser.email.toLowerCase());
            const inviteDoc = await getDoc(inviteRef);
            if (inviteDoc.exists()) {
              const invitedRole = inviteDoc.data()?.role as UserRole;
              if (invitedRole && invitedRole !== 'customer') {
                userRole = invitedRole;
              }
            }
          }

          setRole(userRole);

          const isAdminUser = userRole === 'admin' || userRole === 'super-admin';
          setIsAdmin(isAdminUser);

          if (hasDashboardAccess(userRole)) {
            document.cookie = 'admin_session=true; path=/; max-age=86400';
          } else {
            document.cookie = 'admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          }

          if (!userDoc.exists()) {
            await setDoc(userRef, {
              email: currentUser.email,
              displayName: currentUser.displayName,
              photoURL: currentUser.photoURL,
              role: userRole,
              createdAt: new Date().toISOString(),
            });
          } else if (userDoc.data()?.role !== userRole && userRole !== 'customer') {
            await setDoc(userRef, { role: userRole, updatedAt: new Date().toISOString() }, { merge: true });
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          setRole('customer');
          setIsAdmin(false);
          document.cookie = "admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
>>>>>>> 24e10e7af165d9d6fee0db4791fe2a2a8a334ab3
        }
      } else {
        setRole('customer');
        setIsAdmin(false);
<<<<<<< HEAD
        document.cookie = 'admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }

=======
        document.cookie = "admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }
      
>>>>>>> 24e10e7af165d9d6fee0db4791fe2a2a8a334ab3
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
<<<<<<< HEAD
    await signInWithPopup(auth, provider);
    setAuthModalOpen(false);
  };

  const registerWithEmail = async (email: string, password: string, displayName: string) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName });
    // Write user doc
    await setDoc(doc(db, 'users', credential.user.uid), {
      email: credential.user.email,
      displayName,
      photoURL: null,
      role: 'customer',
      createdAt: new Date().toISOString(),
    });
    setAuthModalOpen(false);
  };

  const signInWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
    setAuthModalOpen(false);
  };

  // Legacy mock admin login (kept for admin panel access)
=======
    try {
      await signInWithPopup(auth, provider);
      setAuthModalOpen(false);
    } catch (error) {
      console.error('Error signing in with Google', error);
      throw error;
    }
  };

>>>>>>> 24e10e7af165d9d6fee0db4791fe2a2a8a334ab3
  const signInWithCredentials = async (email: string, password: string): Promise<boolean> => {
    const emailLower = email.trim().toLowerCase();
    let roleToSet: UserRole | null = null;
    let displayName = '';

    if (emailLower === 'superadmin@craft.com' && password === 'super_admin123') {
      roleToSet = 'super-admin';
      displayName = 'Super Admin';
    } else if (emailLower === 'admin@craft.com' && password === 'admin123') {
      roleToSet = 'admin';
      displayName = 'Admin User';
    } else if (emailLower === 'staff@craft.com' && password === 'staff123') {
      roleToSet = 'staff';
      displayName = 'Staff Member';
    }

    if (roleToSet) {
      const mockUser = {
        uid: `mock_${roleToSet}_${Date.now()}`,
        email: emailLower,
        displayName,
        photoURL: null,
<<<<<<< HEAD
      } as unknown as User;
=======
      } as any;
>>>>>>> 24e10e7af165d9d6fee0db4791fe2a2a8a334ab3

      if (typeof window !== 'undefined') {
        localStorage.setItem('mock_admin_session', JSON.stringify({
          ...mockUser,
          role: roleToSet,
        }));
      }

      setUser(mockUser);
      setRole(roleToSet);
      setIsAdmin(roleToSet === 'admin' || roleToSet === 'super-admin');
      document.cookie = 'admin_session=true; path=/; max-age=86400';
      return true;
    }

<<<<<<< HEAD
    // Also try real Firebase admin users (those stored in Firestore with admin roles)
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch {
      return false;
    }
=======
    return false;
>>>>>>> 24e10e7af165d9d6fee0db4791fe2a2a8a334ab3
  };

  const signOut = async () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('mock_admin_session');
      }
<<<<<<< HEAD
      document.cookie = 'admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
=======
      document.cookie = "admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
>>>>>>> 24e10e7af165d9d6fee0db4791fe2a2a8a334ab3
      setUser(null);
      setRole('customer');
      setIsAdmin(false);
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out', error);
    }
  };

  return (
<<<<<<< HEAD
    <AuthContext.Provider value={{
      user,
      loading,
      role,
      isAdmin,
      signInWithGoogle,
      signOut,
      authModalOpen,
      setAuthModalOpen,
      signInWithCredentials,
      registerWithEmail,
      signInWithEmail,
=======
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      role,
      isAdmin, 
      signInWithGoogle, 
      signOut,
      authModalOpen,
      setAuthModalOpen,
      signInWithCredentials
>>>>>>> 24e10e7af165d9d6fee0db4791fe2a2a8a334ab3
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
