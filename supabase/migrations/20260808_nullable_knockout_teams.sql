-- Permite criar partidas futuras do mata-mata antes de conhecer os times.
ALTER TABLE public.matches
  ALTER COLUMN time_mandante_id DROP NOT NULL,
  ALTER COLUMN time_visitante_id DROP NOT NULL;
