/* eslint-disable @next/next/no-img-element */

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#f7f6f3" }}>
      {/* Header */}
      <header className="bg-white border-b border-[#e2e3e7]">
        <div className="w-full px-6 py-5 flex items-center justify-center">
          <a href="https://hubkey.co" className="flex items-center" aria-label="HubKey Real Estate — back to main site">
            <img
              src="/hubkey-logo.png"
              alt="HubKey Real Estate"
              className="h-11"
            />
          </a>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 w-full">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#e2e3e7] bg-white">
        <div className="max-w-4xl mx-auto px-6 py-6 text-center text-sm" style={{ color: "#6b6d7b" }}>
          HubKey Real Estate &middot; Philadelphia, PA &middot;{" "}
          <a href="https://hubkey.co" className="underline" style={{ color: "#50b8a2" }}>
            hubkey.co
          </a>
        </div>
      </footer>
    </div>
  );
}
