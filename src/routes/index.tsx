import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Trophy, Users, Zap, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getTournamentByCode, useFcState } from "@/lib/fc-data";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  const tournaments = useFcState((s) => s.tournaments);
  const teams = useFcState((s) => s.teams);
  const [code, setCode] = useState("");

  const onAccess = (e: React.FormEvent) => {
    e.preventDefault();
    const t = getTournamentByCode(code.trim());
    if (!t) {
      toast.error("Torneio não encontrado", {
        description: "Verifique o código e tente novamente.",
      });
      return;
    }
    navigate({ to: "/t/$codigo", params: { codigo: t.codigo_unico } });
  };

  return (
    <div
      className="min-h-screen"
      style={{ backgroundImage: "var(--gradient-hero)" }}
    >
      {/* Header */}
      <header className="border-b border-border/60 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground shadow-[var(--shadow-neon)]">
              <Trophy className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate font-display text-lg font-black tracking-wider text-foreground">
                FC CUP ARENA
              </h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                EA Sports FC 26
              </p>
            </div>
          </div>
          <Badge variant="outline" className="border-primary/40 text-primary">
            Beta
          </Badge>
        </div>
      </header>

      {/* Hero access */}
      <section className="mx-auto max-w-2xl px-4 pb-10 pt-14 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
          <Zap className="h-3 w-3" /> Copa do Mundo · Grupos + Mata-Mata
        </div>
        <h2 className="text-4xl font-black leading-tight text-foreground sm:text-5xl">
          Entre na arena.<br />
          <span className="text-primary">Levante a taça.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground">
          Digite o código do torneio para se inscrever, ver grupos e acompanhar o
          mata-mata em tempo real.
        </p>

        <form
          onSubmit={onAccess}
          className="mx-auto mt-8 flex max-w-md flex-col gap-2 sm:flex-row"
        >
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Digite o código (ex: FC26-2026)"
            className="h-12 border-border bg-card text-center font-mono text-base tracking-widest uppercase placeholder:normal-case placeholder:tracking-normal"
          />
          <Button
            type="submit"
            className="h-12 bg-primary font-bold text-primary-foreground shadow-[var(--shadow-neon)] hover:bg-primary-glow"
          >
            Acessar <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </form>

        <Button asChild variant="outline" className="mt-4 border-primary/40 text-primary hover:bg-primary/10 hover:text-primary">
          <Link to="/criar">
            <Plus className="mr-1 h-4 w-4" /> Criar Torneio
          </Link>
        </Button>
      </section>

      {/* Torneios em destaque */}
      <section className="mx-auto max-w-5xl px-4 pb-16">
        <div className="mb-4 flex items-baseline justify-between">
          <h3 className="font-display text-sm font-bold uppercase tracking-widest text-muted-foreground">
            Torneios em Destaque
          </h3>
          <span className="text-xs text-muted-foreground">
            {tournaments.length} ativo(s)
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {tournaments.map((t) => {
            const tTeams = teams.filter((x) => x.torneio_id === t.id);
            const inscritos = tTeams.filter((x) => x.ocupado).length;
            return (
              <Card
                key={t.id}
                onClick={() =>
                  navigate({ to: "/t/$codigo", params: { codigo: t.codigo_unico } })
                }
                className="group cursor-pointer border-border bg-card p-4 transition hover:border-primary/60 hover:shadow-[var(--shadow-neon)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="truncate font-display text-base font-bold text-foreground">
                      {t.nome}
                    </h4>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                      {t.codigo_unico}
                    </p>
                  </div>
                  <StatusBadge status={t.status} />
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {inscritos}/{t.max_jogadores} vagas
                  </span>
                  <span className="font-semibold text-primary opacity-0 transition group-hover:opacity-100">
                    Acessar →
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${(inscritos / t.max_jogadores) * 100}%` }}
                  />
                </div>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    inscricoes_abertas: {
      label: "Inscrições Abertas",
      cls: "bg-primary/15 text-primary border-primary/40",
    },
    em_andamento: {
      label: "Em Andamento",
      cls: "bg-chart-3/15 text-chart-3 border-chart-3/40",
    },
    finalizado: {
      label: "Finalizado",
      cls: "bg-muted text-muted-foreground border-border",
    },
  };
  const m = map[status] ?? map.finalizado;
  return (
    <span
      className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${m.cls}`}
    >
      {m.label}
    </span>
  );
}
