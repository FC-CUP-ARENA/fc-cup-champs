import { createFileRoute, Link, useParams, useSearch } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Copy, KeyRound, Trash2, Bot, Save, AlertTriangle, Trophy } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  useFcState,
  setTournamentStatus,
  updateRegulamento,
  toggleTeamAtivo,
  deletePlayer,
  fillWithBots,
  saveMatchScore,
  launchWO,
  computeGroupStandings,
  getMatchWinner,
  calcularIdade,
  type Tournament,
  type Match,
  type Team,
} from "@/lib/fc-data";

type Search = { key?: string };

export const Route = createFileRoute("/t_/$codigo/admin")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    key: typeof s.key === "string" ? s.key : undefined,
  }),
  head: ({ params }) => ({
    meta: [
      { title: `Admin — ${params.codigo}` },
      { name: "robots", content: "noindex" },
      { name: "description", content: "Painel administrativo do torneio." },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { codigo } = useParams({ from: "/t_/$codigo/admin" });
  const { key } = useSearch({ from: "/t_/$codigo/admin" });
  const tournament = useFcState((s) =>
    s.tournaments.find((t) => t.codigo_unico.toLowerCase() === codigo.toLowerCase()),
  );

  const [unlocked, setUnlocked] = useState(false);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (tournament && key && key === tournament.chave_mestra_admin) {
      setUnlocked(true);
    }
  }, [tournament, key]);

  if (!tournament) {
    return (
      <div className="grid min-h-screen place-items-center px-4 text-center">
        <div>
          <h1 className="font-display text-2xl font-black">Torneio não encontrado</h1>
          <Button asChild className="mt-4"><Link to="/"><ArrowLeft className="mr-1 h-4 w-4" /> Voltar</Link></Button>
        </div>
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="grid min-h-screen place-items-center px-4">
        <Card className="w-full max-w-sm border-primary/30 bg-card p-6">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-neon)]">
            <KeyRound className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-center font-display text-lg font-black uppercase tracking-widest">
            Painel Admin
          </h1>
          <p className="mt-1 text-center text-xs text-muted-foreground">
            Informe a Chave Mestra do organizador
          </p>
          <form
            className="mt-5 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (input.trim() === tournament.chave_mestra_admin) {
                setUnlocked(true);
              } else {
                toast.error("Chave incorreta");
              }
            }}
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="ADM-XXXX"
              className="text-center font-mono"
            />
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary-glow">
              Entrar
            </Button>
          </form>
          <Link to="/t/$codigo" params={{ codigo }} className="mt-4 block text-center text-xs text-muted-foreground hover:text-foreground">
            ← Voltar ao torneio
          </Link>
        </Card>
      </div>
    );
  }

  return <AdminInner tournament={tournament} />;
}

