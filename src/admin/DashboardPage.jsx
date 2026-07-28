import AdminMeta from './AdminMeta.jsx';

export default function DashboardPage() {
  return (
    <>
      <AdminMeta title="Admin Dashboard | Divine Ink Tattoos" />
      <section aria-labelledby="dashboard-title">
        <p className="admin-kicker">Phase 1 foundation</p>
        <h1 id="dashboard-title">Dashboard</h1>
        <p className="admin-intro">
          Authentication and protected admin routing are ready. Content
          management modules are intentionally not enabled in this phase.
        </p>

        <div className="admin-summary-grid">
          <article>
            <h2>Authentication</h2>
            <p>Firebase email and password session structure is available.</p>
          </article>
          <article>
            <h2>Firestore</h2>
            <p>Admin profile and audit-log boundaries are defined and locked.</p>
          </article>
          <article>
            <h2>Storage</h2>
            <p>Administrator-owned profile storage is defined and protected.</p>
          </article>
        </div>
      </section>
    </>
  );
}

