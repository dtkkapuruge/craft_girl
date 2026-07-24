/**
 * scripts/migratePermissions.ts
 *
 * One-time migration script: upgrades Firestore `roles` documents from the
 * legacy combined permission keys to granular CRUD keys.
 *
 * Legacy → New mappings
 * ─────────────────────
 * canManageProducts → canCreateProducts, canEditProducts, canDeleteProducts
 *   (canViewProducts is left as-is; it already existed)
 * canManageStaff    → canViewStaff, canCreateStaff, canEditStaff, canDeleteStaff
 *
 * Run with:
 *   npx ts-node -r tsconfig-paths/register scripts/migratePermissions.ts
 *
 * Prerequisites: Firebase Admin SDK credentials must be available via
 *   GOOGLE_APPLICATION_CREDENTIALS env var or Application Default Credentials.
 */

import { deleteField, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// ── Migration logic ───────────────────────────────────────────────────────────

interface LegacyPermissions {
  canManageProducts?: boolean;
  canManageStaff?: boolean;
  [key: string]: unknown;
}

async function migrateRole(
  docId: string,
  data: LegacyPermissions
): Promise<{ migrated: boolean; changes: string[] }> {
  const updates: Record<string, unknown> = {};
  const changes: string[] = [];

  // ── canManageProducts ───────────────────────────────────────────────────────
  if ('canManageProducts' in data) {
    const val = Boolean(data.canManageProducts);
    // Spread the legacy flag to all three write flags; canViewProducts is kept.
    updates['canCreateProducts'] = data['canCreateProducts'] ?? val;
    updates['canEditProducts']   = data['canEditProducts']   ?? val;
    updates['canDeleteProducts'] = data['canDeleteProducts'] ?? val;
    // Ensure canViewProducts is at least as permissive as the old manage flag.
    if (val) updates['canViewProducts'] = true;
    // Delete legacy key
    updates['canManageProducts'] = deleteField();
    changes.push(
      `canManageProducts(${val}) → canCreateProducts/canEditProducts/canDeleteProducts`
    );
  }

  // ── canManageStaff ──────────────────────────────────────────────────────────
  if ('canManageStaff' in data) {
    const val = Boolean(data.canManageStaff);
    updates['canViewStaff']   = data['canViewStaff']   ?? val;
    updates['canCreateStaff'] = data['canCreateStaff'] ?? val;
    updates['canEditStaff']   = data['canEditStaff']   ?? val;
    updates['canDeleteStaff'] = data['canDeleteStaff'] ?? val;
    updates['canManageStaff'] = deleteField();
    changes.push(
      `canManageStaff(${val}) → canViewStaff/canCreateStaff/canEditStaff/canDeleteStaff`
    );
  }

  if (Object.keys(updates).length === 0) {
    return { migrated: false, changes: [] };
  }

  await updateDoc(doc(db, 'roles', docId), updates);
  return { migrated: true, changes };
}

async function run() {
  console.log('🔄  Starting permissions migration…\n');

  const snapshot = await getDocs(collection(db, 'roles'));

  if (snapshot.empty) {
    console.log('⚠️  No role documents found in Firestore. Nothing to migrate.');
    return;
  }

  let migratedCount = 0;
  let skippedCount = 0;

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data() as LegacyPermissions;
    const { migrated, changes } = await migrateRole(docSnap.id, data);

    if (migrated) {
      migratedCount++;
      console.log(`✅  [${docSnap.id}]`);
      changes.forEach((c) => console.log(`    • ${c}`));
    } else {
      skippedCount++;
      console.log(`⏭️  [${docSnap.id}] — already up-to-date`);
    }
  }

  console.log('\n────────────────────────────────────');
  console.log(`Migration complete.`);
  console.log(`  Migrated : ${migratedCount}`);
  console.log(`  Skipped  : ${skippedCount}`);
  console.log('────────────────────────────────────\n');
}

run().catch((err) => {
  console.error('❌  Migration failed:', err);
  process.exit(1);
});