function AdminInner({ tournament }: { tournament: Tournament }) {
  const teams = useFcState((s) => s.teams.filter((t) => t.torneio_id === tournament.id));
  const players = useFcState((s) => s.players.filter((p) => p.torneio_id === tournament.id));
  const matches = useFcState((s) => s.matches.filter((m) => m.torneio_id === tournament.id));

  const copySecretLink = async () => {
    const url = typeof window !== "undefined"
      ? `${window.location.origin}/t/${tournament.codigo_unico}/admin?key=${tournament.chave_mestra_admin}`
      : "";
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link secreto copiado");
    } catch { toast.error("Falha ao copiar"); }
  };

  return (
    <div className="min-h-screen" style={{ backgroundImage: "var(--gradient-hero)" }}>
      <div className="border-b border-border/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/t/$codigo" params={{ codigo: tournament.codigo_unico }} className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Área pública
          </Link>
          <span className="rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-primary">
            ADMIN · {tournament.codigo_unico}
          </span>
        </div>
      </div>

      <header className="mx-auto max-w-6xl px-4 pb-4 pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-[var(--shadow-neon)]">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-xl font-black leading-tight">{tournament.nome}</h1>
              <p className="text-xs text-muted-foreground">Painel do Organizador</p>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={copySecretLink} className="border-primary/40 text-primary hover:bg-primary/10 hover:text-primary">
            <Copy className="mr-1 h-3.5 w-3.5" /> Copiar Link Secreto
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-24">
        <Tabs defaultValue="config" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-card">
            <TabsTrigger value="config" className="text-xs">Configuração</TabsTrigger>
            <TabsTrigger value="inscritos" className="text-xs">Inscritos</TabsTrigger>
            <TabsTrigger value="grupos" className="text-xs">Grupos</TabsTrigger>
            <TabsTrigger value="mata" className="text-xs">Mata-Mata</TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="mt-6 space-y-6">
            <ConfigPanel tournament={tournament} teams={teams} />
          </TabsContent>
          <TabsContent value="inscritos" className="mt-6">
            <InscritosPanel tournament={tournament} teams={teams} players={players} />
          </TabsContent>
          <TabsContent value="grupos" className="mt-6 space-y-6">
            <GroupsPanel tournament={tournament} teams={teams} matches={matches} />
          </TabsContent>
          <TabsContent value="mata" className="mt-6">
            <BracketPanel tournament={tournament} teams={teams} matches={matches} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

/* ---- Config ---- */
function ConfigPanel({ tournament, teams }: { tournament: Tournament; teams: Team[] }) {
  const [reg, setReg] = useState(tournament.regulamento_texto);

  return (
    <>
      <Card className="border-border bg-card p-5">
        <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-widest text-primary">Status do Torneio</h3>
        <div className="flex flex-wrap gap-2">
          {(["inscricoes_abertas", "em_andamento", "finalizado"] as const).map((s) => (
            <Button
              key={s}
              size="sm"
              variant={tournament.status === s ? "default" : "outline"}
              onClick={() => { setTournamentStatus(tournament.id, s); toast.success("Status atualizado"); }}
              className={tournament.status === s ? "bg-primary text-primary-foreground hover:bg-primary-glow" : ""}
            >
              {s === "inscricoes_abertas" ? "Inscrições Abertas" : s === "em_andamento" ? "Em Andamento" : "Finalizado"}
            </Button>
          ))}
        </div>
      </Card>

      <Card className="border-border bg-card p-5">
        <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-widest text-primary">Regulamento</h3>
        <Textarea value={reg} onChange={(e) => setReg(e.target.value)} className="min-h-40" />
        <Button
          size="sm"
          className="mt-3 bg-primary text-primary-foreground hover:bg-primary-glow"
          onClick={() => { updateRegulamento(tournament.id, reg); toast.success("Regulamento salvo"); }}
        >
          <Save className="mr-1 h-3.5 w-3.5" /> Salvar regulamento
        </Button>
      </Card>

      <Card className="border-border bg-card p-5">
        <div className="mb-3 flex items-baseline justify-between">
          <h3 className="font-display text-sm font-bold uppercase tracking-widest text-primary">Catálogo de Times</h3>
          <span className="text-xs text-muted-foreground">{teams.filter((t) => t.ativo_pelo_admin).length}/{teams.length} ativos</span>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((t) => (
            <div key={t.id} className="flex items-center justify-between rounded-lg border border-border bg-background/40 p-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-2xl">{t.escudo_url}</span>
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold">{t.nome}</div>
                  {t.ocupado && <div className="text-[10px] uppercase tracking-widest text-destructive">Ocupado</div>}
                </div>
              </div>
              <Switch checked={t.ativo_pelo_admin} onCheckedChange={(v) => toggleTeamAtivo(t.id, v)} />
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

/* ---- Inscritos ---- */
function InscritosPanel({
  tournament, teams, players,
}: { tournament: Tournament; teams: Team[]; players: ReturnType<typeof useFcState<any>> }) {
  const teamMap = useMemo(() => new Map(teams.map((t) => [t.id, t])), [teams]);
  return (
    <Card className="border-border bg-card p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-sm font-bold uppercase tracking-widest text-primary">
          Inscritos ({players.length}/{tournament.max_jogadores})
        </h3>
        <Button
          size="sm" variant="outline"
          onClick={() => { fillWithBots(tournament.id); toast.success("Vagas preenchidas com BOTs"); }}
          disabled={players.length >= tournament.max_jogadores}
          className="border-primary/40 text-primary hover:bg-primary/10 hover:text-primary"
        >
          <Bot className="mr-1 h-3.5 w-3.5" /> Preencher com BOT/W.O.
        </Button>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Gamertag</TableHead>
              <TableHead>Idade</TableHead>
              <TableHead>Celular</TableHead>
              <TableHead>Time</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.map((p: any) => {
              const team = teamMap.get(p.time_id);
              const idade = calcularIdade(p.mes_ano_nascimento);
              return (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.nome_completo}</TableCell>
                  <TableCell className="font-mono text-xs">{p.gamertag_nick}</TableCell>
                  <TableCell>{idade ?? "—"}</TableCell>
                  <TableCell className="font-mono text-xs">{p.celular || "—"}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1">
                      <span className="text-lg">{team?.escudo_url}</span>
                      <span className="text-xs">{team?.nome}</span>
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm" variant="ghost"
                      onClick={() => { deletePlayer(p.id); toast.success("Inscrito removido"); }}
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {players.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center text-sm text-muted-foreground">Nenhum inscrito ainda.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

/* ---- Groups / Standings + Group matches ---- */
function GroupsPanel({
  tournament, teams, matches,
}: { tournament: Tournament; teams: Team[]; matches: Match[] }) {
  const teamMap = useMemo(() => new Map(teams.map((t) => [t.id, t])), [teams]);
  const groupMatches = matches.filter((m) => m.fase === "grupos");
  if (groupMatches.length === 0) {
    return <p className="text-center text-sm text-muted-foreground">Sem partidas de grupos. Defina o status para "Em Andamento".</p>;
  }
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {(["A", "B", "C", "D"] as const).map((g) => {
        const standings = computeGroupStandings(tournament.id, g);
        const gm = groupMatches.filter((m) => m.grupo === g).sort((a, b) => a.ordem - b.ordem);
        return (
          <Card key={g} className="border-border bg-card p-4">
            <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-widest text-primary">Grupo {g}</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead className="text-right">P</TableHead>
                    <TableHead className="text-right">J</TableHead>
                    <TableHead className="text-right">V</TableHead>
                    <TableHead className="text-right">E</TableHead>
                    <TableHead className="text-right">D</TableHead>
                    <TableHead className="text-right">GP</TableHead>
                    <TableHead className="text-right">GC</TableHead>
                    <TableHead className="text-right">SG</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {standings.map((s, idx) => {
                    const t = teamMap.get(s.time_id);
                    const classifica = idx < 2;
                    return (
                      <TableRow key={s.time_id} className={classifica ? "bg-primary/5" : ""}>
                        <TableCell className="font-medium">
                          <span className="mr-1">{t?.escudo_url}</span>
                          {t?.nome}
                          {classifica && <Badge className="ml-2 bg-primary/20 text-primary hover:bg-primary/20">Classificado</Badge>}
                        </TableCell>
                        <TableCell className="text-right font-bold">{s.P}</TableCell>
                        <TableCell className="text-right">{s.J}</TableCell>
                        <TableCell className="text-right">{s.V}</TableCell>
                        <TableCell className="text-right">{s.E}</TableCell>
                        <TableCell className="text-right">{s.D}</TableCell>
                        <TableCell className="text-right">{s.GP}</TableCell>
                        <TableCell className="text-right">{s.GC}</TableCell>
                        <TableCell className="text-right">{s.SG}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4 space-y-2">
              {gm.map((m) => (
                <MatchCard key={m.id} match={m} teams={teamMap} />
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

/* ---- Bracket ---- */
function BracketPanel({
  tournament, teams, matches,
}: { tournament: Tournament; teams: Team[]; matches: Match[] }) {
  const teamMap = useMemo(() => new Map(teams.map((t) => [t.id, t])), [teams]);
  const q = matches.filter((m) => m.fase === "quartas").sort((a, b) => a.ordem - b.ordem);
  const s = matches.filter((m) => m.fase === "semi").sort((a, b) => a.ordem - b.ordem);
  const f = matches.filter((m) => m.fase === "final");

  if (q.length === 0) {
    return (
      <Card className="border-dashed border-border bg-card/50 p-10 text-center">
        <AlertTriangle className="mx-auto h-6 w-6 text-muted-foreground" />
        <p className="mt-3 text-sm text-muted-foreground">Chave será gerada após todas as partidas da fase de grupos.</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <BracketColumn title="Quartas de Final" matches={q} teams={teamMap} />
      <BracketColumn title="Semifinal" matches={s} teams={teamMap} placeholder="Aguardando quartas" />
      <BracketColumn title="Final" matches={f} teams={teamMap} placeholder="Aguardando semifinal" champion />
    </div>
  );
}

function BracketColumn({
  title, matches, teams, placeholder, champion,
}: { title: string; matches: Match[]; teams: Map<string, Team>; placeholder?: string; champion?: boolean }) {
  return (
    <div>
      <h3 className="mb-2 font-display text-sm font-bold uppercase tracking-widest text-primary">{title}</h3>
      <div className="space-y-3">
        {matches.length === 0 && placeholder && (
          <div className="rounded-lg border border-dashed border-border bg-card/40 p-4 text-center text-xs text-muted-foreground">{placeholder}</div>
        )}
        {matches.map((m) => (
          <MatchCard key={m.id} match={m} teams={teams} />
        ))}
        {champion && matches[0] && getMatchWinner(matches[0]) && (
          <Card className="border-primary/40 bg-primary/10 p-4 text-center shadow-[var(--shadow-neon)]">
            <Trophy className="mx-auto h-6 w-6 text-primary" />
            <p className="mt-1 text-[10px] uppercase tracking-widest text-primary">Campeão</p>
            <p className="mt-1 font-display text-lg font-black">
              {teams.get(getMatchWinner(matches[0])!)?.escudo_url} {teams.get(getMatchWinner(matches[0])!)?.nome}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

/* ---- Match Card ---- */
function MatchCard({ match, teams }: { match: Match; teams: Map<string, Team> }) {
  const [gm, setGm] = useState<string>(match.gols_mandante?.toString() ?? "");
  const [gv, setGv] = useState<string>(match.gols_visitante?.toString() ?? "");
  const [pm, setPm] = useState<string>(match.penaltis_mandante?.toString() ?? "");
  const [pv, setPv] = useState<string>(match.penaltis_visitante?.toString() ?? "");
  const [woOpen, setWoOpen] = useState(false);

  useEffect(() => {
    setGm(match.gols_mandante?.toString() ?? "");
    setGv(match.gols_visitante?.toString() ?? "");
    setPm(match.penaltis_mandante?.toString() ?? "");
    setPv(match.penaltis_visitante?.toString() ?? "");
  }, [match.id, match.status]);

  const isKO = match.fase !== "grupos";
  const tied = gm !== "" && gv !== "" && Number(gm) === Number(gv);
  const showPens = isKO && tied;

  const mandante = teams.get(match.time_mandante_id);
  const visitante = teams.get(match.time_visitante_id);

  const save = () => {
    if (gm === "" || gv === "") { toast.error("Preencha o placar"); return; }
    const res = saveMatchScore(
      match.id, Number(gm), Number(gv),
      showPens && pm !== "" ? Number(pm) : null,
      showPens && pv !== "" ? Number(pv) : null,
    );
    if (!res.ok) toast.error(res.error || "Erro");
    else toast.success("Placar salvo");
  };

  return (
    <div className={[
      "rounded-lg border p-3",
      match.status === "pendente" ? "border-border bg-background/40" : "border-primary/30 bg-primary/5",
    ].join(" ")}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="text-lg">{mandante?.escudo_url}</span>
          <span className="truncate text-sm font-semibold">{mandante?.nome}</span>
        </div>
        <div className="flex items-center gap-1">
          <Input value={gm} onChange={(e) => setGm(e.target.value.replace(/\D/g, ""))} className="h-8 w-11 text-center font-mono" inputMode="numeric" />
          <span className="text-xs text-muted-foreground">x</span>
          <Input value={gv} onChange={(e) => setGv(e.target.value.replace(/\D/g, ""))} className="h-8 w-11 text-center font-mono" inputMode="numeric" />
        </div>
        <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
          <span className="truncate text-right text-sm font-semibold">{visitante?.nome}</span>
          <span className="text-lg">{visitante?.escudo_url}</span>
        </div>
      </div>

      {showPens && (
        <div className="mt-2 flex items-center justify-center gap-2">
          <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Pênaltis</Label>
          <Input value={pm} onChange={(e) => setPm(e.target.value.replace(/\D/g, ""))} className="h-7 w-11 text-center font-mono" inputMode="numeric" />
          <span className="text-xs text-muted-foreground">x</span>
          <Input value={pv} onChange={(e) => setPv(e.target.value.replace(/\D/g, ""))} className="h-7 w-11 text-center font-mono" inputMode="numeric" />
        </div>
      )}

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[9px] uppercase tracking-widest">
            {match.status === "pendente" ? "Pendente" : match.status === "wo" ? "W.O." : "Concluído"}
          </Badge>
        </div>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => setWoOpen(true)} className="h-7 text-[10px] text-destructive hover:bg-destructive/10 hover:text-destructive">
            W.O.
          </Button>
          <Button size="sm" onClick={save} className="h-7 bg-primary text-[10px] text-primary-foreground hover:bg-primary-glow">
            <Save className="mr-1 h-3 w-3" /> Salvar
          </Button>
        </div>
      </div>

      <Dialog open={woOpen} onOpenChange={setWoOpen}>
        <DialogContent className="border-border bg-card">
          <DialogHeader>
            <DialogTitle>Lançar W.O.</DialogTitle>
            <DialogDescription>Selecione quem vence por W.O. (3x0).</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => { launchWO(match.id, "mandante"); toast.success("W.O. registrado"); setWoOpen(false); }}>
              {mandante?.nome} vence
            </Button>
            <Button variant="outline" onClick={() => { launchWO(match.id, "visitante"); toast.success("W.O. registrado"); setWoOpen(false); }}>
              {visitante?.nome} vence
            </Button>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setWoOpen(false)}>Cancelar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}