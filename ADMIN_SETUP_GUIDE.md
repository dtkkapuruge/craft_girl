# ADMIN PANEL SETUP & FIRST-TIME LOGIN GUIDE

This guide provides step-by-step instructions for setting up the Admin Panel, configuring Firebase, and managing users with the 3-tier Role-Based Access Control (RBAC) system.

---

## PART 1: FIREBASE CONSOLE SETUP

### Step 1.1: Create Firestore Collections

1. Go to **Firebase Console** → Select your project
2. Navigate to **Firestore Database** → **Collections**
3. Create the following collections:

#### **Collection 1: `users`**
- This stores user account data and role assignments
- **Document ID Format:** `{uid}` (Firebase Auth UID)
- **Example Fields:**
  ```
  {
    "email": "owner@craftgirly.lk",
    "displayName": "Craft Girly Owner",
    "photoURL": "https://...",
    "role": "super-admin",  // or "admin", "staff", "customer"
    "createdAt": "2026-06-16T13:27:33.370Z",
    "lastLoginAt": "2026-06-16T14:00:00.000Z"
  }
  ```

#### **Collection 2: `orders`** (if not already exists)
- Stores all customer orders
- **Document ID Format:** auto-generated
- **Example Fields:**
  ```
  {
    "orderNumber": "CGS-123456",
    "customer": {
      "name": "Customer Name",
      "email": "customer@example.com",
      "phone": "0771234567",
      "address": "123 Street Road",
      "district": "Colombo"
    },
    "items": [
      {
        "productId": "prod_001",
        "name": "Product Name",
        "quantity": 1,
        "price": 1450,
        "variantChosen": {
          "color": "Rose Gold",
          "size": "Standard",
          "personalizationText": "Custom Name"
        }
      }
    ],
    "totalAmount": 1800,
    "status": "Pending",  // Pending, Processing, Dispatched, Completed, Cancelled
    "paymentMethod": "COD",
    "paymentStatus": "Pending COD",  // or "Paid"
    "createdAt": Timestamp.now(),
    "updatedAt": Timestamp.now()
  }
  ```

#### **Collection 3: `products`** (Optional - for Firestore-based product catalog)
- Stores product information
- **Document ID:** Product slug/ID
- **Example Fields:**
  ```
  {
    "id": "resin-flower-pendant",
    "name": "Floral Resin Blossom Pendant",
    "description": "A beautiful, hand-crafted resin pendant...",
    "basePrice": 1450,
    "images": ["https://...", "https://..."],
    "attributes": {
      "colors": ["Rose Gold", "Silver", "Gold"],
      "sizes": ["Standard Chain (45cm)", "Long Chain (60cm)"],
      "materials": ["Resin & Gold Foil", "Resin & Silver Flakes"]
    },
    "personalizationRequired": true,
    "stockCount": 12,
    "isHidden": false,
    "categories": {
      "parent": "Handmade Jewelry",
      "sub": "Pendants"
    }
  }
  ```

#### **Collection 4: `audit_logs`** (For compliance & security)
- Tracks all admin actions for accountability
- **Document ID Format:** auto-generated
- **Example Fields:**
  ```
  {
    "timestamp": Timestamp.now(),
    "userId": "user-uid-here",
    "userEmail": "admin@craftgirly.lk",
    "userRole": "super-admin",
    "actionDescription": "Updated order CGS-123456 status to Dispatched"
  }
  ```

### Step 1.2: Set Firestore Security Rules

1. Go to **Firestore Database** → **Rules**
2. Replace with the following security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Allow public read on products
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth.uid != null && hasRole('admin', 'super-admin');
    }
    
    // Secure users collection
    match /users/{userId} {
      allow read: if request.auth.uid == userId || hasRole('super-admin', 'admin');
      allow write: if request.auth.uid == userId || hasRole('super-admin');
      allow create: if request.auth.uid != null;
    }
    
    // Secure orders collection
    match /orders/{orderId} {
      allow read: if request.auth.uid != null && hasRole('admin', 'super-admin', 'staff');
      allow write: if hasRole('admin', 'super-admin') || 
                      (hasRole('staff') && resource.data.status in ['Pending', 'Processing', 'Dispatched']);
      allow create: if request.auth.uid != null; // Customers can create orders
    }
    
    // Secure audit logs
    match /audit_logs/{logId} {
      allow read: if hasRole('super-admin', 'admin');
      allow write: if hasRole('super-admin', 'admin');
    }
    
    // Helper function to check user role
    function hasRole(roles) {
      return request.auth != null && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in roles;
    }
  }
}
```

### Step 1.3: Configure Authentication

1. Go to **Authentication** → **Sign-in method**
2. Enable **Google** as a provider (already configured in your app)
3. In **Authorized domains**, add:
   - `localhost:3000` (for development)
   - `your-production-domain.com` (for production)

### Step 1.4: Set Environment Variables

Create a `.env.local` file (if not already present) with your Firebase credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abc123def456
```

---

## PART 2: FIRST-TIME ADMIN LOGIN PROCEDURE

### Step 2.1: Create Your First Super-Admin Account

1. **Sign up via Google:**
   - Visit `https://localhost:3000` (development) or your production URL
   - Click on the **Profile Icon** in the header → Sign in with Google
   - Authenticate with your Google account
   - You'll be redirected back to the homepage
   - A user document will be automatically created in Firestore with `role: "customer"`

2. **Promote to Super-Admin:**
   - Go to **Firebase Console** → **Firestore Database** → **Collections** → **users**
   - Find your user document (use your email to identify)
   - Edit the document and change `role` field from `"customer"` to `"super-admin"`
   - Save the changes

