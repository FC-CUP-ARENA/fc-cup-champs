import { createFileRoute, Link, useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Copy, KeyRound, Trash2, Bot, Save, TriangleAlert as AlertTriangle, Trophy, Shuffle, RefreshCw, Eraser } from "lucide-react";
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
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  useFcState,
  setTournamentStatus,
  updateRegulamento,
  deleteTournament,
  toggleTeamAtivo,
  deletePlayer,
  fillWithBots,
  saveMatchScore,
  launchWO,
  computeGroupStandings,
  getMatchWinner,
  getTieWinner,
  calcularIdade,
  drawGroups,
  drawDirectKnockout,
  clearGroups,
  generateGroupMatches,
  setTeamGroup,
  setMatchDate,
  hasTournamentStarted,
  setRegistrationDeadline,
  GRUPOS,
  type Tournament,
  type Match,
  type Team,
  type Player,
} from "@/lib/fc-data";
import { TeamCrest } from "@/components/team-crest";

type Search = { key?: string };

function toLocalInput(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60_000);
  return local.toISOString().slice(0, 16);
}

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
  const [deadline, setDeadline] = useState<string>(tournament.data_limite_inscricoes ?? "");
  const started = useFcState((s) => hasTournamentStarted(tournament.id));
  const navigate = useNavigate();

  return (
    <>
      <Card className="border-border bg-card p-5">
        <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-widest text-primary">Status do Torneio</h3>
        <div className="flex flex-wrap gap-2">
          {(["inscricoes_abertas", "em_andamento", "finalizado"] as const).map((s) => {
            const locked = s === "inscricoes_abertas" && started;
            return (
              <Button
                key={s}
                size="sm"
                variant={tournament.status === s ? "default" : "outline"}
                disabled={locked}
                onClick={() => { setTournamentStatus(tournament.id, s); toast.success("Status atualizado"); }}
                className={tournament.status === s ? "bg-primary text-primary-foreground hover:bg-primary-glow" : ""}
                title={locked ? "Inscrições encerradas: o torneio já começou" : undefined}
              >
                {s === "inscricoes_abertas" ? "Inscrições Abertas" : s === "em_andamento" ? "Em Andamento" : "Finalizado"}
              </Button>
            );
          })}
        </div>
        {started && (
          <p className="mt-3 text-xs text-muted-foreground">
            Inscrições não podem mais ser reabertas: já existe pelo menos uma partida concluída ou de W.O.
          </p>
        )}
      </Card>

      <Card className="border-border bg-card p-5">
        <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-widest text-primary">Data Limite de Inscrição</h3>
        <p className="mb-3 text-xs text-muted-foreground">
          Defina até quando os jogadores podem se inscrever. Após essa data, o formulário público fica bloqueado.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            type="datetime-local"
            value={deadline ? toLocalInput(deadline) : ""}
            onChange={(e) => {
              setDeadline(e.target.value);
              setRegistrationDeadline(tournament.id, e.target.value ? new Date(e.target.value).toISOString() : null);
            }}
            className="h-9 max-w-xs text-sm"
          />
          {deadline && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => { setDeadline(""); setRegistrationDeadline(tournament.id, null); toast.success("Data limite removida"); }}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              Remover data limite
            </Button>
          )}
        </div>
        {deadline && (
          <p className="mt-2 text-xs text-muted-foreground">
            Inscrições encerram em {new Date(deadline).toLocaleString("pt-BR", { dateStyle: "long", timeStyle: "short" })}.
          </p>
        )}
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

      <Card className="border-destructive/40 bg-destructive/5 p-5">
        <h3 className="mb-2 font-display text-sm font-bold uppercase tracking-widest text-destructive">Zona de Perigo</h3>
        <p className="mb-3 text-xs text-muted-foreground">
          Excluir o torneio remove definitivamente times, inscritos e partidas. Esta ação não pode ser desfeita.
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="sm" variant="destructive">
              <Trash2 className="mr-1 h-3.5 w-3.5" /> Excluir torneio
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir "{tournament.nome}"?</AlertDialogTitle>
              <AlertDialogDescription>
                Todos os dados do torneio {tournament.codigo_unico} — times, inscritos e partidas — serão apagados
                permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  deleteTournament(tournament.id);
                  toast.success("Torneio excluído");
                  navigate({ to: "/" });
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Excluir definitivamente
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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
                <TeamCrest src={t.escudo_url} alt={t.nome} size={32} />
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
}: { tournament: Tournament; teams: Team[]; players: Player[] }) {
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
            {players.map((p) => {
              const team = teamMap.get(p.time_id);
              const idade = calcularIdade(p.mes_ano_nascimento);
              return (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.nome_completo}</TableCell>
                  <TableCell className="font-mono text-xs">{p.gamertag_nick}</TableCell>
                  <TableCell>{idade ?? "—"}</TableCell>
                  <TableCell className="font-mono text-xs">{p.celular || "—"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <TeamCrest src={team?.escudo_url ?? ""} alt={team?.nome ?? ""} size={24} />
                      <div className="min-w-0">
                        <div className="truncate text-xs font-bold">{p.gamertag_nick}</div>
                        <div className="truncate text-[10px] text-muted-foreground">{team?.nome}</div>
                      </div>
                    </div>
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
  const players = useFcState((s) => s.players.filter((p) => p.torneio_id === tournament.id));
  const teamMap = useMemo(() => new Map(teams.map((t) => [t.id, t])), [teams]);
  const playerByTeam = useMemo(() => new Map(players.map((p) => [p.time_id, p])), [players]);
  const groupMatches = matches.filter((m) => m.fase === "grupos");
  const directKO = tournament.max_jogadores <= 4;
  if (directKO) {
    return <DirectKnockoutManager tournament={tournament} teams={teams} matches={matches} />;
  }
  return (
    <div className="space-y-6">
      <GroupManager tournament={tournament} teams={teams} />
      {groupMatches.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">
          Nenhuma partida de grupo gerada ainda. Sorteie ou defina os grupos e clique em "Gerar partidas".
        </p>
      )}
      <div className="grid gap-6 lg:grid-cols-2">
      {(["A", "B", "C", "D"] as const).map((g) => {
        const standings = computeGroupStandings(tournament.id, g);
        const gm = groupMatches.filter((m) => m.grupo === g).sort((a, b) => a.ordem - b.ordem);
        if (standings.length === 0) return null;
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
                    const p = t ? playerByTeam.get(t.id) : undefined;
                    const classifica = idx < 2;
                    return (
                      <TableRow key={s.time_id} className={classifica ? "bg-primary/5" : ""}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-1.5">
                            <TeamCrest src={t?.escudo_url ?? ""} alt={t?.nome ?? ""} size={20} />
                            <div className="min-w-0">
                              <div className="truncate text-xs font-bold">{p?.gamertag_nick ?? t?.nome}</div>
                              <div className="truncate text-[10px] text-muted-foreground">{t?.nome}</div>
                            </div>
                            {classifica && <Badge className="ml-1 bg-primary/20 text-primary hover:bg-primary/20">Classificado</Badge>}
                          </div>
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
    </div>
  );
}

/* ---- Group manager (sorteio / manual) ---- */
function DirectKnockoutManager({
  tournament, teams, matches,
}: { tournament: Tournament; teams: Team[]; matches: Match[] }) {
  const inscritos = teams.filter((t) => t.ocupado && t.ativo_pelo_admin);
  const semis = matches.filter((m) => m.fase === "semi");
  return (
    <Card className="border-border bg-card p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-sm font-bold uppercase tracking-widest text-primary">
          Mata-Mata Direto
        </h3>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            onClick={() => {
              const res = drawDirectKnockout(tournament.id);
              if (!res.ok) toast.error(res.error || "Erro");
              else toast.success("Semifinais sorteadas");
            }}
            className="bg-primary text-primary-foreground hover:bg-primary-glow"
          >
            <Shuffle className="mr-1 h-3.5 w-3.5" /> Sortear semifinais
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => { clearGroups(tournament.id); toast.success("Chaveamento limpo"); }}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Eraser className="mr-1 h-3.5 w-3.5" /> Limpar
          </Button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Com 4 times não há fase de grupos: o torneio começa direto nas semifinais, em{" "}
        <strong className="text-foreground">
          {tournament.formato_mata_mata === "ida_e_volta" ? "ida e volta" : "jogo único"}
        </strong>
        . Gerencie os placares na aba Mata-Mata.
      </p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {inscritos.map((t) => (
          <div key={t.id} className="flex items-center gap-2 rounded-lg border border-border bg-background/40 p-2.5">
            <TeamCrest src={t.escudo_url} alt={t.nome} size={28} />
            <span className="truncate text-sm font-bold">{t.nome}</span>
          </div>
        ))}
      </div>
      {semis.length === 0 && (
        <p className="mt-3 text-xs text-muted-foreground">
          Nenhum confronto gerado ainda. Clique em "Sortear semifinais".
        </p>
      )}
    </Card>
  );
}

function GroupManager({ tournament, teams }: { tournament: Tournament; teams: Team[] }) {
  const players = useFcState((s) => s.players.filter((p) => p.torneio_id === tournament.id));
  const playerByTeam = useMemo(() => new Map(players.map((p) => [p.time_id, p])), [players]);
  const inscritos = teams.filter((t) => t.ocupado && t.ativo_pelo_admin);
  return (
    <Card className="border-border bg-card p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-sm font-bold uppercase tracking-widest text-primary">
          Gerenciar Grupos
        </h3>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            onClick={() => { drawGroups(tournament.id); toast.success("Grupos sorteados e partidas geradas"); }}
            className="bg-primary text-primary-foreground hover:bg-primary-glow"
          >
            <Shuffle className="mr-1 h-3.5 w-3.5" /> Sortear grupos
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const res = generateGroupMatches(tournament.id);
              if (!res.ok) toast.error(res.error || "Erro");
              else toast.success("Partidas geradas");
            }}
          >
            <RefreshCw className="mr-1 h-3.5 w-3.5" /> Gerar partidas
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => { clearGroups(tournament.id); toast.success("Grupos limpos"); }}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Eraser className="mr-1 h-3.5 w-3.5" /> Limpar
          </Button>
        </div>
      </div>
      <p className="mb-3 text-xs text-muted-foreground">
        Gerar partidas recria a fase de grupos e apaga placares e o mata-mata atual.
      </p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {inscritos.map((t) => {
          const p = playerByTeam.get(t.id);
          return (
          <div key={t.id} className="flex items-center justify-between gap-2 rounded-lg border border-border bg-background/40 p-2.5">
            <div className="flex min-w-0 items-center gap-2">
              <TeamCrest src={t.escudo_url} alt={t.nome} size={28} />
              <div className="min-w-0">
                <div className="truncate text-sm font-bold">{p?.gamertag_nick ?? t.nome}</div>
                <div className="truncate text-[10px] text-muted-foreground">{t.nome}</div>
              </div>
            </div>
            <Select
              value={t.grupo ?? "none"}
              onValueChange={(v) => setTeamGroup(t.id, v === "none" ? null : (v as "A"))}
            >
              <SelectTrigger className="h-8 w-24"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem grupo</SelectItem>
                {GRUPOS.map((g) => (
                  <SelectItem key={g} value={g}>Grupo {g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          );
        })}
      </div>
    </Card>
  );
}

/* ---- Bracket ---- */
function BracketPanel({
  tournament, teams, matches,
}: { tournament: Tournament; teams: Team[]; matches: Match[] }) {
  const players = useFcState((s) => s.players.filter((p) => p.torneio_id === tournament.id));
  const teamMap = useMemo(() => new Map(teams.map((t) => [t.id, t])), [teams]);
  const playerByTeam = useMemo(() => new Map(players.map((p) => [p.time_id, p])), [players]);
  const q = matches.filter((m) => m.fase === "quartas").sort((a, b) => a.ordem - b.ordem);
  const s = matches.filter((m) => m.fase === "semi").sort((a, b) => a.ordem - b.ordem);
  const f = matches.filter((m) => m.fase === "final");

  const directKO = tournament.max_jogadores <= 4;
  if (q.length === 0 && (!directKO || s.length === 0)) {
    return (
      <Card className="border-dashed border-border bg-card/50 p-10 text-center">
        <AlertTriangle className="mx-auto h-6 w-6 text-muted-foreground" />
        <p className="mt-3 text-sm text-muted-foreground">
          {directKO
            ? "Sorteie as semifinais na aba Grupos para iniciar o mata-mata."
            : "Chave será gerada após todas as partidas da fase de grupos."}
        </p>
      </Card>
    );
  }

  return (
    <div className={`grid gap-4 ${directKO ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
      {!directKO && (
        <BracketColumn title="Quartas de Final" matches={q} teams={teamMap} players={playerByTeam} />
      )}
      <BracketColumn title="Semifinal" matches={s} teams={teamMap} players={playerByTeam} placeholder="Aguardando quartas" />
      <BracketColumn title="Final" matches={f} teams={teamMap} players={playerByTeam} placeholder="Aguardando semifinal" champion />
    </div>
  );
}

function BracketColumn({
  title, matches, teams, players, placeholder, champion,
}: { title: string; matches: Match[]; teams: Map<string, Team>; players: Map<string, Player>; placeholder?: string; champion?: boolean }) {
  return (
    <div>
      <h3 className="mb-2 font-display text-sm font-bold uppercase tracking-widest text-primary">{title}</h3>
      <div className="space-y-3">
        {matches.length === 0 && placeholder && (
          <div className="rounded-lg border border-dashed border-border bg-card/40 p-4 text-center text-xs text-muted-foreground">{placeholder}</div>
        )}
        {matches.map((m) => (
          <MatchCard key={m.id} match={m} teams={teams} players={players} />
        ))}
        {champion && matches.length > 0 && getTieWinner(matches) && (
          <Card className="border-primary/40 bg-primary/10 p-4 text-center shadow-[var(--shadow-neon)]">
            <Trophy className="mx-auto h-6 w-6 text-primary" />
            <p className="mt-1 text-[10px] uppercase tracking-widest text-primary">Campeão</p>
            <p className="mt-1 font-display text-lg font-black">
              <TeamCrest src={teams.get(getTieWinner(matches)!)?.escudo_url ?? ""} alt={teams.get(getTieWinner(matches)!)?.nome ?? ""} size={28} className="mr-1 inline-block align-middle" /> {players.get(getTieWinner(matches)!)?.gamertag_nick ?? teams.get(getTieWinner(matches)!)?.nome}
            </p>
            <p className="text-xs text-muted-foreground">{teams.get(getTieWinner(matches)!)?.nome}</p>
          </Card>
        )}
      </div>
    </div>
  );
}

/* ---- Match Card ---- */
function MatchCard({ match, teams, players }: { match: Match; teams: Map<string, Team>; players?: Map<string, Player> }) {
  const [gm, setGm] = useState<string>(match.gols_mandante?.toString() ?? "");
  const [gv, setGv] = useState<string>(match.gols_visitante?.toString() ?? "");
  const [pm, setPm] = useState<string>(match.penaltis_mandante?.toString() ?? "");
  const [pv, setPv] = useState<string>(match.penaltis_visitante?.toString() ?? "");
  const [data, setData] = useState<string>(match.data_jogo ?? "");
  const [woOpen, setWoOpen] = useState(false);

  useEffect(() => {
    setGm(match.gols_mandante?.toString() ?? "");
    setGv(match.gols_visitante?.toString() ?? "");
    setPm(match.penaltis_mandante?.toString() ?? "");
    setPv(match.penaltis_visitante?.toString() ?? "");
    setData(match.data_jogo ?? "");
  }, [match.id, match.status, match.data_jogo]);

  const isKO = match.fase !== "grupos";
  const tied = gm !== "" && gv !== "" && Number(gm) === Number(gv);
  const showPens = isKO && tied;

  const mandante = teams.get(match.time_mandante_id);
  const visitante = teams.get(match.time_visitante_id);
  const pa = mandante && players ? players.get(mandante.id) : undefined;
  const pVis = visitante && players ? players.get(visitante.id) : undefined;

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
        <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <TeamCrest src={mandante?.escudo_url ?? ""} alt={mandante?.nome ?? ""} size={24} />
            <span className="truncate text-sm font-semibold">{pa?.gamertag_nick ?? mandante?.nome}</span>
          </div>
          <span className="truncate pl-7 text-[10px] text-muted-foreground">{mandante?.nome}</span>
        </div>
        <div className="flex items-center gap-1">
          <Input value={gm} onChange={(e) => setGm(e.target.value.replace(/\D/g, ""))} className="h-8 w-11 text-center font-mono" inputMode="numeric" />
          <span className="text-xs text-muted-foreground">x</span>
          <Input value={gv} onChange={(e) => setGv(e.target.value.replace(/\D/g, ""))} className="h-8 w-11 text-center font-mono" inputMode="numeric" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col items-end gap-0.5">
          <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
            <span className="truncate text-right text-sm font-semibold">{pVis?.gamertag_nick ?? visitante?.nome}</span>
            <TeamCrest src={visitante?.escudo_url ?? ""} alt={visitante?.nome ?? ""} size={24} />
          </div>
          <span className="truncate pr-7 text-[10px] text-muted-foreground">{visitante?.nome}</span>
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

      <div className="mt-2 flex items-center gap-2">
        <Label className="text-[10px] uppercase tracking-widest text-muted-foreground shrink-0">Data</Label>
        <Input
          type="datetime-local"
          value={data ? toLocalInput(data) : ""}
          onChange={(e) => {
            setData(e.target.value);
            setMatchDate(match.id, e.target.value ? new Date(e.target.value).toISOString() : null);
          }}
          className="h-7 flex-1 text-xs"
        />
      </div>

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
              <div className="text-left">
                <div className="font-bold">{pa?.gamertag_nick ?? mandante?.nome}</div>
                <div className="text-[10px] font-normal text-muted-foreground">{mandante?.nome}</div>
              </div>
            </Button>
            <Button variant="outline" onClick={() => { launchWO(match.id, "visitante"); toast.success("W.O. registrado"); setWoOpen(false); }}>
              <div className="text-left">
                <div className="font-bold">{pVis?.gamertag_nick ?? visitante?.nome}</div>
                <div className="text-[10px] font-normal text-muted-foreground">{visitante?.nome}</div>
              </div>
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