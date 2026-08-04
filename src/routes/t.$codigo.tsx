import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  Copy,
  Trophy,
  Users,
  Lock,
  BookOpen,
  LayoutGrid,
  Swords,
  UserPlus,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getTournamentByCode,
  registerPlayer,
  useFcState,
  computeGroupStandings,
  getMatchWinner,
  formatMatchDate,
  GRUPOS,
  type Team,
  type Tournament,
  type Match,
} from "@/lib/fc-data";

export const Route = createFileRoute("/t/$codigo")({
  head: ({ params }) => ({
    meta: [
      { title: `Torneio ${params.codigo} — FC Cup Arena` },
      {
        name: "description",
        content: `Acesse o torneio ${params.codigo}: inscrição, grupos, mata-mata e regulamento no FC Cup Arena.`,
      },
      { property: "og:title", content: `Torneio ${params.codigo} — FC Cup Arena` },
      {
        property: "og:description",
        content: `Torneio EA Sports FC 26 — ${params.codigo}.`,
      },
    ],
  }),
  component: TournamentPage,
});

function TournamentPage() {
  const { codigo } = useParams({ from: "/t/$codigo" });
  const tournament = useFcState((s) =>
    s.tournaments.find(
      (t) => t.codigo_unico.toLowerCase() === codigo.toLowerCase(),
    ),
  );

  if (!tournament) {
    return <NotFound codigo={codigo} />;
  }
  return <TournamentInner tournament={tournament} />;
}

function NotFound({ codigo }: { codigo: string }) {
  return (
    <div className="grid min-h-screen place-items-center px-4 text-center">
      <div>
        <h1 className="font-display text-3xl font-black">Torneio não encontrado</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Nenhum torneio corresponde ao código{" "}
          <span className="font-mono text-foreground">{codigo}</span>.
        </p>
        <Button asChild className="mt-6">
          <Link to="/">
            <ArrowLeft className="mr-1 h-4 w-4" /> Voltar
          </Link>
        </Button>
      </div>
    </div>
  );
}

function TournamentInner({ tournament }: { tournament: Tournament }) {
  const teams = useFcState((s) =>
    s.teams.filter((t) => t.torneio_id === tournament.id),
  );
  const players = useFcState((s) =>
    s.players.filter((p) => p.torneio_id === tournament.id),
  );

  const inscritos = teams.filter((t) => t.ocupado).length;

  const copyLink = async () => {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/t/${tournament.codigo_unico}`
        : `/t/${tournament.codigo_unico}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado!", { description: url });
    } catch {
      toast.error("Não foi possível copiar");
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundImage: "var(--gradient-hero)" }}>
      {/* Top nav */}
      <div className="border-b border-border/60">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> FC Cup Arena
          </Link>
          <span className="rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-primary">
            {tournament.codigo_unico}
          </span>
        </div>
      </div>

      {/* Header */}
      <header className="mx-auto max-w-5xl px-4 pb-6 pt-8">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:flex sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-[var(--shadow-neon)]">
              <Trophy className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate font-display text-xl font-black leading-tight text-foreground sm:text-2xl">
                {tournament.nome}
              </h1>
              <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="h-3.5 w-3.5 text-primary" />
                <span className="font-bold text-foreground">
                  {inscritos}/{tournament.max_jogadores}
                </span>{" "}
                vagas preenchidas
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={copyLink}
            className="shrink-0 border-primary/40 text-primary hover:bg-primary/10 hover:text-primary"
          >
            <Copy className="mr-1 h-3.5 w-3.5" /> Copiar link
          </Button>
          <Button asChild size="sm" variant="ghost" className="shrink-0 text-xs text-muted-foreground hover:text-primary">
            <Link to="/t/$codigo/admin" params={{ codigo: tournament.codigo_unico }}>
              <Lock className="mr-1 h-3.5 w-3.5" /> Admin
            </Link>
          </Button>
        </div>

        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary-glow transition-all"
            style={{ width: `${(inscritos / tournament.max_jogadores) * 100}%` }}
          />
        </div>
      </header>

      {/* Tabs */}
      <main className="mx-auto max-w-5xl px-4 pb-24">
        <Tabs defaultValue="inscricao" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-card">
            <TabsTrigger value="inscricao" className="gap-1 text-xs">
              <UserPlus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Inscrição</span>
            </TabsTrigger>
            <TabsTrigger value="grupos" className="gap-1 text-xs">
              <LayoutGrid className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Grupos</span>
            </TabsTrigger>
            <TabsTrigger value="mata" className="gap-1 text-xs">
              <Swords className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Mata-Mata</span>
            </TabsTrigger>
            <TabsTrigger value="regulamento" className="gap-1 text-xs">
              <BookOpen className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Regulamento</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inscricao" className="mt-6">
            <RegistrationForm tournament={tournament} teams={teams} />
          </TabsContent>

          <TabsContent value="grupos" className="mt-6">
            <PublicGroups tournament={tournament} teams={teams} />
            <p className="mt-4 text-center text-xs text-muted-foreground">
              {players.length} jogador(es) confirmado(s)
            </p>
          </TabsContent>

          <TabsContent value="mata" className="mt-6">
            <PublicBracket tournament={tournament} teams={teams} />
          </TabsContent>

          <TabsContent value="regulamento" className="mt-6">
            <Card className="border-border bg-card p-6">
              <h3 className="mb-3 font-display text-lg font-bold uppercase tracking-wider text-primary">
                Regulamento
              </h3>
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-muted-foreground">
                {tournament.regulamento_texto}
              </pre>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function EmptyPanel({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="border-dashed border-border bg-card/50 p-10 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-muted text-muted-foreground">
        {icon}
      </div>
      <h4 className="mt-4 font-display text-base font-bold text-foreground">
        {title}
      </h4>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>
    </Card>
  );
}

