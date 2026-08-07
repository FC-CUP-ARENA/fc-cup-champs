import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center p-6">
        {/* O 404 ganhou um peso extra e uma animação sutil se quiser adicionar */}
        <h1 className="text-8xl font-black tracking-tighter text-foreground animate-pulse">
          404
        </h1>

        {/* Título mais jovem e direto */}
        <h2 className="mt-4 text-2xl font-black text-foreground">
          Ué, sumiu! 🗺️
        </h2>

        {/* Texto leve e divertido */}
        <p className="mt-3 text-base text-muted-foreground leading-relaxed">
          Essa página simplesmente deu um perdido na gente. Ou ela mudou de nome, ou foi dar um rolê na internet e nunca mais voltou.
        </p>

        {/* Botão com clique mais convidativo, cantos modernos e efeito de hover dinâmico */}
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:scale-105 active:scale-95"
          >
            🚀 Resgatar meu site
          </Link>
        </div>
      </div>

    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center p-4">
  {/* Título com mais atitude */}
  <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
    Eita, travou tudo! 🤯
  </h1>
  
  {/* Mensagem descontraída e direta */}
  <p className="mt-3 text-base text-muted-foreground leading-relaxed">
    Algum cabo desconectou ou o sistema resolveu tirar um cochilo. Bora tentar de novo ou voltar para a segurança do início?
  </p>
  
  {/* Botões com cantos modernos (rounded-xl) e efeitos de clique (hover:scale) */}
  <div className="mt-8 flex flex-wrap justify-center gap-3">
    <button
      onClick={() => {
        router.invalidate();
        reset();
      }}
      className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 hover:scale-105 active:scale-95 shadow-lg shadow-primary/10"
    >
      🔄 Tenta de novo
    </button>
    
    <a
      href="/"
      className="inline-flex items-center justify-center rounded-xl border-2 border-input bg-background px-6 py-3 text-sm font-bold text-foreground transition-all hover:bg-accent hover:scale-105 active:scale-95"
    >
      🏠 Ir pro início
    </a>
  </div>
</div>

    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "FC Cup Arena — Torneios e-Sports" },
      {
        name: "description",
        content:
          "Plataforma de torneios e-Sports no formato Copa do Mundo: fase de grupos, mata-mata e inscrição por gamertag.",
      },
      { name: "author", content: "FC Cup Arena" },
      { property: "og:title", content: "FC Cup Arena — Torneios e-Sports" },
      {
        property: "og:description",
        content:
          "Organize e dispute campeonatos ao estilo Copa do Mundo com fase de grupos e mata-mata.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;900&family=Rajdhani:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <Toaster richColors position="top-center" />
    </QueryClientProvider>
  );
}
