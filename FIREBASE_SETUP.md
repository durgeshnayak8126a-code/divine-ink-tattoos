# Firebase Admin and Gallery CMS

The Firebase admin area and Gallery CMS are isolated from the public website
and do not include live Firebase credentials.

## Configure locally

1. Create a Firebase project.
2. Enable Email/Password under Firebase Authentication.
3. Create Firestore Database and Firebase Storage.
4. Copy `.env.example` to `.env.local` and replace every placeholder.
5. Create the first admin user in Firebase Authentication.
6. Assign that user the custom claim `{ "admin": true }` from a trusted Firebase
   Admin SDK environment. Never assign admin claims from browser code.
7. Deploy `firestore.rules`, `firestore.indexes.json`, and `storage.rules` with
   the Firebase CLI when the project is ready.

The admin routes are `/admin/login/`, `/admin/`, and `/admin/gallery/`. Without
complete Firebase environment variables, the login page remains safely
disabled.

## Data boundaries

- Firestore `adminUsers/{uid}`: authenticated administrator profile reference.
- Firestore `auditLogs/*`: reserved for future server-written audit entries.
- Storage `admin-avatars/{uid}/{fileName}`: administrator-owned profile files.
- Firestore `gallery/{itemId}`: published portfolio metadata with admin-only
  writes.
- Storage `gallery/*`: standard gallery artwork.
- Storage `before-after/*`: before and after images only.
- Storage `featured/*`: featured gallery artwork.
- Every other Firestore document and Storage object is denied by default.

Services, reviews, FAQ, offers, and homepage editing are intentionally not
implemented in this phase.
