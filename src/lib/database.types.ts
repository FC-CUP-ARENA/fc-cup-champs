export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      tournaments: {
        Row: {
          id: string;
          nome: string;
          codigo_unico: string;
          chave_mestra_admin: string;
          regulamento_texto: string;
          max_jogadores: number;
          formato_mata_mata: "jogo_unico" | "ida_e_volta";
          status: "inscricoes_abertas" | "em_andamento" | "finalizado";
          data_limite_inscricoes: string | null;
          num_grupos: number | null;
          chaveamento_config: Json | null;
          created_at: string;
        };
        Insert: {
          id: string;
          nome: string;
          codigo_unico: string;
          chave_mestra_admin: string;
          regulamento_texto?: string;
          max_jogadores: number;
          formato_mata_mata?: "jogo_unico" | "ida_e_volta";
          status?: "inscricoes_abertas" | "em_andamento" | "finalizado";
          data_limite_inscricoes?: string | null;
          num_grupos?: number | null;
          chaveamento_config?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          codigo_unico?: string;
          chave_mestra_admin?: string;
          regulamento_texto?: string;
          max_jogadores?: number;
          formato_mata_mata?: "jogo_unico" | "ida_e_volta";
          status?: "inscricoes_abertas" | "em_andamento" | "finalizado";
          data_limite_inscricoes?: string | null;
          num_grupos?: number | null;
          chaveamento_config?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };
      teams: {
        Row: {
          id: string;
          torneio_id: string;
          nome: string;
          escudo_url: string;
          ativo_pelo_admin: boolean;
          ocupado: boolean;
          grupo: "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | null;
          created_at: string;
        };
        Insert: {
          id: string;
          torneio_id: string;
          nome: string;
          escudo_url?: string;
          ativo_pelo_admin?: boolean;
          ocupado?: boolean;
          grupo?: "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          torneio_id?: string;
          nome?: string;
          escudo_url?: string;
          ativo_pelo_admin?: boolean;
          ocupado?: boolean;
          grupo?: "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | null;
          created_at?: string;
        };
        Relationships: [];
      };
      players: {
        Row: {
          id: string;
          torneio_id: string;
          time_id: string;
          nome_completo: string;
          gamertag_nick: string;
          mes_ano_nascimento: string;
          celular: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          torneio_id: string;
          time_id: string;
          nome_completo: string;
          gamertag_nick: string;
          mes_ano_nascimento: string;
          celular?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          torneio_id?: string;
          time_id?: string;
          nome_completo?: string;
          gamertag_nick?: string;
          mes_ano_nascimento?: string;
          celular?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      matches: {
        Row: {
          id: string;
          torneio_id: string;
          fase: "grupos" | "quartas" | "semi" | "final" | "terceiro";
          grupo: "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | null;
          ordem: number;
          chave: string | null;
          perna: 1 | 2 | null;
          time_mandante_id: string | null;
          time_visitante_id: string | null;
          gols_mandante: number | null;
          gols_visitante: number | null;
          penaltis_mandante: number | null;
          penaltis_visitante: number | null;
          status: "pendente" | "concluido" | "wo";
          data_jogo: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          torneio_id: string;
          fase: "grupos" | "quartas" | "semi" | "final" | "terceiro";
          grupo?: "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | null;
          ordem?: number;
          chave?: string | null;
          perna?: 1 | 2 | null;
          time_mandante_id: string | null;
          time_visitante_id: string | null;
          gols_mandante?: number | null;
          gols_visitante?: number | null;
          penaltis_mandante?: number | null;
          penaltis_visitante?: number | null;
          status?: "pendente" | "concluido" | "wo";
          data_jogo?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          torneio_id?: string;
          fase?: "grupos" | "quartas" | "semi" | "final" | "terceiro";
          grupo?: "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | null;
          ordem?: number;
          chave?: string | null;
          perna?: 1 | 2 | null;
          time_mandante_id?: string | null;
          time_visitante_id?: string | null;
          gols_mandante?: number | null;
          gols_visitante?: number | null;
          penaltis_mandante?: number | null;
          penaltis_visitante?: number | null;
          status?: "pendente" | "concluido" | "wo";
          data_jogo?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
}
