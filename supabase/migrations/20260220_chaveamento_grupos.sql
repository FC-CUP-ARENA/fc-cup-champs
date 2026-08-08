-- Execute no SQL Editor do seu projeto Supabase (uma instrução por vez).

-- 1) Novos grupos (rode cada ALTER TYPE isoladamente)
ALTER TYPE grupo_letra ADD VALUE IF NOT EXISTS 'E';
ALTER TYPE grupo_letra ADD VALUE IF NOT EXISTS 'F';
ALTER TYPE grupo_letra ADD VALUE IF NOT EXISTS 'G';
ALTER TYPE grupo_letra ADD VALUE IF NOT EXISTS 'H';

-- 2) Nova fase: disputa de 3º lugar
ALTER TYPE match_fase ADD VALUE IF NOT EXISTS 'terceiro';

-- 3) Configuração do torneio
ALTER TABLE public.tournaments
  ADD COLUMN IF NOT EXISTS num_grupos integer NOT NULL DEFAULT 4,
  ADD COLUMN IF NOT EXISTS chaveamento_config jsonb;
