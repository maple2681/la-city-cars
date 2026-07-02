# LA City Cars Built-in CMS & Admin Portal Guide

This application features a built-in, production-ready, interactive **Admin Dashboard Panel** integrated directly into the React + Tailwind application. This completely replaces the old Google Sheets CMS integration with a persistent, secure, and instant local management system.

---

## 🔒 Secure Admin Authentication

The Admin Portal is protected by an elegant, high-contrast **Login Gate Modal** to prevent unauthorized inventory modifications.

*   **Access Route**: Click the **Admin** link in the navigation header, or navigate to `https://<your-app-domain>/#admin`
*   **Default Credentials**:
    *   **Username**: `admin`
    *   **Password**: `admin123`

Upon successful authentication, a session cookie-like flag is persisted in `sessionStorage` so you remain logged in throughout your active browser session.

---

## ⚡ Unified Persistent State Manager

The car fleet inventory is managed via a unified, reactive state controller.

1.  **Local Storage Persistence**: Any inventory updates—such as adding a vehicle, editing standard specifications, or deleting a car—are instantly saved inside the client's `localStorage` (`lacitycars_fleet`). This guarantees that modifications persist reliably across page hard-reloads and new browser sessions.
2.  **Instant Live Rendering**: All updates immediately propagate and refresh across all active application screens:
    *   **Showroom / Featured Collection**: Immediately displays any new/updated top vehicles.
    *   **Complete Vehicle Catalog**: Searches and filters (by brand, model, or category) are computed on the newly updated inventory list instantly with zero lag.
3.  **One-click Reset/Seed Baseline**: If the local inventory is fully cleared, the admin panel provides a prominent **Reseed Baseline** action to immediately restore the catalog to our 15 gorgeous luxury vehicle presets (including Porsche, Aston Martin, Ferrari, and Lamborghini models).

---

## 📋 Comprehensive CRUD Operations

The Admin Control Center provides a suite of advanced data management tools:

*   **Interactive Metrics Dashboard**:
    *   **Fleet Size Counter**: Displays the total count of live vehicles in the showroom.
    *   **Average Listing Price**: Calculates standard listing values dynamically.
    *   **Total Inventory Value**: Computes the sum of all vehicle prices.
    *   **Category breakdown list**: Real-time counters of active Sedans, SUVs, Coupes, Electric, and Sports cars.
*   **Complete Data Table**:
    *   Interactive grid showcasing active vehicle specs: Thumbnail image, Brand & Model, Year, Category tag, Mileage, Fuel specs, Gearbox system, Price, and Monthly finance rates.
*   **Intuitive Add/Edit Modal Forms**:
    *   Clicking **Add New Automobile** or **Edit** (Pencil Icon) opens a beautiful, responsive input grid to easily adjust vehicle properties, specifications, and cover images.
*   **Action Confirmation & Toasts**:
    *   CRUD operations trigger quick confirmation prompts and beautiful, stylized floating **Toast notifications** on the screen to assure the operator of successful database actions.
