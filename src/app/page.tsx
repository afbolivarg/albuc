import { Button } from "@/components/ui/button"
import { signInWithGoogle } from "@/app/actions/auth"
import { getCurrentUser } from "@/lib/auth/user"
import { redirect } from "next/navigation"

export default async function HomePage() {
  const user = await getCurrentUser()

  if (user) {
    redirect("/library")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6">
        <div className="flex items-center space-x-2">
          <div className="text-2xl font-serif font-bold text-foreground">
            📚 Alexandria
          </div>
        </div>
        <form action={signInWithGoogle}>
          <Button type="submit">Continue with Google</Button>
        </form>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-foreground mb-6">
            Your Personal Library,
            <br />
            <span className="text-primary">Beautifully Organized</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Search any book, save to your cozy library, and write rich notes in
            Markdown. All with a warm, tactile interface that makes reading feel
            like home.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <form action={signInWithGoogle}>
              <Button size="lg" type="submit" className="text-lg px-8 py-3">
                Continue with Google
              </Button>
            </form>
            <Button variant="outline" size="lg" className="text-lg px-8 py-3">
              Try a Demo
            </Button>
          </div>

          {/* Demo Preview */}
          <div className="bg-card backdrop-blur-sm rounded-2xl shadow-xl p-8 max-w-3xl mx-auto border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-muted rounded-xl p-4 mb-4">
                  <div className="text-3xl mb-2">🔍</div>
                  <h3 className="font-serif font-semibold text-foreground">
                    Search Books
                  </h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  Find any book from Open Library with rich metadata
                </p>
              </div>

              <div className="text-center">
                <div className="bg-muted rounded-xl p-4 mb-4">
                  <div className="text-3xl mb-2">📖</div>
                  <h3 className="font-serif font-semibold text-foreground">
                    Track Status
                  </h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  Want, Owned, Reading, or Read with star ratings
                </p>
              </div>

              <div className="text-center">
                <div className="bg-muted rounded-xl p-4 mb-4">
                  <div className="text-3xl mb-2">✍️</div>
                  <h3 className="font-serif font-semibold text-foreground">
                    Rich Notes
                  </h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  Write beautiful notes in Markdown with live preview
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
