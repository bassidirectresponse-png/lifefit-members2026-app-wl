"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import type {
  Profile,
  ModuloComProgresso,
  Modulo,
  Aula,
  Progresso,
  UserPurchase,
  EstadoModulo,
} from "@/types/database";
import {
  calcularSemanasLiberadas,
  getEstadoModulo,
  diasParaDesbloquearDrip,
} from "@/lib/utils";

interface MemberData {
  profile: Profile | null;
  modulos: ModuloComProgresso[];
  purchases: UserPurchase[];
  loading: boolean;
  semanasLiberadas: number;
  totalAulas: number;
  aulasConcluidas: number;
  error: string | null;
}

export function useMemberData(): MemberData {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [modulos, setModulos] = useState<ModuloComProgresso[]>([]);
  const [purchases, setPurchases] = useState<UserPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          if (!cancelled) { setError("Session non trouvée"); setLoading(false); }
          return;
        }

        const [profileRes, modulosRes, aulasRes, progressoRes, purchasesRes] =
          await Promise.all([
            supabase.from("profiles").select("*").eq("id", user.id).single(),
            supabase.from("modulos").select("*").order("ordem"),
            supabase.from("aulas").select("*").order("ordem"),
            supabase.from("progresso").select("*").eq("user_id", user.id),
            supabase.from("user_purchases").select("*").eq("user_id", user.id),
          ]);

        if (cancelled) return;

        const profileData = profileRes.data as Profile | null;
        const modulosData = (modulosRes.data || []) as Modulo[];
        const aulasData = (aulasRes.data || []) as Aula[];
        const progressoData = (progressoRes.data || []) as Progresso[];
        const purchasesData = (purchasesRes.data || []) as UserPurchase[];

        setProfile(profileData);
        setPurchases(purchasesData);

        const progressoMap = new Map<string, boolean>();
        progressoData.forEach((p) => { if (p.concluida) progressoMap.set(p.aula_id, true); });

        const modulosComProgresso: ModuloComProgresso[] = modulosData.map((modulo) => {
          const aulasDoModulo = aulasData.filter((a) => a.modulo_id === modulo.id);
          const aulasConcluidas = aulasDoModulo.filter((a) => progressoMap.get(a.id)).length;
          return {
            ...modulo,
            aulas: aulasDoModulo,
            total_aulas: aulasDoModulo.length,
            aulas_concluidas: aulasConcluidas,
          };
        });

        setModulos(modulosComProgresso);
      } catch {
        if (!cancelled) setError("Erreur de chargement");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, [supabase]);

  const semanasLiberadas = profile ? calcularSemanasLiberadas(profile.data_inicio_jornada) : 0;
  const totalAulas = modulos.reduce((acc, m) => acc + m.total_aulas, 0);
  const aulasConcluidas = modulos.reduce((acc, m) => acc + m.aulas_concluidas, 0);

  return { profile, modulos, purchases, loading, semanasLiberadas, totalAulas, aulasConcluidas, error };
}

/**
 * Helper: get estado of a module considering tipo, drip, purchases
 */
export function useModuleEstado(
  modulo: ModuloComProgresso,
  dataInicioJornada: string,
  purchases: UserPurchase[]
): { estado: EstadoModulo; diasRestantes: number } {
  const purchased = purchases.some((p) => p.modulo_id === modulo.id);

  const estado = getEstadoModulo({
    tipo: modulo.tipo || "main",
    unlockAfterDays: modulo.unlock_after_days || 0,
    dataInicioJornada,
    todasAulasConcluidas: modulo.total_aulas > 0 && modulo.aulas_concluidas === modulo.total_aulas,
    totalAulas: modulo.total_aulas,
    purchased,
  });

  const diasRestantes = estado === "bloqueada"
    ? diasParaDesbloquearDrip(modulo.unlock_after_days || 0, dataInicioJornada)
    : 0;

  return { estado, diasRestantes };
}
