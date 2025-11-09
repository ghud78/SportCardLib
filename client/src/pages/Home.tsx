import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { useLocation } from "wouter";

/**
 * All content in this page are only for example, replace with your own feature implementation
 * When building pages, remember your instructions in Frontend Workflow, Frontend Best Practices, Design Guide and Common Pitfalls
 */
export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src={APP_LOGO} alt={APP_TITLE} className="h-10 w-10" />
            <h1 className="text-2xl font-bold text-foreground">{APP_TITLE}</h1>
          </div>
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
              {user?.role === 'admin' && (
                <Button variant="outline" size="sm" onClick={() => setLocation("/admin")}>
                  Admin Panel
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={logout}>
                Sign Out
              </Button>
            </div>
          ) : (
            <Button onClick={() => (window.location.href = getLoginUrl())}>
              Sign In
            </Button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="container py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-7xl mb-6">🏀⚾🏈</div>
          <h2 className="text-5xl font-bold text-foreground mb-6">
            Organize Your Sport Card Collection
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Keep track of your valuable sport cards with our easy-to-use collection management system.
            Create collections, add cards, and manage your inventory all in one place.
          </p>
          {isAuthenticated ? (
            <div className="flex gap-4 justify-center">
              <Button size="lg" onClick={() => (window.location.href = "/collections")}>
                View My Collections
              </Button>
            </div>
          ) : (
            <Button size="lg" onClick={() => (window.location.href = getLoginUrl())}>
              Get Started - Sign In
            </Button>
          )}
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20 max-w-5xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-sm">
            <div className="text-4xl mb-4">📁</div>
            <h3 className="text-xl font-semibold mb-2">Organize Collections</h3>
            <p className="text-muted-foreground">
              Create multiple collections to organize your cards by player, team, or any category you choose.
            </p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-sm">
            <div className="text-4xl mb-4">🃏</div>
            <h3 className="text-xl font-semibold mb-2">Track Card Details</h3>
            <p className="text-muted-foreground">
              Record player names, brands, series, seasons, card numbers, and notes for each card.
            </p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-sm">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold mb-2">Quick Entry</h3>
            <p className="text-muted-foreground">
              Smart input flow remembers your last selections for faster card entry.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
