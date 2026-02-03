import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Flame } from 'lucide-react';

export default function LandingPage() {
  const { login } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-ck-indigo via-ck-charcoal to-black">
      {/* Fixed header with login button */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4">
        <img
          src="/images/logo.png"
          alt="CanonKiln"
          className="h-8 w-auto"
        />
        <Button
          onClick={login}
          className="bg-ck-ember hover:bg-ck-ember/90 text-white font-medium"
        >
          Sign In
        </Button>
      </header>

      {/* Hero section */}
      <section className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
        {/* Kiln icon/imagery */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-ck-ember/20 blur-3xl rounded-full scale-150" />
          <div className="relative p-8 rounded-full bg-gradient-to-br from-ck-ember/30 to-ck-ember/10 border border-ck-ember/30">
            <Flame className="h-24 w-24 text-ck-ember" />
          </div>
        </div>

        {/* Logo */}
        <img
          src="/images/logo.png"
          alt="CanonKiln"
          className="h-32 w-auto mb-8"
        />

        {/* Headline */}
        <h1 className="text-4xl md:text-6xl font-heading text-white mb-4 max-w-3xl">
          Forge Games from Your Canon
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl">
          Transform your creative IP into games, books, and media.
          Build worlds, craft characters, and bring your stories to life.
        </p>

        {/* CTA Button */}
        <Button
          onClick={login}
          size="lg"
          className="bg-ck-ember hover:bg-ck-ember/90 text-white font-semibold text-lg px-8 py-6"
        >
          Get Started
        </Button>

        {/* Features preview */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl">
          <div className="p-6 rounded-lg bg-white/5 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-2">Build Universes</h3>
            <p className="text-sm text-gray-400">
              Create rich worlds with interconnected characters, places, and lore.
            </p>
          </div>
          <div className="p-6 rounded-lg bg-white/5 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-2">Design Products</h3>
            <p className="text-sm text-gray-400">
              Transform your IP into card games, board games, books, and more.
            </p>
          </div>
          <div className="p-6 rounded-lg bg-white/5 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-2">AI-Powered</h3>
            <p className="text-sm text-gray-400">
              Generate art, mechanics, and content with intelligent assistance.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
