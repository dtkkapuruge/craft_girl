import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { UserRole } from '@/lib/rbac';

export interface AdminUser {
  id: string;
  email: string;
  displayName?: string;
  phoneNumber?: string;
  status?: 'active' | 'inactive';
  role: UserRole;
  createdAt?: string;
}

const STAFF_ROLES: UserRole[] = ['staff', 'admin', 'super-admin'];

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  try {
    const snapshot = await getDocs(collection(db, 'users'));
    const users: AdminUser[] = [];
    snapshot.forEach((d) => {
      const data = d.data();
      const role = (data.role as UserRole) ?? 'customer';
      if (STAFF_ROLES.includes(role)) {
        users.push({
          id: d.id,
          email: data.email ?? '',
          displayName: data.displayName ?? data.fullName ?? '',
          phoneNumber: data.phoneNumber ?? '',
          status: data.status ?? 'active',
          role,
          createdAt: data.createdAt,
        });
      }
    });
    return users.sort((a, b) => a.email.localeCompare(b.email));
  } catch {
    return [];
  }
}

/** Pre-register a user by email — role applied when they sign in */
export async function inviteUserByEmail(
  email: string,
  role: UserRole
): Promise<void> {
  const normalized = email.trim().toLowerCase();
  await setDoc(doc(db, 'user_invites', normalized), {
    email: normalized,
    role,
    createdAt: Timestamp.now(),
  });
}

export async function createAdminUser(
  email: string,
  role: UserRole,
  displayName: string,
  phoneNumber: string,
  status: 'active' | 'inactive',
  tempPassword?: string
): Promise<void> {
  const normalized = email.trim().toLowerCase();
  // Check if user already exists in DB
  const existing = await findUserByEmail(normalized);
  if (existing) {
    await updateDoc(doc(db, 'users', existing.id), {
      role,
      displayName,
      phoneNumber,
      status,
      tempPassword: tempPassword || null,
      updatedAt: Timestamp.now()
    });
  } else {
    const id = `user_${Date.now()}`;
    await setDoc(doc(db, 'users', id), {
      email: normalized,
      role,
      displayName,
      phoneNumber,
      status,
      tempPassword: tempPassword || null,
      createdAt: new Date().toISOString(),
    });
  }
  
  // Register corresponding invite
  await inviteUserByEmail(normalized, role);
}

export async function updateAdminUser(
  userId: string,
  data: {
    role: UserRole;
    displayName: string;
    phoneNumber: string;
    status: 'active' | 'inactive';
    tempPassword?: string;
  }
): Promise<void> {
  const payload: Record<string, any> = {
    role: data.role,
    displayName: data.displayName,
    phoneNumber: data.phoneNumber,
    status: data.status,
    updatedAt: Timestamp.now()
  };
  
  if (data.tempPassword) {
    payload.tempPassword = data.tempPassword;
  }

  await updateDoc(doc(db, 'users', userId), {
    ...payload
  });
}

export async function updateUserRole(
  userId: string,
  role: UserRole
): Promise<void> {
  await updateDoc(doc(db, 'users', userId), { role, updatedAt: Timestamp.now() });
}

export async function removeAdminUser(userId: string): Promise<void> {
  await updateDoc(doc(db, 'users', userId), {
    role: 'customer',
    status: 'inactive',
    updatedAt: Timestamp.now(),
  });
}

export async function findUserByEmail(email: string): Promise<AdminUser | null> {
  const normalized = email.trim().toLowerCase();
  const q = query(collection(db, 'users'), where('email', '==', normalized));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const d = snapshot.docs[0];
  const data = d.data();
  return {
    id: d.id,
    email: data.email,
    displayName: data.displayName ?? data.fullName ?? '',
    phoneNumber: data.phoneNumber ?? '',
    status: data.status ?? 'active',
    role: data.role,
    createdAt: data.createdAt,
  };
}
