"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import type {
  Profile,
  ModuloComProgresso,
  Modulo,
  Aula,
  Progresso,
} from "@/types/database";
import { calcularSemanasLiberadas, getEstadoSemana } from "@/lib/utils";

interface MemberData {
  profile: Profile | null;
  modulos: ModuloComProgresso[];
  loading: boolean;
  semanasLiberadas: number;
  totalAulas: number;
  aulasConcluidas: number;
  error: string | null;
}

export function useMemberData(): MemberData {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [modulos, setModulos] = useState<ModuloComProgresso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize supabase client to avoid recreating on every render
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          console.error("Auth error:", authError?.message || "No user");
          if (!cancelled) {
            setError("Sessão não encontrada");
            setLoading(false);
          }
          return;
        }

        const [profileRes, modulosRes, aulasRes, progressoRes] =
          await Promise.all([
            supabase.from("profiles").select("*").eq("id", user.id).single(),
            supabase.from("modulos").select("*").order("ordem"),
            supabase.from("aulas").select("*").order("ordem"),
            supabase.from("progresso").select("*").eq("user_id", user.id),
          ]);

        if (cancelled) return;

        if (profileRes.error) {
          console.error("Profile error:", profileRes.error.message);
        }

        const profileData = profileRes.data as Profile | null;
        const modulosData = (modulosRes.data || []) as Modulo[];
        const aulasData = (aulasRes.data || []) as Aula[];
        const progressoData = (progressoRes.data || []) as Progresso[];

        setProfile(profileData);

        const progressoMap = new Map<string, boolean>();
        progressoData.forEach((p) => {
          if (p.concluida) progressoMap.set(p.aula_id, true);
        });

        const modulosComProgresso: ModuloComProgresso[] = modulosData.map(
          (modulo) => {
            const aulasDoModulo = aulasData.filter(
              (a) => a.modulo_id === modulo.id
            );
            const aulasConcluidas = aulasDoModulo.filter((a) =>
              progressoMap.get(a.id)
            ).length;

            return {
              ...modulo,
              aulas: aulasDoModulo,
              total_aulas: aulasDoModulo.length,
              aulas_concluidas: aulasConcluidas,
            };
          }
        );

        setModulos(modulosComProgresso);
      } catch (err) {
        console.error("Fetch error:", err);
        if (!cancelled) setError("Erro ao carregar dados");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const semanasLiberadas = profile
    ? calcularSemanasLiberadas(profile.data_inicio_jornada)
    : 0;

  const totalAulas = modulos.reduce((acc, m) => acc + m.total_aulas, 0);
  const aulasConcluidas = modulos.reduce(
    (acc, m) => acc + m.aulas_concluidas,
    0
  );

  return {
    profile,
    modulos,
    loading,
    semanasLiberadas,
    totalAulas,
    aulasConcluidas,
    error,
  };
}

export function useEstadoSemana(
  modulo: ModuloComProgresso,
  semanasLiberadas: number
) {
  const todasConcluidas =
    modulo.total_aulas > 0 &&
    modulo.aulas_concluidas === modulo.total_aulas;

  return getEstadoSemana(
    modulo.numero_semana,
    semanasLiberadas,
    todasConcluidas
  );
}
