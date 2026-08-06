const APP_VERSION = "0.1.10";

export function AppFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/40 bg-background/60 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-1 px-4 py-3 sm:flex-row">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
          v{APP_VERSION}
        </span>
        <span className="text-[10px] text-muted-foreground/60">
          © {year} FC Cup Arena — Powered by{" "}
          <a
            href="https://instagram.com/o.jmartinez"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-muted-foreground transition hover:text-primary"
          >
            @o.jmartinez
          </a>
        </span>
      </div>
    </footer>
  );
}
