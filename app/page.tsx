"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { supabase, Combatant } from "@/lib/supabaseClient";
import styles from "./page.module.css";

export default function Home() {
  const [combatants, setCombatants] = useState<Combatant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});

  const fetchCombatants = useCallback(async () => {
    const { data, error } = await supabase
      .from("combatants")
      .select("*")
      .order("iniciativa", { ascending: false })
      .order("created_at", { ascending: true });
    if (error) {
      setError(error.message);
    } else {
      setCombatants(data as Combatant[]);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCombatants();

    const channel = supabase
      .channel("combatants-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "combatants" },
        () => {
          fetchCombatants();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchCombatants]);

  const sorted = [...combatants].sort((a, b) => {
    if (b.iniciativa !== a.iniciativa) return b.iniciativa - a.iniciativa;
    return 0;
  });

  async function addCombatant() {
    const { error } = await supabase.from("combatants").insert({
      nombre: "Nuevo combatiente",
      hp_max: 10,
      hp: 10,
      iniciativa: 0,
      activo: false,
    });
    if (error) setError(error.message);
  }

  async function removeCombatant(id: string) {
    setCombatants((prev) => prev.filter((c) => c.id !== id));
    const { error } = await supabase.from("combatants").delete().eq("id", id);
    if (error) setError(error.message);
  }

  // Actualiza el estado local al instante y manda el cambio a Supabase
  // con un pequeño debounce para no saturar la base con cada tecla.
  function updateLocal(id: string, patch: Partial<Combatant>) {
    setCombatants((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch } : c))
    );

    if (debounceTimers.current[id]) {
      clearTimeout(debounceTimers.current[id]);
    }
    debounceTimers.current[id] = setTimeout(async () => {
      const { error } = await supabase
        .from("combatants")
        .update(patch)
        .eq("id", id);
      if (error) setError(error.message);
    }, 350);
  }

  async function setActivo(id: string) {
    const current = combatants.find((c) => c.id === id);
    const willActivate = !current?.activo;

    // Optimista: desactiva todos, activa el elegido (si corresponde)
    setCombatants((prev) =>
      prev.map((c) => ({ ...c, activo: willActivate && c.id === id }))
    );

    await supabase.from("combatants").update({ activo: false }).neq("id", id);
    const { error } = await supabase
      .from("combatants")
      .update({ activo: willActivate })
      .eq("id", id);
    if (error) setError(error.message);
  }

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <span className={styles.torch}>🔥</span>
          <h1 className={styles.title}>Orden de Iniciativa</h1>
        </div>
        <p className={styles.subtitle}>
          Quien lidera la fila actúa primero. Tocá la llama para marcar el turno activo.
        </p>
      </header>

      {error && (
        <div className={styles.errorBanner}>
          Error de conexión con Supabase: {error}
        </div>
      )}

      <div className={styles.toolbar}>
        <button className={styles.addButton} onClick={addCombatant}>
          + Sumar combatiente
        </button>
        <span className={styles.count}>
          {combatants.length} en combate
        </span>
      </div>

      {loading ? (
        <p className={styles.empty}>Invocando la mesa de combate…</p>
      ) : sorted.length === 0 ? (
        <div className={styles.empty}>
          Todavía no hay nadie en el orden de turnos. Sumá el primer combatiente.
        </div>
      ) : (
        <ol className={styles.list}>
          {sorted.map((c, idx) => (
            <CombatantRow
              key={c.id}
              combatant={c}
              position={idx + 1}
              onUpdate={updateLocal}
              onRemove={removeCombatant}
              onToggleActive={setActivo}
            />
          ))}
        </ol>
      )}
    </main>
  );
}

function CombatantRow({
  combatant,
  position,
  onUpdate,
  onRemove,
  onToggleActive,
}: {
  combatant: Combatant;
  position: number;
  onUpdate: (id: string, patch: Partial<Combatant>) => void;
  onRemove: (id: string) => void;
  onToggleActive: (id: string) => void;
}) {
  const hpPct = combatant.hp_max > 0
    ? Math.max(0, Math.min(100, (combatant.hp / combatant.hp_max) * 100))
    : 0;

  const hpState =
    hpPct <= 0 ? "down" : hpPct <= 30 ? "critical" : hpPct <= 60 ? "hurt" : "healthy";

  return (
    <li
      className={`${styles.row} ${combatant.activo ? styles.rowActive : ""}`}
    >
      <button
        className={styles.flameButton}
        onClick={() => onToggleActive(combatant.id)}
        title={combatant.activo ? "Es su turno" : "Marcar como turno activo"}
        aria-pressed={combatant.activo}
      >
        {combatant.activo ? "🔥" : "○"}
      </button>

      <span className={styles.position}>{position}</span>

      <input
        className={styles.nameInput}
        value={combatant.nombre}
        onChange={(e) => onUpdate(combatant.id, { nombre: e.target.value })}
        placeholder="Nombre"
      />

      <div className={styles.iniciativaField}>
        <label className={styles.fieldLabel}>Iniciativa</label>
        <input
          type="number"
          className={styles.iniciativaInput}
          value={combatant.iniciativa}
          onChange={(e) =>
            onUpdate(combatant.id, { iniciativa: Number(e.target.value) })
          }
        />
      </div>

      <div className={styles.hpField}>
        <label className={styles.fieldLabel}>HP</label>
        <div className={styles.hpInputs}>
          <input
            type="number"
            className={styles.hpInput}
            value={combatant.hp}
            onChange={(e) =>
              onUpdate(combatant.id, { hp: Number(e.target.value) })
            }
          />
          <span className={styles.hpSlash}>/</span>
          <input
            type="number"
            className={styles.hpInput}
            value={combatant.hp_max}
            onChange={(e) =>
              onUpdate(combatant.id, { hp_max: Number(e.target.value) })
            }
          />
        </div>
        <div className={styles.hpBarTrack}>
          <div
            className={`${styles.hpBarFill} ${styles["hp_" + hpState]}`}
            style={{ width: `${hpPct}%` }}
          />
        </div>
      </div>

      <button
        className={styles.removeButton}
        onClick={() => onRemove(combatant.id)}
        title="Quitar del combate"
      >
        ✕
      </button>
    </li>
  );
}
