# RBAC SYSTEM - DEVELOPER REFERENCE & USAGE GUIDE

This guide provides code examples and best practices for using the Role-Based Access Control (RBAC) system in your Craft Girly Store application.

---

## Quick Reference

### 1. Check User Role in Components

#### Using AuthContext Hook:
```typescript
'use client';

import { useAuth } from '@/context/AuthContext';

export function MyComponent() {
  const { role, user } = useAuth();

  if (role === 'super-admin') {
    return <div>Welcome Super Admin!</div>;
  }
  
  if (role === 'admin') {
    return <div>Welcome Admin!</div>;
  }

  return <div>Access Denied</div>;
}
```

#### Using RBAC Utilities:
```typescript
import { hasPermission, isSuperAdmin, isAdminOrHigher } from '@/lib/rbac';

export function AdminFeature() {
  const { role } = useAuth();

  const canDelete = hasPermission(role, 'canManageProducts');
  const isOwner = isSuperAdmin(role);
  const isManagerOrAbove = isAdminOrHigher(role);

  return (
    <div>
      {canDelete && <button>Delete Product</button>}
      {isOwner && <button>View Revenue Reports</button>}
      {isManagerOrAbove && <button>Manage Inventory</button>}
    </div>
  );
}
```

---

## 2. Protecting Routes with AdminGuard

### Method 1: Minimum Role Check
```typescript
// Protect with minimum role requirement
<AdminGuard minRole="admin">
  <YourAdminComponent />
</AdminGuard>

// Multiple allowed roles
<AdminGuard minRole={['admin', 'super-admin']}>
  <YourComponent />
</AdminGuard>
```

### Method 2: Permission Check
```typescript
// Check for specific permission
<AdminGuard requiredPermission="canManageProducts">
  <ProductManagementPage />
</AdminGuard>

// Combine role and permission
<AdminGuard 
  minRole={['admin', 'super-admin']}
  requiredPermission="canViewRevenue"
>
  <RevenueReportPage />
</AdminGuard>
```

### Method 3: Custom Fallback UI
```typescript
<AdminGuard 
  requiredPermission="canManageOrders"
  fallback={
    <div className="p-8 text-center">
      <p>You don't have permission to access this feature.</p>
      <p>Contact your administrator for access.</p>
    </div>
  }
>
  <OrderManagementPage />
</AdminGuard>
```

---

## 3. Building Permission-Aware UI

### Example: Products Page (Staff vs Admin vs Super-Admin)

```typescript
'use client';

import { useAuth } from '@/context/AuthContext';
import { hasPermission, getRoleDisplayName } from '@/lib/rbac';

export function ProductsManagement() {
  const { role } = useAuth();

  const canManage = hasPermission(role, 'canManageProducts');
  const canViewAnalytics = hasPermission(role, 'canViewAnalytics');
  const canViewRevenue = hasPermission(role, 'canViewRevenue');

  return (
    <div>
      {/* Show role badge */}
      <div className="badge-luxury">Role: {getRoleDisplayName(role)}</div>

      {/* Products Table */}
      <table>
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Price</th>
            <th>Stock</th>
            {canViewRevenue && <th>Revenue</th>}
            {canManage && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>Rs. {product.price}</td>
              <td>{product.stock}</td>
              {canViewRevenue && <td>Rs. {product.totalRevenue}</td>}
              {canManage && (
                <td>
                  <button onClick={() => editProduct(product.id)}>Edit</button>
                  <button onClick={() => deleteProduct(product.id)}>Delete</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Analytics Section - Staff+ only */}
      {canViewAnalytics && (
        <div className="mt-8 p-6 bg-white rounded-xl border border-[#E5E0D8]">
          <h2>Analytics</h2>
          {/* Analytics content */}
        </div>
      )}
    </div>
  );
}
```

---

## 4. Conditional API Calls Based on Role

```typescript
async function fetchOrderData(orderId: string) {
  const { role } = useAuth();

  try {
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);
    const orderData = orderSnap.data();

    // Only show revenue to Super-Admin
    if (!hasPermission(role, 'canViewRevenue')) {
      delete orderData.revenueData;
    }

    return orderData;
  } catch (error) {
    console.error('Error fetching order:', error);
  }
}
```

---

## 5. Audit Logging

### Log User Actions:
```typescript
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

async function logAdminAction(action: string, details: object) {
  const { user, role } = useAuth();

  try {
    await addDoc(collection(db, 'audit_logs'), {
      timestamp: Timestamp.now(),
      userId: user?.uid,
      userEmail: user?.email,
      userRole: role,
      actionDescription: action,
      actionDetails: details,
    });
  } catch (error) {
    console.error('Error logging action:', error);
  }
}

// Usage:
async function deleteProduct(productId: string) {
  await deleteDoc(doc(db, 'products', productId));
  
  logAdminAction('Product Deleted', {
    productId,
    productName: product.name,
    deletedAt: new Date().toISOString(),
  });
}
```

---

## 6. Role-Based Styling

### Create Role-Specific Styles:
```typescript
const getRoleStyles = (role: string) => {
  const styleMap: Record<string, string> = {
    'super-admin': 'bg-red-50 text-red-700 border-red-200',
    'admin': 'bg-amber-50 text-amber-700 border-amber-200',
    'staff': 'bg-blue-50 text-blue-700 border-blue-200',
    'customer': 'bg-gray-50 text-gray-700 border-gray-200',
  };
  return styleMap[role] || styleMap['customer'];
};

// Usage:
<div className={`badge px-3 py-1 rounded-full border ${getRoleStyles(role)}`}>
  {role}
</div>
```

---

