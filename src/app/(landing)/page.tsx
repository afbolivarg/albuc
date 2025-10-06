import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
import {
  // Smartphone,
  // Monitor,
  // Globe,
  // Brain,
  // Layers,
  // Zap,
  SquareLibrary,
} from "lucide-react"
import { signInWithGoogle } from "./actions"
import Link from "next/link"
import { PricingSection } from "./pricing"
import { getCurrentUser } from "@/lib/supabase/user"
import { redirect } from "next/navigation"

export default async function Home() {
  const user = await getCurrentUser()

  if (user) {
    redirect("/library")
  }

  return (
    <div className="min-h-screen max-w-6xl mx-auto p-4 md:p-6 space-y-16 md:space-y-32">
      {/* Hero Section */}
      <Card className="bg-muted rounded-xl shadow-none overflow-hidden p-0 border-none">
        <CardContent
          className="p-4 md:p-6 space-y-8 md:space-y-12 bg-cover bg-center bg-no-repeat relative min-h-[700px]"
          style={{
            backgroundImage: "url('/hero-bg.webp')",
          }}
        >
          {/* Header */}
          <nav className="flex items-center justify-between">
            <div className="flex items-center justify-between">
              <Link
                href="/"
                className="flex items-center space-x-2 cursor-pointer select-auto mr-4"
                tabIndex={0}
                aria-label="Go to Library"
              >
                <span className="text-2xl font-serif font-bold text-foreground flex items-center gap-2 select-text">
                  <SquareLibrary className="w-6 h-6" />
                  Albuc
                </span>
              </Link>
              <Button variant="link" asChild className="hidden md:inline-block">
                <Link href="#features">Features</Link>
              </Button>
              <Button variant="link" asChild className="hidden md:inline-block">
                <Link href="#pricing">Pricing</Link>
              </Button>
            </div>
            <form action={signInWithGoogle}>
              <Button type="submit" variant="outline">
                Continue with Google
              </Button>
            </form>
          </nav>

          {/* Main Headline */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-none tracking-tight font-serif">
              Don&apos;t just read.
              <br />
              Build ideas.
            </h1>
            <p className="text-lg md:text-xl text-foreground/80 mb-8 max-w-2xl mx-auto">
              Track your reading. Capture your thinking. Albuc blends
              Goodreads&apos; structure with Notion&apos;s writing flow.
            </p>

            <Button asChild>
              <Link href="#pricing">Get Started</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <PricingSection />

      {/* Platform Cards */}
      {/* <div className="grid md:grid-cols-2 gap-6 mt-8" id="features">
        <Card className="bg-white rounded-2xl shadow-lg">
          <CardContent className="p-8">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-32 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Monitor className="w-8 h-8 text-gray-600" />
                </div>
                <div className="absolute -top-2 -left-2 w-6 h-6 bg-gray-400 rounded-full"></div>
                <div className="absolute -top-2 left-6 w-6 h-6 bg-gray-500 rounded-full"></div>
                <div className="absolute -top-2 left-14 w-6 h-6 bg-gray-600 rounded-full"></div>
                <div className="absolute -top-2 left-22 w-6 h-6 bg-gray-700 rounded-full"></div>
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Notely for Windows / Linux
            </h3>
            <p className="text-gray-600 text-sm">
              Work smarter on desktop. Fully customizable, syncing, keyboard
              shortcuts, and integrated with everything.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-2xl shadow-lg">
          <CardContent className="p-8">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                  <Globe className="w-8 h-8 text-gray-600" />
                </div>
                <div className="absolute top-2 right-2">
                  <Badge className="bg-black text-white text-xs px-2 py-1">
                    Noteworthy
                  </Badge>
                </div>
                <div className="absolute bottom-2 left-2">
                  <Badge className="bg-black text-white text-xs px-2 py-1">
                    Daily 3 minutes
                  </Badge>
                </div>
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">Notely for Web</h3>
            <p className="text-gray-600 text-sm">
              Access your notes anywhere with a responsive web app that works in
              every browser.
            </p>
          </CardContent>
        </Card>
      </div> */}

      {/* Notes Demo Section */}
      {/* <Card className="bg-white rounded-3xl shadow-lg mt-16">
        <CardContent className="p-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Notes that work the way you think.
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Notes shouldn't feel messy or scattered. With fully flexible
              entry, thought flows into an organized system that adapts to your
              style and keeps you focused.
            </p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-8 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow-sm">
                <span className="text-sm">Style 01</span>
              </div>
              <div className="flex gap-1">
                <div className="w-8 h-8 bg-white rounded flex items-center justify-center shadow-sm">
                  B
                </div>
                <div className="w-8 h-8 bg-white rounded flex items-center justify-center shadow-sm">
                  I
                </div>
                <div className="w-8 h-8 bg-white rounded flex items-center justify-center shadow-sm">
                  U
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-700 leading-relaxed">
                  Dapibus lorem dolor sit amet, consectetur adipiscing elit.
                  Etiam non ligula molestie, dignissim a, mattis tellus. Sed
                  dignissim, velit non molestie accumsan, risus ante
                  sollicitudin lorem, ut consectetur tellus est non mauris.
                  Mauris quis consequat elit, sit amet rhoncus elit. Cras sapien
                  felis consequat quis lorem tempor consequat, ut consectetur
                  tellus est non mauris. Mauris quis consequat elit, sit amet
                  rhoncus elit.
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-700 leading-relaxed">
                  Dapibus lorem dolor sit amet, consectetur adipiscing elit.
                  Etiam non ligula molestie, dignissim a, mattis tellus. Sed
                  dignissim, velit non molestie accumsan, risus ante
                  sollicitudin lorem, ut consectetur tellus est non mauris.
                  Mauris quis consequat elit, sit amet rhoncus elit. Cras sapien
                  felis consequat quis lorem tempor consequat, ut consectetur
                  tellus est non mauris. Mauris quis consequat elit, sit amet
                  rhoncus elit.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                <span className="text-sm text-gray-600">AI summary</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Save</span>
                <div className="w-6 h-6 bg-gray-900 rounded-full"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card> */}

      {/* Platform Showcase */}
      {/* <div className="mt-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ideas. Notes. Clarity.
            <br />
            Wherever your mind goes.
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="grid grid-cols-2 gap-6">
            <Card className="bg-white rounded-2xl shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <Smartphone className="w-12 h-12 text-gray-600" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-black rounded-full"></div>
                  </div>
                </div>
                <h3 className="font-semibold mb-2">Notely for Android</h3>
                <p className="text-xs text-gray-600">
                  Take notes on the go with full sync across all your devices
                  through the Android mobile app.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-2xl shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-gray-600 font-bold">iOS</span>
                    </div>
                  </div>
                </div>
                <h3 className="font-semibold mb-2">Notely for iOS</h3>
                <p className="text-xs text-gray-600">
                  Get down notes, organize with folders, and collaborate on
                  shared projects. All from your iPhone or iPad.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Card className="bg-white rounded-2xl shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <div className="w-20 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Monitor className="w-6 h-6 text-gray-600" />
                    </div>
                    <div className="absolute -top-1 -left-1 w-4 h-4 bg-gray-400 rounded-full"></div>
                    <div className="absolute -top-1 left-3 w-4 h-4 bg-gray-500 rounded-full"></div>
                    <div className="absolute -top-1 left-7 w-4 h-4 bg-gray-600 rounded-full"></div>
                  </div>
                </div>
                <h3 className="font-semibold mb-2">
                  Notely for Windows / Linux
                </h3>
                <p className="text-xs text-gray-600">
                  Access your notebook from desktop with syncing, keyboard
                  shortcuts, and integrated with everything.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-2xl shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                      <Globe className="w-6 h-6 text-gray-600" />
                    </div>
                    <div className="absolute top-1 right-1">
                      <Badge className="bg-black text-white text-xs px-1 py-0.5">
                        Noteworthy
                      </Badge>
                    </div>
                    <div className="absolute bottom-1 left-1">
                      <Badge className="bg-black text-white text-xs px-1 py-0.5">
                        Daily 3 minutes
                      </Badge>
                    </div>
                  </div>
                </div>
                <h3 className="font-semibold mb-2">Notely for Web</h3>
                <p className="text-xs text-gray-600">
                  Access your notes anywhere with a responsive web app that
                  works in every browser.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div> */}

      {/* Features Section */}
      {/* <div className="mt-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Smarter Notes. One Simple Space to
            <br />
            Capture, Organize & Remember
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Simplify the way you take notes. Write down your thoughts naturally,
            organize them into clear categories, and find everything in seconds.
            Declutter ideas to find flow, stay focused with smart organization,
            and never lose track of what matters most.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-48 h-32 bg-gray-200 rounded-2xl flex items-center justify-center">
                <div className="grid grid-cols-3 gap-2">
                  <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">N</span>
                  </div>
                  <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">@</span>
                  </div>
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">A</span>
                  </div>
                  <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">S</span>
                  </div>
                  <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">A</span>
                  </div>
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">D</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Brain className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Smart Note Capture</h3>
                <p className="text-sm text-gray-600">
                  Get bright ideas down fast. Smart text recognition without
                  losing flow. Capture thoughts as they come, then organize them
                  later.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Layers className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Adaptive Organization</h3>
                <p className="text-sm text-gray-600">
                  Your notes grow with you. Use smart search, categories, and
                  tags to connect ideas and find what you need instantly.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Simple & Flexible</h3>
                <p className="text-sm text-gray-600">
                  A tool that fits your style—whether for study, work, or
                  personal projects. Write how you think. And access from
                  anywhere, any time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div> */}

      {/* CTA Section */}
      <Card className="bg-muted rounded-3xl border-none shadow-none">
        <CardContent className="p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-serif tracking-tight">
            From book to brain — effortlessly
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Albuc helps you turn highlights into insights, and reading into
            clarity.
          </p>
          <Button asChild>
            <Link href="#pricing">Get Started</Link>
          </Button>
        </CardContent>
      </Card>

      {/* Footer */}
      <footer className="py-4 md:py-8">
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-2">
            <Link
              href="/"
              className="flex items-center space-x-2 cursor-pointer select-auto mr-4"
              tabIndex={0}
              aria-label="Go to Library"
            >
              <span className="text-2xl font-serif font-bold text-foreground flex items-center gap-2 select-text">
                <SquareLibrary className="w-6 h-6" />
                Albuc
              </span>
            </Link>
            <p className="text-sm text-gray-600">
              © {new Date().getFullYear()} Albuc. All rights reserved.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-12 text-sm">
            <div>
              <h4 className="font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-gray-600">
                <li>Features</li>
                <li>Pricing</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Resources</h4>
              <ul className="space-y-2 text-gray-600">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Contact</h4>
              <ul className="space-y-2 text-gray-600">
                <li>Email</li>
                <li>Instagram</li>
                <li>
                  X<span className="sr-only">X (Twitter)</span>
                </li>
                <li>TikTok</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