3. **Verify Admin Access:**
   - Refresh your application in the browser (Cmd/Ctrl + Shift + R for hard refresh)
   - The auth state will update and you should now have admin privileges
   - Navigate to `https://localhost:3000/admin/orders` (or your production URL)
   - You should see the **Order Board** dashboard

### Step 2.2: Create Additional Admin & Staff Accounts

#### **For Admins (Catalog & Order Management):**

1. Have the admin candidate sign up via Google at your app's homepage
2. In Firebase Console, find their user document
3. Change their `role` to `"admin"`
4. They can now:
   - View all orders and analytics
   - Manage products (add/edit/delete)
   - Manage orders (update status, delete)
   - View revenue reports
   - NOT manage other staff accounts

#### **For Staff (Fulfillment Only):**

1. Have the staff member sign up via Google at your app's homepage
2. In Firebase Console, find their user document
3. Change their `role` to `"staff"`
4. They can now:
   - View orders list and details
   - Update order status (Pending → Processing → Dispatched → Completed)
   - NOT delete orders
   - NOT view revenue or analytics
   - NOT manage products
   - Perfect for warehouse/fulfillment team

---

## PART 3: ROLE HIERARCHY & PERMISSIONS

### Permission Matrix

| Permission | Customer | Staff | Admin | Super-Admin |
|-----------|----------|-------|-------|------------|
| View Products | ✅ | ✅ | ✅ | ✅ |
| View Dashboard | ❌ | ✅ | ✅ | ✅ |
| View Orders | ❌ | ✅ | ✅ | ✅ |
| Update Order Status | ❌ | ✅ | ✅ | ✅ |
| Delete Orders | ❌ | ❌ | ✅ | ✅ |
| Manage Products | ❌ | ❌ | ✅ | ✅ |
| View Revenue | ❌ | ❌ | ❌ | ✅ |
| View Analytics | ❌ | ✅ | ✅ | ✅ |
| Manage Users/Roles | ❌ | ❌ | ❌ | ✅ |
| Manage Staff | ❌ | ❌ | ❌ | ✅ |

---

## PART 4: ACCESSING THE ADMIN PANEL

### For Super-Admin/Admin:
- Navigate to: `https://yourdomain.com/admin/orders`
- You'll see the complete order board with all features

### For Staff:
- Navigate to: `https://yourdomain.com/admin/orders`
- Revenue column will be redacted (shows "[REDACTED - ADMIN ONLY]")
- Delete button will be disabled (shows "Locked")
- Can only update order status, not delete

### If You Get Access Denied:
1. Ensure your user `role` is set correctly in Firebase
2. Hard refresh the page (Cmd/Ctrl + Shift + R)
3. Sign out and sign back in
4. Check browser console for any error messages

---

## PART 5: DAILY OPERATIONS CHECKLIST

### For Super-Admin:
- [ ] Review revenue reports daily
- [ ] Monitor order volume and fulfillment rates
- [ ] Manage staff roles and permissions
- [ ] Review audit logs for suspicious activities
- [ ] Backup important data regularly

### For Admin:
- [ ] Process new orders (move from Pending to Processing)
- [ ] Monitor stock levels
- [ ] Manage product catalog (pricing, descriptions)
- [ ] Handle order exceptions and customer issues
- [ ] Generate daily reports

### For Staff:
- [ ] Check for new pending orders
- [ ] Update order status as items are picked/packed/shipped
- [ ] Ensure accurate personalization on custom items
- [ ] Communicate shipping dates to customers
- [ ] Report any issues to Admin/Owner

---

## PART 6: TROUBLESHOOTING

### Issue: "Access Denied" when trying to access `/admin/orders`
**Solution:**
1. Check that user's `role` field in Firestore is NOT "customer"
2. Hard refresh browser (Cmd/Ctrl + Shift + R)
3. Sign out completely and sign back in
4. Clear browser cache if issue persists

### Issue: Revenue column shows "[REDACTED]" for Admin
**Solution:**
- This is expected for Staff roles
- Only Super-Admin can view revenue
- Verify your user `role` is set to "super-admin" or "admin" (not "staff")

### Issue: Delete button is disabled/locked
**Solution:**
- Delete functionality is restricted to Admin and Super-Admin only
- Staff members are intentionally locked out from deleting orders
- This is for data integrity and prevents accidental deletions

### Issue: Orders not loading
**Solution:**
1. Check Firestore database connection in Firebase Console
2. Verify `orders` collection exists
3. Check browser console for error messages
4. Verify user has `canViewOrders` permission for their role

### Issue: Changes not reflected after updating role in Firebase
**Solution:**
1. Clear browser cookies
2. Sign out from the app
3. Sign back in
4. Hard refresh the page

---

## PART 7: SECURITY BEST PRACTICES

1. **Never share Firebase credentials** - Keep `.env.local` private
2. **Use Strong Passwords** - When setting up Google accounts for staff
3. **Enable 2FA** - On your Google account for added security
4. **Review Audit Logs** - Regularly check `/audit_logs` collection for suspicious activities
5. **Rotate Access** - Remove staff roles when employees leave
6. **Use Separate Accounts** - Don't share admin accounts between team members
7. **Regular Backups** - Export your Firestore data regularly

---

## PART 8: CONTACT & SUPPORT

For issues or questions about the admin panel:
- Email: hello@craftgirly.lk
- Contact your development team for technical assistance
- Refer to this guide before reaching out

---

**Last Updated:** June 16, 2026
**Version:** 1.0
**Craft Girly Store Admin Panel Setup Guide**
