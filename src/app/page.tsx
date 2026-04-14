import FormStepper from "@/components/FormStepper";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="pt-10 pb-1 text-center">
        <img
          src="/odinsark-clean.png"
          alt="Odinsark"
          className="mx-auto mb-6 w-[80px] md:w-[105px] h-auto invert"
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
        <p>Odinsark Labs LLC</p>
      </footer>
    </main>
  );
}
