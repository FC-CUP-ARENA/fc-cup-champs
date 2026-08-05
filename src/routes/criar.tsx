import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Trophy,
  Check,
  Search,
  X,
  Globe,
  RefreshCw,
  KeyRound,
  Copy,
  TriangleAlert as AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  COMPETITIONS,
  type CatalogTeam,
} from "@/lib/team-catalog";
import { createTournament } from "@/lib/fc-data";
import {
  formatTournamentCode,
  formatMasterKey,
  generateTournamentCode,
  generateMasterKey,
} from "@/lib/code-utils";

export const Route = createFileRoute("/criar")({
  head: () => ({
    meta: [
      { title: "Criar Torneio — FC Cup Arena" },
      {
        name: "description",
        content: "Crie um novo torneio no FC Cup Arena escolhendo times das principais ligas e copas do mundo.",
      },
    ],
  }),
  component: CreateTournamentPage,
});

const DEFAULT_REGULAMENTO = `REGULAMENTO DO TORNEIO

1. INSCRIÇÕES
- Cada jogador escolhe um time disponível no momento da inscrição.
- O número de vagas é limitado aos times cadastrados.

2. FASE DE GRUPOS
- Os times são divididos em grupos (A, B, C, D) por sorteio.
- Todos enfrentam todos dentro do grupo em turno único.

3. MATA-MATA
- Os classificados disputam quartas, semifinal e final.

4. W.O.
- Ausência não avisada resulta em W.O. (3x0 para o adversário).

5. CRITÉRIOS DE DESEMPATE
- Pontos > Vitórias > Saldo de Gols > Gols Pró.`;

function TeamCrest({ src, alt, size = 28 }: { src: string; alt: string; size?: number }) {
  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      loading="lazy"
      className="shrink-0 rounded-sm object-contain"
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).style.display = "none";
      }}
    />
  );
}

