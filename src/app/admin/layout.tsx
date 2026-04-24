export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f7f6f3" }}>
      <header className="bg-white border-b" style={{ borderColor: "#e2e3e7" }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-sm font-bold" style={{ color: "#333543" }}>
              Philly Rental Licenses — Admin
            </div>
            <nav className="flex items-center gap-3 text-xs" style={{ color: "#6b6d7b" }}>
              <a href="/admin/progress" className="hover:underline">Progress</a>
              <span>·</span>
              <a href="/apply/rental-license" className="hover:underline">View landing</a>
            </nav>
          </div>
          <form action="/api/admin/login" method="POST">
            <input type="hidden" name="action" value="logout" />
            <button
              type="submit"
              className="text-xs underline-offset-2 hover:underline"
              style={{ color: "#b0b2bc" }}
            >
              Sign out
            </button>
          </form>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
