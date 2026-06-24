import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
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
  address?: string;
  photoURL?: string;
}

const STAFF_ROLES: UserRole[] = ['staff', 'admin', 'super-admin'];

// --- ADMIN USER FUNCTIONS ---

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

export async function createAdminUser(
  email: string,
  role: UserRole,
  displayName: string,
  phoneNumber: string,
  status: 'active' | 'inactive',
  tempPassword?: string
): Promise<void> {
  const normalized = email.trim().toLowerCase();
  const existing = await findUserByEmail(normalized);

  if (existing) {
    await updateDoc(doc(db, 'users', existing.id), {
      role, displayName, phoneNumber, status,
      tempPassword: tempPassword || null,
      updatedAt: Timestamp.now()
    });
  } else {
    const id = `user_${Date.now()}`;
    await setDoc(doc(db, 'users', id), {
      email: normalized,
      role, displayName, phoneNumber, status,
      tempPassword: tempPassword || null,
      createdAt: new Date().toISOString(),
    });
  }
  await inviteUserByEmail(normalized, role);
}

export async function updateAdminUser(
  userId: string,
  data: { role: UserRole; displayName: string; phoneNumber: string; status: 'active' | 'inactive'; tempPassword?: string; }
): Promise<void> {
  const payload: Record<string, any> = { ...data, updatedAt: Timestamp.now() };
  await updateDoc(doc(db, 'users', userId), payload);
}

export async function removeAdminUser(userId: string): Promise<void> {
  await updateDoc(doc(db, 'users', userId), { role: 'customer', status: 'inactive', updatedAt: Timestamp.now() });
}

export async function findUserByEmail(email: string): Promise<AdminUser | null> {
  const normalized = email.trim().toLowerCase();
  const q = query(collection(db, 'users'), where('email', '==', normalized));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const d = snapshot.docs[0];
  const data = d.data();
  return { id: d.id, ...data } as AdminUser;
}

export async function inviteUserByEmail(email: string, role: UserRole): Promise<void> {
  const normalized = email.trim().toLowerCase();
  await setDoc(doc(db, 'user_invites', normalized), { email: normalized, role, createdAt: Timestamp.now() });
}

// --- PROFILE MANAGEMENT FUNCTIONS ---

export async function getUserProfile(uid: string): Promise<AdminUser | null> {
  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? (docSnap.data() as AdminUser) : null;
}

export async function updateUserProfile(uid: string, data: any): Promise<void> {
  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, data, { merge: true });
}