function CreateTournamentPage() {
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [codigo, setCodigo] = useState(() => generateTournamentCode());
  const [chave, setChave] = useState(() => generateMasterKey());
  const [maxJogadores, setMaxJogadores] = useState("16");
  const [formato, setFormato] = useState<"jogo_unico" | "ida_e_volta">("jogo_unico");
  const [deadline, setDeadline] = useState("");
  const [regulamento, setRegulamento] = useState(DEFAULT_REGULAMENTO);
  const [compId, setCompId] = useState<string>(COMPETITIONS[0].id);
  const [selectedTeams, setSelectedTeams] = useState<CatalogTeam[]>([]);
  const [search, setSearch] = useState("");
  const [created, setCreated] = useState<{ codigo: string; chave: string } | null>(null);

  const competition = useMemo(
    () => COMPETITIONS.find((c) => c.id === compId) ?? COMPETITIONS[0],
    [compId],
  );

  const maxNum = Number(maxJogadores);
  const isMaxEven = maxNum % 2 === 0;
  const isMaxValid = maxNum >= 4 && isMaxEven;
  const selectedCount = selectedTeams.length;
  const canCreate =
    nome.trim() &&
    codigo.trim().length >= 6 &&
    chave.trim().length >= 7 &&
    isMaxValid &&
    selectedCount === maxNum;

  const toggleTeam = (team: CatalogTeam) => {
    const exists = selectedTeams.some((t) => t.nome === team.nome);
    if (exists) {
      setSelectedTeams(selectedTeams.filter((t) => t.nome !== team.nome));
    } else {
      if (selectedCount >= maxNum) {
        toast.error(`Máximo de ${maxNum} times atingido`);
        return;
      }
      setSelectedTeams([...selectedTeams, team]);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreate) {
      if (!isMaxValid) {
        toast.error("O número de times deve ser par e no mínimo 4");
        return;
      }
      if (selectedCount !== maxNum) {
        toast.error(`Selecione exatamente ${maxNum} times (você selecionou ${selectedCount})`);
        return;
      }
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const res = createTournament({
      nome: nome.trim(),
      codigo_unico: codigo.trim(),
      chave_mestra_admin: chave.trim(),
      regulamento_texto: regulamento,
      max_jogadores: maxNum,
      formato_mata_mata: formato,
      data_limite_inscricoes: deadline ? new Date(deadline).toISOString() : null,
      teams: selectedTeams.map((t) => ({ nome: t.nome, escudo_url: t.escudo })),
    });

    if (!res.ok) {
      toast.error("Erro ao criar torneio", { description: res.error });
      return;
    }

    toast.success("Torneio criado com sucesso!", {
      description: `Código: ${res.tournament.codigo_unico}`,
    });
    setCreated({
      codigo: res.tournament.codigo_unico,
      chave: res.tournament.chave_mestra_admin,
    });
  };

  const goToAdmin = () => {
    if (!created) return;
    navigate({
      to: "/t/$codigo/admin",
      params: { codigo: created.codigo },
      search: { key: created.chave },
    });
  };

  return (
    <div className="min-h-screen" style={{ backgroundImage: "var(--gradient-hero)" }}>
      <AlertDialog open={created !== null}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" /> Guarde sua Chave Mestra!
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta chave dá acesso ao painel de administração do torneio e{" "}
              <strong className="text-foreground">não será exibida novamente</strong>. Copie e guarde em
              local seguro antes de continuar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-3">
            <div className="rounded-xl border border-border bg-background/60 p-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Código do torneio</p>
              <p className="font-mono text-lg font-black text-foreground">{created?.codigo}</p>
            </div>
            <div className="rounded-xl border border-primary/40 bg-primary/10 p-3">
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-primary">
                <KeyRound className="h-3 w-3" /> Chave mestra admin
              </p>
              <div className="flex items-center justify-between gap-2">
                <p className="font-mono text-lg font-black text-primary">{created?.chave}</p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (!created) return;
                    navigator.clipboard.writeText(
                      `Torneio ${created.codigo} — Chave mestra: ${created.chave}`,
                    );
                    toast.success("Chave copiada");
                  }}
                >
                  <Copy className="mr-1 h-3.5 w-3.5" /> Copiar
                </Button>
              </div>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={goToAdmin}
              className="bg-primary text-primary-foreground hover:bg-primary-glow"
            >
              Guardei a chave, continuar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
            Criar Torneio
          </span>
        </div>
      </div>

      <header className="mx-auto max-w-5xl px-4 pb-6 pt-8">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-[var(--shadow-neon)]">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-xl font-black leading-tight text-foreground sm:text-2xl">
              Criar Novo Torneio
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Configure as informações e escolha os times das principais ligas e copas do mundo
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-24">
        <form onSubmit={submit} className="space-y-6">
          {/* Configurações básicas */}
          <Card className="border-border bg-card p-5">
            <h3 className="mb-4 font-display text-sm font-bold uppercase tracking-widest text-primary">
              Configurações Básicas
            </h3>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="nome">Nome do Torneio *</Label>
                <Input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Copa dos Amigos 2026"
                  className="mt-1.5"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="codigo">Código Único (gerado automaticamente)</Label>
                  <div className="mt-1.5 flex gap-2">
                    <Input
                      id="codigo"
                      value={codigo}
                      onChange={(e) => setCodigo(formatTournamentCode(e.target.value))}
                      placeholder="FC-XXXX"
                      className="font-mono"
                      maxLength={7}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setCodigo(generateTournamentCode())}
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    Formato: FC-XXXX (gerado a partir de timestamp + hash)
                  </p>
                </div>
                <div>
                  <Label htmlFor="chave">Chave Mestra Admin (gerada automaticamente)</Label>
                  <div className="mt-1.5 flex gap-2">
                    <Input
                      id="chave"
                      value={chave}
                      onChange={(e) => setChave(formatMasterKey(e.target.value))}
                      placeholder="XXX-XXX"
                      className="font-mono"
                      maxLength={7}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setChave(generateMasterKey())}
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    Formato: XXX-XXX (6 dígitos alfanuméricos)
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="max">Número de Times *</Label>
                  <Select value={maxJogadores} onValueChange={setMaxJogadores}>
                    <SelectTrigger id="max" className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48].map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n} times
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    Deve ser par para formar os grupos
                  </p>
                </div>
                <div>
                  <Label htmlFor="formato">Formato do Mata-Mata</Label>
                  <Select
                    value={formato}
                    onValueChange={(v) => setFormato(v as "jogo_unico" | "ida_e_volta")}
                  >
                    <SelectTrigger id="formato" className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jogo_unico">Jogo Único</SelectItem>
                      <SelectItem value="ida_e_volta">Ida e Volta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="deadline">
                  Data Limite de Inscrição <span className="text-muted-foreground">(opcional)</span>
                </Label>
                <Input
                  id="deadline"
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="mt-1.5 max-w-xs"
                />
              </div>
            </div>
          </Card>

          {/* Seleção de times */}
          <Card className="border-border bg-card p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-display text-sm font-bold uppercase tracking-widest text-primary">
                Selecionar Times
              </h3>
              <Badge
                variant={selectedCount === maxNum ? "default" : "outline"}
                className={
                  selectedCount === maxNum
                    ? "bg-primary text-primary-foreground"
                    : "border-primary/40 text-primary"
                }
              >
                {selectedCount}/{maxNum} selecionados
              </Badge>
            </div>

            {/* Competition selector */}
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
              <p className="mt-2 text-[10px] text-muted-foreground">{competition.descricao}</p>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar time..."
                className="pl-9"
              />
            </div>

            {/* Teams grid by continent */}
            <div className="space-y-4">
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
                        const selected = selectedTeams.some((t) => t.nome === team.nome);
                        const full = !selected && selectedCount >= maxNum;
                        return (
                          <button
                            key={team.nome}
                            type="button"
                            disabled={full}
                            onClick={() => toggleTeam(team)}
                            className={[
                              "group relative flex items-center gap-2 rounded-xl border p-2.5 text-left transition",
                              selected
                                ? "border-primary bg-primary/15 shadow-[var(--shadow-neon)]"
                                : full
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
                            {selected && (
                              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                                <Check className="h-3 w-3" />
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Times selecionados */}
          {selectedTeams.length > 0 && (
            <Card className="border-border bg-card p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-display text-sm font-bold uppercase tracking-widest text-primary">
                  Times Selecionados
                </h3>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedTeams([])}
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  Limpar todos
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedTeams.map((team) => (
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
            </Card>
          )}

          {/* Regulamento */}
          <Card className="border-border bg-card p-5">
            <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-widest text-primary">
              Regulamento
            </h3>
            <Textarea
              value={regulamento}
              onChange={(e) => setRegulamento(e.target.value)}
              className="min-h-40 font-sans text-sm"
            />
          </Card>

          {/* Submit */}
          <div className="space-y-3">
            {!isMaxValid && (
              <p className="text-center text-xs text-destructive">
                O número de times deve ser par e no mínimo 4
              </p>
            )}
            {isMaxValid && selectedCount !== maxNum && (
              <p className="text-center text-xs text-muted-foreground">
                Selecione mais {maxNum - selectedCount} time(s) para completar
              </p>
            )}
            <Button
              type="submit"
              className="h-12 w-full bg-primary text-base font-bold text-primary-foreground shadow-[var(--shadow-neon)] hover:bg-primary-glow"
              disabled={!canCreate}
            >
              <Trophy className="mr-2 h-5 w-5" /> Criar Torneio
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
