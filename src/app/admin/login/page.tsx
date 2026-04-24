import { Suspense } from "react";

function LoginForm({ redirect, error }: { redirect: string; error?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: "#f7f6f3" }}>
      <div className="w-full max-w-sm rounded-2xl border bg-white p-8" style={{ borderColor: "#e2e3e7" }}>
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold" style={{ color: "#333543" }}>
            Admin sign in
          </h1>
          <p className="text-xs mt-1" style={{ color: "#6b6d7b" }}>
            Progress dashboard for the Philly rental license landing.
          </p>
        </div>
        <form action="/api/admin/login" method="POST" className="space-y-3">
          <input type="hidden" name="redirect" value={redirect} />
          <input
            type="password"
            name="password"
            autoFocus
            required
            placeholder="Password"
            className="w-full px-4 py-3 rounded-xl border text-sm outline-none focus:border-[#50b8a2]"
            style={{ borderColor: "#e2e3e7", color: "#333543" }}
          />
          <button
            type="submit"
            className="w-full px-4 py-3 rounded-xl text-sm font-semibold text-white"
            style={{ backgroundColor: "#50b8a2" }}
          >
            Sign in
          </button>
          {error && (
            <p className="text-xs text-center" style={{ color: "#dc2626" }}>
              {error === "bad_password" ? "Incorrect password." : "Sign-in failed."}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; error?: string }>;
}) {
  const params = await searchParams;
  return (
    <Suspense>
      <LoginForm redirect={params.redirect || "/admin/progress"} error={params.error} />
    </Suspense>
  );
}
