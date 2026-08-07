import { createFileRoute, Link, useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Copy, KeyRound, Trash2, Bot, Save, TriangleAlert as AlertTriangle, Trophy, Shuffle, RefreshCw, Eraser, Search, Check, X, Globe, Plus } from "lucide-react";
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
  useTournamentByCode,
  useTeams,
  usePlayers,
  useMatches,
  useSetTournamentStatus,
  useUpdateRegulamento,
  useSetRegistrationDeadline,
  useDeleteTournament,
  useToggleTeamAtivo,
  useDeletePlayer,
  useFillWithBots,
  useSaveMatchScore,
  useLaunchWO,
  useSetMatchDate,
  useDrawGroups,
  useDrawDirectKnockout,
  useClearGroups,
  useGenerateGroupMatches,
  useSetTeamGroup,
  useAddTeams,
} from "@/lib/queries";
import {
  computeGroupStandings,
  getTieWinner,
  calcularIdade,
  hasTournamentStarted,
  GRUPOS,
  type Tournament,
  type Match,
  type Team,
  type Player,
} from "@/lib/fc-data";
import { TeamCrest } from "@/components/team-crest";
import { AppFooter } from "@/components/app-footer";
import { formatMasterKey } from "@/lib/code-utils";
import { COMPETITIONS, type CatalogTeam } from "@/lib/team-catalog";

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
  const { data: tournament, isLoading } = useTournamentByCode(codigo);

  const [unlocked, setUnlocked] = useState(false);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (tournament && key && key === tournament.chave_mestra_admin) {
      setUnlocked(true);
    }
  }, [tournament, key]);

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <p className="text-sm text-muted-foreground">Carregando...</p>
      </div>
    );
  }

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
              onChange={(e) => setInput(formatMasterKey(e.target.value))}
              placeholder="XXX-XXX"
              className="text-center font-mono uppercase tracking-widest"
              maxLength={7}
              autoComplete="off"
              autoCapitalize="characters"
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
  const { data: teams = [] } = useTeams(tournament.id);
  const { data: players = [] } = usePlayers(tournament.id);
  const { data: matches = [] } = useMatches(tournament.id);

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
    <div className="flex min-h-screen flex-col" style={{ backgroundImage: "var(--gradient-hero)" }}>
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

      <header className="mx-auto w-full max-w-6xl px-4 pb-4 pt-6">
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

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24">
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
      <AppFooter />
    </div>
  );
}
function AddTeamsCard({ tournamentId, existingTeams }: { tournamentId: string; existingTeams: Team[] }) {
  const addTeamsMutation = useAddTeams(tournamentId);
  const [compId, setCompId] = useState<string>(COMPETITIONS[0].id);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<CatalogTeam[]>([]);

  const competition = useMemo(
    () => COMPETITIONS.find((c) => c.id === compId) ?? COMPETITIONS[0],
    [compId],
  );

  const existingNames = useMemo(
    () => new Set(existingTeams.map((t) => t.nome)),
    [existingTeams],
  );

  const toggleTeam = (team: CatalogTeam) => {
    const exists = selected.some((t) => t.nome === team.nome);
    if (exists) {
      setSelected(selected.filter((t) => t.nome !== team.nome));
    } else {
      setSelected([...selected, team]);
    }
  };

  const submit = async () => {
    if (selected.length === 0) {
      toast.error("Selecione ao menos um time");
      return;
    }
    const res = await addTeamsMutation.mutateAsync({
      newTeams: selected.map((t) => ({ nome: t.nome, escudo_url: t.escudo })),
    });
    if (!res.ok) {
      toast.error("Erro ao adicionar times", { description: res.error });
      return;
    }
    toast.success(`${res.added} time(s) adicionado(s)`);
    setSelected([]);
    setSearch("");
  };

  return (
    <Card className="border-border bg-card p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-sm font-bold uppercase tracking-widest text-primary">
          Adicionar Times
        </h3>
        {selected.length > 0 && (
          <Badge className="bg-primary text-primary-foreground">
            {selected.length} selecionado(s)
          </Badge>
        )}
      </div>
      <p className="mb-4 text-xs text-muted-foreground">
        Adicione novos times ao torneio após a criação. Os times adicionados ficam disponíveis para inscrição.
      </p>

      <div className="mb-4">
        <Label className="mb-2 flex items-center gap-1.5 text-xs">
          <Globe className="h-3.5 w-3.5 text-primary" /> Competição / Liga
        </Label>
        <div className="flex flex-wrap gap-2">
          {COMPETITIONS.map((comp) => (
            <button
              key={comp.id}
              type="button"
              onClick={() => {
                setCompId(comp.id);
                setSearch("");
              }}
              className={[
                "rounded-lg border px-3 py-1.5 text-xs font-semibold transition",
                compId === comp.id
                  ? "border-primary bg-primary/15 text-primary shadow-[var(--shadow-neon)]"
                  : "border-border bg-background/40 text-muted-foreground hover:border-primary/40 hover:text-foreground",
              ].join(" ")}
            >
              {comp.nome}
            </button>
          ))}
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar time..."
          className="pl-9"
        />
      </div>

      <div className="mb-4 space-y-4">
        {competition.grupos.map((cont) => {
          const filtered = cont.times.filter((t) =>
            t.nome.toLowerCase().includes(search.toLowerCase()),
          );
          if (filtered.length === 0) return null;
          return (
            <div key={cont.nome}>
              <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <Globe className="h-3 w-3" /> {cont.nome}
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                {filtered.map((team) => {
                  const isSelected = selected.some((t) => t.nome === team.nome);
                  const alreadyIn = existingNames.has(team.nome);
                  return (
                    <button
                      key={team.nome}
                      type="button"
                      disabled={alreadyIn}
                      onClick={() => toggleTeam(team)}
                      className={[
                        "group relative flex items-center gap-2 rounded-xl border p-2.5 text-left transition",
                        isSelected
                          ? "border-primary bg-primary/15 shadow-[var(--shadow-neon)]"
                          : alreadyIn
                            ? "cursor-not-allowed border-border bg-muted/30 opacity-40"
                            : "border-border bg-background/40 hover:border-primary/50 hover:bg-primary/5",
                      ].join(" ")}
                    >
                      <TeamCrest src={team.escudo} alt={team.nome} size={28} />
                      <span className="min-w-0 flex-1">
                        <span className="line-clamp-1 text-xs font-bold text-foreground">
                          {team.nome}
                        </span>
                      </span>
                      {isSelected && (
                        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                          <Check className="h-3 w-3" />
                        </span>
                      )}
                      {alreadyIn && !isSelected && (
                        <span className="text-[9px] font-bold uppercase text-muted-foreground">no torneio</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {selected.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {selected.map((team) => (
            <span
              key={team.nome}
              className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-2.5 py-1.5 text-xs font-semibold"
            >
              <TeamCrest src={team.escudo} alt={team.nome} size={20} />
              {team.nome}
              <button
                type="button"
                onClick={() => toggleTeam(team)}
                className="ml-0.5 text-muted-foreground hover:text-destructive"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      <Button
        type="button"
        onClick={submit}
        disabled={selected.length === 0 || addTeamsMutation.isPending}
        className="w-full bg-primary text-primary-foreground shadow-[var(--shadow-neon)] hover:bg-primary-glow"
      >
        <Plus className="mr-2 h-4 w-4" />
        {addTeamsMutation.isPending ? "Adicionando..." : `Adicionar ${selected.length || ""} time(s)`}
      </Button>
    </Card>
  );
}

function ConfigPanel({ tournament, teams }: { tournament: Tournament; teams: Team[] }) {
  const [reg, setReg] = useState(tournament.regulamento_texto);
  const [deadline, setDeadline] = useState<string>(tournament.data_limite_inscricoes ?? "");
  const { data: matches = [] } = useMatches(tournament.id);
  const started = hasTournamentStarted(matches, tournament.id);
  const navigate = useNavigate();

  const setStatusMutation = useSetTournamentStatus(tournament.id, tournament.codigo_unico);
  const updateRegMutation = useUpdateRegulamento(tournament.id, tournament.codigo_unico);
  const setDeadlineMutation = useSetRegistrationDeadline(tournament.id, tournament.codigo_unico);
  const deleteTournamentMutation = useDeleteTournament();
  const toggleTeamMutation = useToggleTeamAtivo(tournament.id);

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
                disabled={locked || setStatusMutation.isPending}
                onClick={() => {
                  setStatusMutation.mutate(s, {
                    onSuccess: () => toast.success("Status atualizado"),
                    onError: (e) => toast.error(e.message),
                  });
                }}
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

      <AddTeamsCard tournamentId={tournament.id} existingTeams={teams} />

      <Card className="border-border bg-card p-5">
        <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-widest text-primary">Data Limite de Inscrição</h3>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            type="datetime-local"
            value={deadline ? toLocalInput(deadline) : ""}
            onChange={(e) => {
              const val = e.target.value;
              setDeadline(val);
              setDeadlineMutation.mutate(val ? new Date(val).toISOString() : null);
            }}
            className="h-9 max-w-xs text-sm"
          />
          {deadline && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setDeadline("");
                setDeadlineMutation.mutate(null, {
                  onSuccess: () => toast.success("Data limite removida"),
                });
              }}
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
          disabled={updateRegMutation.isPending}
          onClick={() => {
            updateRegMutation.mutate(reg, {
              onSuccess: () => toast.success("Regulamento salvo"),
              onError: (e) => toast.error(e.message),
            });
          }}
        >
          <Save className="mr-1 h-3.5 w-3.5" /> {updateRegMutation.isPending ? "Salvando..." : "Salvar regulamento"}
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
                  deleteTournamentMutation.mutate(tournament.id, {
                    onSuccess: () => {
                      toast.success("Torneio excluído");
                      navigate({ to: "/" });
                    },
                    onError: (e) => toast.error(e.message),
                  });
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
              <Switch
                checked={t.ativo_pelo_admin}
                onCheckedChange={(v) => toggleTeamMutation.mutate({ teamId: t.id, ativo: v })}
              />
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
  const deletePlayerMutation = useDeletePlayer(tournament.id);
  const fillBotsMutation = useFillWithBots(tournament.id);

  return (
    <Card className="border-border bg-card p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-sm font-bold uppercase tracking-widest text-primary">
          Inscritos ({players.length}/{tournament.max_jogadores})
        </h3>
        <Button
          size="sm" variant="outline"
          onClick={() => fillBotsMutation.mutate(
            { tournament, players, teams },
            { onSuccess: () => toast.success("Vagas preenchidas com BOTs"), onError: (e) => toast.error(e.message) },
          )}
          disabled={players.length >= tournament.max_jogadores || fillBotsMutation.isPending}
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
                      onClick={() => deletePlayerMutation.mutate(p.id, {
                        onSuccess: () => toast.success("Inscrito removido"),
                        onError: (e) => toast.error(e.message),
                      })}
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
  const { data: players = [] } = usePlayers(tournament.id);
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
        const standings = computeGroupStandings(groupMatches, teams, tournament.id, g);
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
                <MatchCard key={m.id} match={m} teams={teamMap} tournament={tournament} allMatches={matches} />
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
  const drawKOMutation = useDrawDirectKnockout(tournament.id);
  const clearMutation = useClearGroups(tournament.id);

  return (
    <Card className="border-border bg-card p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-sm font-bold uppercase tracking-widest text-primary">
          Mata-Mata Direto
        </h3>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            disabled={drawKOMutation.isPending}
            onClick={() => drawKOMutation.mutate(
              { tournament, teams },
              { onSuccess: () => toast.success("Semifinais sorteadas"), onError: (e) => toast.error(e.message) },
            )}
            className="bg-primary text-primary-foreground hover:bg-primary-glow"
          >
            <Shuffle className="mr-1 h-3.5 w-3.5" /> Sortear semifinais
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={clearMutation.isPending}
            onClick={() => clearMutation.mutate(undefined, {
              onSuccess: () => toast.success("Chaveamento limpo"),
              onError: (e) => toast.error(e.message),
            })}
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
  const { data: players = [] } = usePlayers(tournament.id);
  const playerByTeam = useMemo(() => new Map(players.map((p) => [p.time_id, p])), [players]);
  const inscritos = teams.filter((t) => t.ocupado && t.ativo_pelo_admin);

  const drawGroupsMutation = useDrawGroups(tournament.id);
  const generateMatchesMutation = useGenerateGroupMatches(tournament.id);
  const clearMutation = useClearGroups(tournament.id);
  const setGroupMutation = useSetTeamGroup(tournament.id);

  return (
    <Card className="border-border bg-card p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-sm font-bold uppercase tracking-widest text-primary">
          Gerenciar Grupos
        </h3>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            disabled={drawGroupsMutation.isPending}
            onClick={() => drawGroupsMutation.mutate(
              { tournament, teams },
              { onSuccess: () => toast.success("Grupos sorteados e partidas geradas"), onError: (e) => toast.error(e.message) },
            )}
            className="bg-primary text-primary-foreground hover:bg-primary-glow"
          >
            <Shuffle className="mr-1 h-3.5 w-3.5" /> Sortear grupos
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={generateMatchesMutation.isPending}
            onClick={() => generateMatchesMutation.mutate(
              { tournament, teams },
              {
                onSuccess: (res) => {
                  if (!res.ok) toast.error(res.error || "Erro");
                  else toast.success("Partidas geradas");
                },
                onError: (e) => toast.error(e.message),
              },
            )}
          >
            <RefreshCw className="mr-1 h-3.5 w-3.5" /> Gerar partidas
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={clearMutation.isPending}
            onClick={() => clearMutation.mutate(undefined, {
              onSuccess: () => toast.success("Grupos limpos"),
              onError: (e) => toast.error(e.message),
            })}
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
              onValueChange={(v) => setGroupMutation.mutate({
                teamId: t.id,
                grupo: v === "none" ? null : (v as "A"),
              })}
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
  const { data: players = [] } = usePlayers(tournament.id);
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
        <BracketColumn title="Quartas de Final" matches={q} teams={teamMap} players={playerByTeam} tournament={tournament} allMatches={matches} />
      )}
      <BracketColumn title="Semifinal" matches={s} teams={teamMap} players={playerByTeam} placeholder="Aguardando quartas" tournament={tournament} allMatches={matches} />
      <BracketColumn title="Final" matches={f} teams={teamMap} players={playerByTeam} placeholder="Aguardando semifinal" champion tournament={tournament} allMatches={matches} />
    </div>
  );
}

function BracketColumn({
  title, matches, teams, players, placeholder, champion, tournament, allMatches,
}: {
  title: string;
  matches: Match[];
  teams: Map<string, Team>;
  players: Map<string, Player>;
  placeholder?: string;
  champion?: boolean;
  tournament: Tournament;
  allMatches: Match[];
}) {
  return (
    <div>
      <h3 className="mb-2 font-display text-sm font-bold uppercase tracking-widest text-primary">{title}</h3>
      <div className="space-y-3">
        {matches.length === 0 && placeholder && (
          <div className="rounded-lg border border-dashed border-border bg-card/40 p-4 text-center text-xs text-muted-foreground">{placeholder}</div>
        )}
        {matches.map((m) => (
          <MatchCard key={m.id} match={m} teams={teams} players={players} tournament={tournament} allMatches={allMatches} />
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
function MatchCard({ match, teams, players, tournament, allMatches }: {
  match: Match;
  teams: Map<string, Team>;
  players?: Map<string, Player>;
  tournament: Tournament;
  allMatches: Match[];
}) {
  const [gm, setGm] = useState<string>(match.gols_mandante?.toString() ?? "");
  const [gv, setGv] = useState<string>(match.gols_visitante?.toString() ?? "");
  const [pm, setPm] = useState<string>(match.penaltis_mandante?.toString() ?? "");
  const [pv, setPv] = useState<string>(match.penaltis_visitante?.toString() ?? "");
  const [data, setData] = useState<string>(match.data_jogo ?? "");
  const [woOpen, setWoOpen] = useState(false);

  const saveScoreMutation = useSaveMatchScore(match.torneio_id);
  const launchWOMutation = useLaunchWO(match.torneio_id);
  const setDateMutation = useSetMatchDate(match.torneio_id);

  useEffect(() => {
    setGm(match.gols_mandante?.toString() ?? "");
    setGv(match.gols_visitante?.toString() ?? "");
    setPm(match.penaltis_mandante?.toString() ?? "");
    setPv(match.penaltis_visitante?.toString() ?? "");
    setData(match.data_jogo ?? "");
  }, [match.id, match.status, match.data_jogo]);

  const isKO = match.fase !== "grupos";
  const tied = gm !== "" && gv !== "" && Number(gm) === Number(gv);
  // Mostra pênaltis em KO empatado quando:
  // - formato jogo_unico: sempre
  // - formato ida_e_volta: só na volta (perna 2)
  const isJogoUnico = tournament.formato_mata_mata === "jogo_unico";
  const showPens = isKO && tied && (isJogoUnico || match.perna === 2);

  const mandante = teams.get(match.time_mandante_id);
  const visitante = teams.get(match.time_visitante_id);
  const pa = mandante && players ? players.get(mandante.id) : undefined;
  const pVis = visitante && players ? players.get(visitante.id) : undefined;

  const save = () => {
    if (gm === "" || gv === "") { toast.error("Preencha o placar"); return; }
    saveScoreMutation.mutate(
      {
        match, allMatches, tournament,
        gm: Number(gm), gv: Number(gv),
        pm: showPens && pm !== "" ? Number(pm) : null,
        pv: showPens && pv !== "" ? Number(pv) : null,
      },
      {
        onSuccess: (res) => {
          if (!res.ok) toast.error(res.error || "Erro");
          else toast.success("Placar salvo");
        },
        onError: (e) => toast.error(e.message),
      },
    );
  };

  return (
    <div className={[
      "rounded-lg border p-3",
      match.status === "pendente" ? "border-border bg-background/40" : "border-primary/30 bg-primary/5",
    ].join(" ")}>
      {match.perna != null && (
        <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {match.perna === 1 ? "Jogo de ida" : "Jogo de volta"}
        </p>
      )}
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <TeamCrest src={mandante?.escudo_url ?? ""} alt={mandante?.nome ?? ""} size={24} />
            <span className="truncate text-sm font-semibold">{pa?.gamertag_nick ?? mandante?.nome}</span>
          </div>
          <span className="truncate pl-7 text-[10px] text-muted-foreground">{mandante?.nome}</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-1">
            <Input value={gm} onChange={(e) => setGm(e.target.value.replace(/\D/g, ""))} className="h-8 w-11 text-center font-mono" inputMode="numeric" />
            <span className="text-xs text-muted-foreground">x</span>
            <Input value={gv} onChange={(e) => setGv(e.target.value.replace(/\D/g, ""))} className="h-8 w-11 text-center font-mono" inputMode="numeric" />
          </div>
          {showPens && (
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-[9px] uppercase tracking-widest text-muted-foreground">pênaltis</span>
              <div className="flex items-center gap-1">
                <Input value={pm} onChange={(e) => setPm(e.target.value.replace(/\D/g, ""))} className="h-7 w-11 text-center font-mono" inputMode="numeric" />
                <span className="text-xs text-muted-foreground">x</span>
                <Input value={pv} onChange={(e) => setPv(e.target.value.replace(/\D/g, ""))} className="h-7 w-11 text-center font-mono" inputMode="numeric" />
              </div>
            </div>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col items-end gap-0.5">
          <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
            <span className="truncate text-right text-sm font-semibold">{pVis?.gamertag_nick ?? visitante?.nome}</span>
            <TeamCrest src={visitante?.escudo_url ?? ""} alt={visitante?.nome ?? ""} size={24} />
          </div>
          <span className="truncate pr-7 text-[10px] text-muted-foreground">{visitante?.nome}</span>
        </div>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <Label className="text-[10px] uppercase tracking-widest text-muted-foreground shrink-0">Data</Label>
        <Input
          type="datetime-local"
          value={data ? toLocalInput(data) : ""}
          onChange={(e) => {
            setData(e.target.value);
            setDateMutation.mutate({
              matchId: match.id,
              data_jogo: e.target.value ? new Date(e.target.value).toISOString() : null,
            });
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
          <Button size="sm" onClick={save} disabled={saveScoreMutation.isPending} className="h-7 bg-primary text-[10px] text-primary-foreground hover:bg-primary-glow">
            <Save className="mr-1 h-3 w-3" /> {saveScoreMutation.isPending ? "..." : "Salvar"}
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
            <Button variant="outline" onClick={() => {
              launchWOMutation.mutate(
                { match, allMatches, tournament, vencedor: "mandante" },
                { onSuccess: () => { toast.success("W.O. registrado"); setWoOpen(false); }, onError: (e) => toast.error(e.message) },
              );
            }}>
              <div className="text-left">
                <div className="font-bold">{pa?.gamertag_nick ?? mandante?.nome}</div>
                <div className="text-[10px] font-normal text-muted-foreground">{mandante?.nome}</div>
              </div>
            </Button>
            <Button variant="outline" onClick={() => {
              launchWOMutation.mutate(
                { match, allMatches, tournament, vencedor: "visitante" },
                { onSuccess: () => { toast.success("W.O. registrado"); setWoOpen(false); }, onError: (e) => toast.error(e.message) },
              );
            }}>
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