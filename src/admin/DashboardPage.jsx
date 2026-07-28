import AdminMeta from './AdminMeta.jsx';

export default function DashboardPage() {
  return (
    <>
      <AdminMeta title="Admin Dashboard | Divine Ink Tattoos" />
      <section aria-labelledby="dashboard-title">
        <p className="admin-kicker">Phase 3 CMS</p>
        <h1 id="dashboard-title">Dashboard</h1>
        <p className="admin-intro">
          Manage gallery, services, homepage settings, reviews, FAQs, offers,
          contact details and SEO configuration from one protected workspace.
        </p>

        <div className="admin-summary-grid">
          <article>
            <h2>Content</h2>
            <p>CRUD modules use validated Firestore documents.</p>
          </article>
          <article>
            <h2>Media</h2>
            <p>Gallery uploads are compressed, stored and cleaned up safely.</p>
          </article>
          <article>
            <h2>Publishing</h2>
            <p>Published gallery items automatically feed the public portfolio.</p>
          </article>
        </div>
      </section>
    </>
  );
}
