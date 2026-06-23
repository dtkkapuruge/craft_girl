'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { UserRole, RolePermission } from '@/lib/rbac';
import { hasDashboardAccess, fetchRolePermissions } from '@/lib/rbac';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  role: UserRole;
  isAdmin: boolean;
  permissions: RolePermission | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  authModalOpen: boolean;
  setAuthModalOpen: (isOpen: boolean) => void;
  signInWithCredentials: (email: string, password: string) => Promise<boolean>;
  registerWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  role: 'customer',
  isAdmin: false,
  permissions: null,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  authModalOpen: false,
  setAuthModalOpen: () => {},
  signInWithCredentials: async () => false,
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

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole>('customer');
  const [isAdmin, setIsAdmin] = useState(false);
  const [permissions, setPermissions] = useState<RolePermission | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    // Check for mock admin session first (legacy admin login)
    const mockSession = typeof window !== 'undefined' ? localStorage.getItem('mock_admin_session') : null;
    if (mockSession) {
      try {
        const parsed = JSON.parse(mockSession);
        setUser(parsed);
        setRole(parsed.role);
        setIsAdmin(parsed.role === 'admin' || parsed.role === 'super-admin');
        
        // Fetch dynamic permissions for mock session
        fetchRolePermissions(parsed.role).then((perms) => {
          setPermissions(perms);
          setLoading(false);
        }).catch((err) => {
          console.error(err);
          setLoading(false);
        });

        document.cookie = 'admin_session=true; path=/; max-age=86400';
        return;
      } catch {
        localStorage.removeItem('mock_admin_session');
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const userRole = await resolveUserRole(currentUser);
        setRole(userRole);
        const isAdminUser = userRole === 'admin' || userRole === 'super-admin';
        setIsAdmin(isAdminUser);

        // Fetch dynamic permissions
        const fetchedPerms = await fetchRolePermissions(userRole);
        setPermissions(fetchedPerms);

        if (hasDashboardAccess(userRole, fetchedPerms)) {
          document.cookie = 'admin_session=true; path=/; max-age=86400';
        } else {
          document.cookie = 'admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
      } else {
        setRole('customer');
        setIsAdmin(false);
        setPermissions(null);
        document.cookie = 'admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
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
      } as unknown as User;

      if (typeof window !== 'undefined') {
        localStorage.setItem('mock_admin_session', JSON.stringify({
          ...mockUser,
          role: roleToSet,
        }));
      }

      try {
        const fetchedPerms = await fetchRolePermissions(roleToSet);
        setPermissions(fetchedPerms);
      } catch (err) {
        console.error(err);
      }

      setUser(mockUser);
      setRole(roleToSet);
      setIsAdmin(roleToSet === 'admin' || roleToSet === 'super-admin');
      document.cookie = 'admin_session=true; path=/; max-age=86400';
      return true;
    }

    // Also try real Firebase admin users (those stored in Firestore with admin roles)
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch {
      return false;
    }
  };

  const signOut = async () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('mock_admin_session');
      }
      document.cookie = 'admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      setUser(null);
      setRole('customer');
      setIsAdmin(false);
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      role,
      isAdmin,
      permissions,
      signInWithGoogle,
      signOut,
      authModalOpen,
      setAuthModalOpen,
      signInWithCredentials,
      registerWithEmail,
      signInWithEmail,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