/* ------------------------ Public groups & bracket ------------------------ */

function ScoreRow({ match, teams }: { match: Match; teams: Map<string, Team> }) {
  const a = teams.get(match.time_mandante_id);
  const b = teams.get(match.time_visitante_id);
  const done = match.status !== "pendente";
  const winner = getMatchWinner(match);
  return (
    <div
      className={[
        "rounded-lg border p-2.5 text-sm",
        done ? "border-primary/30 bg-primary/5" : "border-border bg-background/40",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={["flex min-w-0 flex-1 items-center gap-1.5", winner === a?.id ? "font-bold text-primary" : ""].join(" ")}>
          <span className="text-lg">{a?.escudo_url}</span>
          <span className="truncate">{a?.nome}</span>
        </span>
        <span className="shrink-0 font-mono text-sm font-bold">
          {done ? `${match.gols_mandante ?? 0} x ${match.gols_visitante ?? 0}` : "— x —"}
          {match.penaltis_mandante != null && match.penaltis_visitante != null && (
            <span className="ml-1 text-[10px] text-muted-foreground">
              ({match.penaltis_mandante}-{match.penaltis_visitante} pên.)
            </span>
          )}
        </span>
        <span className={["flex min-w-0 flex-1 items-center justify-end gap-1.5", winner === b?.id ? "font-bold text-primary" : ""].join(" ")}>
          <span className="truncate text-right">{b?.nome}</span>
          <span className="text-lg">{b?.escudo_url}</span>
        </span>
      </div>
      {match.data_jogo && (
        <div className="mt-1.5 flex items-center gap-1 text-[10px] uppercase tracking-widest text-muted-foreground">
          <Calendar className="h-3 w-3" /> {formatMatchDate(match.data_jogo)}
        </div>
      )}
    </div>
  );
}

function PublicGroups({ tournament, teams }: { tournament: Tournament; teams: Team[] }) {
  const matches = useFcState((s) =>
    s.matches.filter((m) => m.torneio_id === tournament.id && m.fase === "grupos"),
  );
  const teamMap = useMemo(() => new Map(teams.map((t) => [t.id, t])), [teams]);
  const anyGroup = teams.some((t) => t.grupo);

  if (!anyGroup) {
    return (
      <EmptyPanel
        icon={<LayoutGrid className="h-6 w-6" />}
        title="Grupos ainda não sorteados"
        description="O organizador ainda não definiu a divisão dos grupos."
      />
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {GRUPOS.map((g) => {
        const standings = computeGroupStandings(tournament.id, g);
        if (standings.length === 0) return null;
        const gm = matches.filter((m) => m.grupo === g).sort((a, b) => a.ordem - b.ordem);
        return (
          <Card key={g} className="border-border bg-card p-4">
            <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-widest text-primary">
              Grupo {g}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    <th className="py-1 text-left">Time</th>
                    {["P", "J", "V", "E", "D", "GP", "GC", "SG"].map((h) => (
                      <th key={h} className="w-7 py-1 text-right">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {standings.map((s, idx) => {
                    const t = teamMap.get(s.time_id);
                    return (
                      <tr key={s.time_id} className={idx < 2 ? "bg-primary/5" : ""}>
                        <td className="truncate py-1.5">
                          <span className="mr-1">{t?.escudo_url}</span>
                          <span className="text-xs font-semibold">{t?.nome}</span>
                        </td>
                        <td className="py-1.5 text-right font-bold">{s.P}</td>
                        <td className="py-1.5 text-right">{s.J}</td>
                        <td className="py-1.5 text-right">{s.V}</td>
                        <td className="py-1.5 text-right">{s.E}</td>
                        <td className="py-1.5 text-right">{s.D}</td>
                        <td className="py-1.5 text-right">{s.GP}</td>
                        <td className="py-1.5 text-right">{s.GC}</td>
                        <td className="py-1.5 text-right">{s.SG}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {gm.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Resultados</p>
                {gm.map((m) => (
                  <ScoreRow key={m.id} match={m} teams={teamMap} />
                ))}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

function PublicBracket({ tournament, teams }: { tournament: Tournament; teams: Team[] }) {
  const matches = useFcState((s) =>
    s.matches.filter((m) => m.torneio_id === tournament.id && m.fase !== "grupos"),
  );
  const teamMap = useMemo(() => new Map(teams.map((t) => [t.id, t])), [teams]);
  const q = matches.filter((m) => m.fase === "quartas").sort((a, b) => a.ordem - b.ordem);
  const s = matches.filter((m) => m.fase === "semi").sort((a, b) => a.ordem - b.ordem);
  const f = matches.filter((m) => m.fase === "final");

  if (q.length === 0) {
    return (
      <EmptyPanel
        icon={<Swords className="h-6 w-6" />}
        title="Mata-mata bloqueado"
        description={`Formato: ${tournament.formato_mata_mata === "ida_e_volta" ? "Ida e Volta" : "Jogo Único"}. Disponível após o encerramento da fase de grupos.`}
      />
    );
  }

  const champion = f[0] ? getMatchWinner(f[0]) : null;

  return (
    <div className="space-y-4">
      {champion && (
        <Card className="border-primary/40 bg-primary/10 p-5 text-center shadow-[var(--shadow-neon)]">
          <Trophy className="mx-auto h-7 w-7 text-primary" />
          <p className="mt-1 text-[10px] uppercase tracking-widest text-primary">Campeão</p>
          <p className="mt-1 font-display text-xl font-black">
            {teamMap.get(champion)?.escudo_url} {teamMap.get(champion)?.nome}
          </p>
        </Card>
      )}
      <div className="grid gap-4 md:grid-cols-3">
        {([
          ["Quartas de Final", q, ""],
          ["Semifinal", s, "Aguardando quartas"],
          ["Final", f, "Aguardando semifinal"],
        ] as const).map(([title, list, placeholder]) => (
          <div key={title}>
            <h3 className="mb-2 font-display text-sm font-bold uppercase tracking-widest text-primary">{title}</h3>
            <div className="space-y-2">
              {list.length === 0 && placeholder && (
                <div className="rounded-lg border border-dashed border-border bg-card/40 p-4 text-center text-xs text-muted-foreground">
                  {placeholder}
                </div>
              )}
              {list.map((m) => (
                <ScoreRow key={m.id} match={m} teams={teamMap} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------ Registration form ------------------------ */

function RegistrationForm({
  tournament,
  teams,
}: {
  tournament: Tournament;
  teams: Team[];
}) {
  const [nome, setNome] = useState("");
  const [nick, setNick] = useState("");
  const [mes, setMes] = useState("");
  const [ano, setAno] = useState("");
  const [celular, setCelular] = useState("");
  const [timeId, setTimeId] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<
    | null
    | { nome: string; nick: string; time: string }
  >(null);

  const meses = [
    "01", "02", "03", "04", "05", "06",
    "07", "08", "09", "10", "11", "12",
  ];
  const anoAtual = new Date().getFullYear();
  const anos = Array.from({ length: 60 }, (_, i) => String(anoAtual - 12 - i));

  const activeTeams = useMemo(
    () => teams.filter((t) => t.ativo_pelo_admin),
    [teams],
  );

  const formatPhone = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return `+55 (${digits}`;
    if (digits.length <= 7)
      return `+55 (${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `+55 (${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !nick.trim()) {
      toast.error("Preencha nome e gamertag");
      return;
    }
    if (!mes || !ano) {
      toast.error("Informe o mês e ano de nascimento");
      return;
    }
    if (!timeId) {
      toast.error("Selecione um time");
      return;
    }

    const res = registerPlayer({
      torneio_id: tournament.id,
      nome_completo: nome.trim(),
      gamertag_nick: nick.trim(),
      mes_ano_nascimento: `${mes}/${ano}`,
      celular: celular.trim() || undefined,
      time_id: timeId,
    });

    if (!res.ok) {
      toast.error("Inscrição bloqueada", { description: res.error });
      return;
    }

    toast.success("Inscrição confirmada!", {
      description: `${res.player.nome_completo} com ${res.team.nome}`,
    });
    setConfirmed({
      nome: res.player.nome_completo,
      nick: res.player.gamertag_nick,
      time: res.team.nome,
    });
    setNome("");
    setNick("");
    setMes("");
    setAno("");
    setCelular("");
    setTimeId(null);
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <Card className="border-border bg-card p-5">
        <h3 className="mb-4 font-display text-sm font-bold uppercase tracking-widest text-primary">
          Seus dados
        </h3>

        <div className="grid gap-4">
          <div>
            <Label htmlFor="nome">Nome completo *</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: João da Silva"
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="nick">Gamertag / Nick no Jogo *</Label>
            <Input
              id="nick"
              value={nick}
              onChange={(e) => setNick(e.target.value)}
              placeholder="PSN / Xbox Live / EA ID"
              className="mt-1.5 font-mono"
            />
          </div>

          <div>
            <Label>Mês / Ano de nascimento *</Label>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              <Select value={mes} onValueChange={setMes}>
                <SelectTrigger>
                  <SelectValue placeholder="Mês" />
                </SelectTrigger>
                <SelectContent>
                  {meses.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={ano} onValueChange={setAno}>
                <SelectTrigger>
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                  {anos.map((a) => (
                    <SelectItem key={a} value={a}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="cel">
              Celular <span className="text-muted-foreground">(opcional)</span>
            </Label>
            <Input
              id="cel"
              value={celular}
              onChange={(e) => setCelular(formatPhone(e.target.value))}
              placeholder="+55 (00) 00000-0000"
              className="mt-1.5 font-mono"
              inputMode="tel"
            />
          </div>
        </div>
      </Card>

      <Card className="border-border bg-card p-5">
        <div className="mb-4 flex items-baseline justify-between">
          <h3 className="font-display text-sm font-bold uppercase tracking-widest text-primary">
            Escolha seu time
          </h3>
          <span className="text-xs text-muted-foreground">
            {activeTeams.filter((t) => !t.ocupado).length} livres
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {activeTeams.map((team) => {
            const disabled = team.ocupado;
            const selected = timeId === team.id;
            return (
              <button
                key={team.id}
                type="button"
                disabled={disabled}
                onClick={() => setTimeId(team.id)}
                className={[
                  "group relative flex flex-col items-center gap-2 rounded-xl border p-3 text-center transition",
                  disabled
                    ? "cursor-not-allowed border-border bg-muted/40 opacity-50 grayscale"
                    : selected
                      ? "border-primary bg-primary/15 shadow-[var(--shadow-neon)]"
                      : "border-border bg-background/40 hover:border-primary/60 hover:bg-primary/5",
                ].join(" ")}
              >
                <div className="text-3xl leading-none">{team.escudo_url}</div>
                <div className="min-w-0 text-xs font-bold text-foreground">
                  <span className="line-clamp-2">{team.nome}</span>
                </div>
                {disabled && (
                  <span className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-destructive/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-destructive">
                    <Lock className="h-2.5 w-2.5" /> Indisponível
                  </span>
                )}
                {selected && !disabled && (
                  <span className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-3 w-3" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </Card>

      <Button
        type="submit"
        className="h-12 w-full bg-primary text-base font-bold text-primary-foreground shadow-[var(--shadow-neon)] hover:bg-primary-glow"
      >
        Confirmar inscrição
      </Button>

      <Dialog open={!!confirmed} onOpenChange={(o) => !o && setConfirmed(null)}>
        <DialogContent className="border-primary/40 bg-card">
          <DialogHeader>
            <div className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-neon)]">
              <Check className="h-6 w-6" />
            </div>
            <DialogTitle className="text-center font-display text-xl">
              Inscrição confirmada!
            </DialogTitle>
            <DialogDescription className="text-center">
              Boa sorte na {tournament.nome}. Nos vemos em campo.
            </DialogDescription>
          </DialogHeader>
          {confirmed && (
            <div className="space-y-1 rounded-lg border border-border bg-background/60 p-4 text-sm">
              <Row k="Jogador" v={confirmed.nome} />
              <Row k="Gamertag" v={confirmed.nick} mono />
              <Row k="Time" v={confirmed.time} highlight />
            </div>
          )}
          <DialogFooter>
            <Button
              className="w-full bg-primary text-primary-foreground hover:bg-primary-glow"
              onClick={() => setConfirmed(null)}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
}

function Row({
  k,
  v,
  mono,
  highlight,
}: {
  k: string;
  v: string;
  mono?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs uppercase tracking-widest text-muted-foreground">
        {k}
      </span>
      <span
        className={[
          "min-w-0 truncate text-right font-semibold",
          mono && "font-mono",
          highlight ? "text-primary" : "text-foreground",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {v}
      </span>
    </div>
  );
}