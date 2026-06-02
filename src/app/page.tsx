import FormStepper from "@/components/FormStepper";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="pt-2 pb-1 text-center">
        <img
          src="/odin.png"
          alt="Odin"
          className="mx-auto mb-3 w-[108px] md:w-[144px] h-auto"
        />
        <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl text-text-primary tracking-wide mb-3">
          Odin&apos;s Eye
        </h1>
        <p className="text-text-secondary text-sm md:text-base max-w-md mx-auto leading-relaxed">
          A natal chart reading that sees beneath the surface.
          <br />
          <span className="text-text-muted">
            Your birth data. Your patterns. Your truth.
          </span>
        </p>
      </header>

      {/* Form */}
      <section className="flex-1 py-4">
        <FormStepper />
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-text-muted">
        <a
          href="https://www.mithryl.dev/"
          className="transition-colors hover:text-gold"
        >
          Mithryl Labs
        </a>
      </footer>
    </main>
  );
}
