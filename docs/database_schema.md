# Firestore NoSQL Database Schema & Concurrency Strategy

This document details the database schema models and concurrency strategies for the **Craft Girly Store** application.

---

## 1. Collection Schemas

### 1.1 `products` Collection
Each document in this collection represents a product in the catalog.

```typescript
interface Product {
  id: string; // Same as Document ID
  name: string; // e.g., "Pink Blossom Resin Pendant"
  description: string;
  basePrice: number; // Price in LKR, e.g., 1250.00
  images: string[]; // URLs of images uploaded to Firebase Storage
  attributes: {
    colors: string[]; // e.g., ["Rose Gold", "Soft Pink", "Clear"]
    sizes: string[]; // e.g., ["Small", "Medium", "Large"] or ["Standard"]
    materials: string[]; // e.g., ["Resin", "Gold Plated Wire"]
  };
  personalizationRequired: boolean; // True if custom name engraving is allowed
  stockCount: number; // Current inventory level
  isHidden: boolean; // Dynamic catalog status: active vs hidden
  categories: {
    parent: string; // e.g., "Resin Crafts"
    sub: string; // e.g., "Pendants"
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 1.2 `orders` Collection
Tracks customer purchases. All transactions are Cash on Delivery (COD) in phase 1.

```typescript
interface Order {
  id: string; // Document ID (generated)
  orderNumber: string; // Human-readable e.g., "CGS-100234"
  customer: {
    name: string;
    phone: string; // Must match Sri Lankan format ^07[0-9]{8}$
    address: string;
    district: string; // e.g., "Colombo", "Gampaha", "Kandy"
  };
  items: Array<{
    productId: string;
    name: string;
    variantChosen: {
      color?: string;
      size?: string;
      material?: string;
      personalizationText?: string; // If personalizationRequired was true
    };
    quantity: number;
    price: number; // Captured price at checkout
  }>;
  totalAmount: number; // Sum of items (quantity * price)
  status: 'Pending' | 'Processing' | 'Dispatched' | 'Completed' | 'Cancelled';
  paymentMethod: 'COD';
  paymentStatus: 'Pending COD' | 'Paid';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 1.3 `categories` Collection
Stores categories structure to drive navigation.

```typescript
interface Category {
  id: string; // Same as Document ID (e.g., "resin-crafts")
  parentName: string; // e.g., "Resin Crafts"
  subCategories: string[]; // e.g., ["Pendants", "Keychains", "Coasters"]
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 1.4 `audit_logs` Collection
Tracks administrative and updates logs for accountability.

```typescript
interface AuditLog {
  id: string; // Document ID
  timestamp: Timestamp;
  userId: string; // Firebase Auth UID
  userEmail: string; // Staff/Admin Email
  userRole: 'admin' | 'staff';
  actionDescription: string; // e.g., "Updated status of order CGS-100234 to Dispatched"
}
```

---

## 2. Inventory Rules & Race Condition Handling

### The Problem
When multiple users try to buy a product with low stock (e.g., only 1 item left in stock) at the exact same moment, standard read-then-write updates can lead to a race condition where both orders succeed, leading to an overselling issue (negative stock).

### The Solution: Firestore Transactions
Firestore Transactions block other modifications on the document read during the transaction until the transaction commits. If a conflict occurs, Firestore automatically retries the transaction.

Here is the TypeScript implementation strategy for a secure checkout transaction:

```typescript
import { db } from '../lib/firebase';
import { doc, runTransaction, collection, addDoc, Timestamp } from 'firebase/firestore';

export async function processSecureOrder(orderPayload: any) {
  return await runTransaction(db, async (transaction) => {
    // 1. Validate and fetch current stock for all ordered items
    const productUpdates: { docRef: any; newStock: number }[] = [];

    for (const item of orderPayload.items) {
      const productDocRef = doc(db, 'products', item.productId);
      const productSnapshot = await transaction.get(productDocRef);

      if (!productSnapshot.exists()) {
        throw new Error(`Product with ID ${item.productId} does not exist.`);
      }

      const productData = productSnapshot.data();

      // Check if product is hidden or out of stock
      if (productData.isHidden) {
        throw new Error(`Product "${productData.name}" is no longer available.`);
      }

      if (productData.stockCount < item.quantity) {
        throw new Error(`Insufficient stock for "${productData.name}". Only ${productData.stockCount} left.`);
      }

      productUpdates.push({
        docRef: productDocRef,
        newStock: productData.stockCount - item.quantity,
      });
    }

    // 2. Perform database writes within the same transaction lock
    // Update inventory stock levels
    for (const update of productUpdates) {
      transaction.update(update.docRef, {
        stockCount: update.newStock,
        updatedAt: Timestamp.now(),
      });
    }

    // Create the order document
    const orderDocRef = doc(collection(db, 'orders'));
    transaction.set(orderDocRef, {
      ...orderPayload,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return {
      orderId: orderDocRef.id,
    };
  });
}
```