## 7. Creating New Admin Features

### Complete Example: Staff Management Page

```typescript
'use client';

import { useAuth } from '@/context/AuthContext';
import AdminGuard from '@/components/AdminGuard';
import { hasPermission } from '@/lib/rbac';

function StaffManagementContent() {
  const { role } = useAuth();
  const canManageStaff = hasPermission(role, 'canManageStaff');

  if (!canManageStaff) {
    return <div>You don't have permission to manage staff.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-[#442852] mb-6">Staff Management</h1>

      {/* Staff List */}
      <div className="bg-white rounded-xl border border-[#E5E0D8] p-6">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E5E0D8]">
              <th className="text-left py-3">Name</th>
              <th className="text-left py-3">Email</th>
              <th className="text-left py-3">Role</th>
              <th className="text-left py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Render staff members */}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Form */}
      <div className="mt-8 bg-white rounded-xl border border-[#E5E0D8] p-6">
        <h2 className="text-xl font-bold mb-4">Add New Staff Member</h2>
        {/* Form content */}
      </div>
    </div>
  );
}

export default function StaffManagementPage() {
  return (
    <AdminGuard minRole="super-admin" requiredPermission="canManageStaff">
      <StaffManagementContent />
    </AdminGuard>
  );
}
```

---

## 8. Permission Reference Guide

### All Available Permissions:

```typescript
// Viewing & Access
'canViewDashboard'     // Access admin dashboard
'canViewProducts'      // View product catalog
'canViewOrders'        // View orders list
'canViewRevenue'       // View revenue reports
'canViewAnalytics'     // View analytics data

// Management
'canManageProducts'    // Add, edit, delete products
'canManageOrders'      // Manage all orders
'canUpdateOrderStatus' // Update order shipment status
'canManageUsers'       // Manage user accounts
'canManageStaff'       // Manage staff roles & permissions
```

---

## 9. Testing RBAC Implementation

### Manual Testing Checklist:

```
Staff Role:
[ ] Can access /admin/orders
[ ] Revenue shows "[REDACTED - ADMIN ONLY]"
[ ] Delete button is locked/disabled
[ ] Can update order status
[ ] Cannot access /admin/products or other admin pages

Admin Role:
[ ] Can access all admin pages
[ ] Can see revenue data
[ ] Can delete orders
[ ] Can manage products
[ ] Cannot view staff management

Super-Admin Role:
[ ] Can access all admin features
[ ] Can manage staff/admin roles
[ ] Can view all revenue/analytics
[ ] Can manage users
```

### Console Debugging:

```typescript
// In browser console to check role
console.log(useAuth().role)

// Check permissions
console.log(hasPermission(role, 'canManageProducts'))
```

---

## 10. Common Patterns

### Pattern 1: Conditional Feature Rendering
```typescript
export function FeatureList() {
  const { role } = useAuth();

  const features = [
    {
      name: 'View Orders',
      permission: 'canViewOrders',
      enabled: hasPermission(role, 'canViewOrders'),
    },
    {
      name: 'Manage Products',
      permission: 'canManageProducts',
      enabled: hasPermission(role, 'canManageProducts'),
    },
    {
      name: 'View Revenue',
      permission: 'canViewRevenue',
      enabled: hasPermission(role, 'canViewRevenue'),
    },
  ];

  return (
    <ul>
      {features.map(feature => (
        <li key={feature.permission}>
          {feature.name}: {feature.enabled ? '✅' : '❌'}
        </li>
      ))}
    </ul>
  );
}
```

### Pattern 2: Role-Based Route Navigation
```typescript
export function Navigation() {
  const { role } = useAuth();

  const navItems = [
    { href: '/', label: 'Home', show: true },
    { href: '/admin/orders', label: 'Orders', show: hasPermission(role, 'canViewOrders') },
    { href: '/admin/products', label: 'Products', show: hasPermission(role, 'canManageProducts') },
    { href: '/admin/staff', label: 'Staff', show: hasPermission(role, 'canManageStaff') },
  ];

  return (
    <nav>
      {navItems.filter(item => item.show).map(item => (
        <Link key={item.href} href={item.href}>{item.label}</Link>
      ))}
    </nav>
  );
}
```

### Pattern 3: Permission-Based Button State
```typescript
export function ActionButtons() {
  const { role } = useAuth();
  const canDelete = hasPermission(role, 'canManageOrders');

  return (
    <div>
      <button
        onClick={handleDelete}
        disabled={!canDelete}
        className={canDelete ? 'btn-primary' : 'btn-disabled'}
        title={!canDelete ? 'You do not have permission to delete' : 'Delete'}
      >
        Delete
      </button>
    </div>
  );
}
```

---

## 11. Security Best Practices

### ✅ DO:
- Always check permissions on both client AND server
- Log all sensitive actions to audit_logs
- Use Firestore security rules to enforce backend access
- Clear permissions on logout
- Use type-safe role checking

### ❌ DON'T:
- Rely only on client-side permission checks
- Hardcode role checks throughout components
- Forget to update Firestore rules when adding features
- Expose sensitive data before checking permissions
- Mix business logic with permission logic

---

## Resources

- **RBAC Utility File:** `src/lib/rbac.ts`
- **AdminGuard Component:** `src/components/AdminGuard.tsx`
- **AuthContext:** `src/context/AuthContext.tsx`
- **Admin Setup Guide:** `ADMIN_SETUP_GUIDE.md`
- **Implementation Summary:** `IMPLEMENTATION_SUMMARY.md`

---

**Version:** 1.0
**Last Updated:** June 16, 2026
**Craft Girly Store RBAC Developer Guide**
