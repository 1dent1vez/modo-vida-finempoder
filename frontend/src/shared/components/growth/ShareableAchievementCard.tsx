// FinEmpoder — Tarjeta de logro compartible (F3-CRECIMIENTO).
// Nodo fijo 1080x1080 montado fuera de pantalla para html-to-image (toPng).
// Colores FIJOS en hex (no CSS vars) a propósito: la tarjeta debe renderizar
// idéntica dentro y fuera del navegador; los valores copian los tokens del
// tema (crema #FEF3C7, azul #1B4FD8, etc.) y se documentan en F3_CRECIMIENTO.md.

import { forwardRef } from 'react';
import type { BadgeSeries, BadgeStats, TierLevel } from '../../../data/badges';
import { serieTitulo } from '../../../data/badges';
import { SERIE_CARD_STYLE } from '../../../lib/serieCardStyle';
import { serieDatoReal } from '../../../lib/shareAchievement';

const FONT = '"Plus Jakarta Sans", "Nunito", system-ui, -apple-system, sans-serif';

export interface ShareableAchievementCardProps {
  serie: BadgeSeries;
  nivel: TierLevel;
  stats: BadgeStats;
  /** Frase de Finni para la serie (la misma fuente del modal). */
  frase?: string;
}

export const ShareableAchievementCard = forwardRef<HTMLDivElement, ShareableAchievementCardProps>(
  function ShareableAchievementCard({ serie, nivel, stats, frase }, ref) {
    const style = SERIE_CARD_STYLE[serie.id] ?? SERIE_CARD_STYLE.presupuesto;
    const dato = serieDatoReal(serie.id, stats);
    const Icon = serie.icon;

    return (
      <div
        ref={ref}
        data-testid="shareable-achievement-card"
        aria-hidden="true"
        style={{
          position: 'fixed',
          left: -9999,
          top: 0,
          width: 1080,
          height: 1080,
          overflow: 'hidden',
          backgroundColor: '#FEF3C7',
          borderRadius: 64,
          boxShadow: '0 24px 64px rgba(15, 23, 42, 0.18)',
          color: '#0F172A',
          fontFamily: FONT,
          display: 'flex',
          flexDirection: 'column',
          padding: 88,
        }}
      >
        {/* Marca */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: 9999,
              backgroundColor: style.accent,
            }}
          />
          <div>
            <p
              style={{
                margin: 0,
                fontSize: 44,
                fontWeight: 800,
                letterSpacing: '-0.5px',
                lineHeight: 1.1,
              }}
            >
              FinEMPODER
            </p>
            <p
              style={{
                margin: 4,
                fontSize: 28,
                fontWeight: 500,
                color: '#475569',
                lineHeight: 1.2,
              }}
            >
              Finanzas para todos
            </p>
          </div>
        </div>

        {/* Contenido central */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 208,
              height: 208,
              borderRadius: 104,
              backgroundColor: style.pillBg,
            }}
          >
            <Icon style={{ width: 112, height: 112, color: style.iconColor }} strokeWidth={1.75} />
          </span>

          <h2
            style={{
              margin: '40px 0 0',
              fontSize: 64,
              fontWeight: 800,
              letterSpacing: '-1px',
              lineHeight: 1.15,
            }}
          >
            {serieTitulo(serie, nivel)}
          </h2>

          {frase ? (
            <p
              style={{
                margin: '28px 0 0',
                maxWidth: 820,
                fontSize: 34,
                fontWeight: 500,
                color: '#475569',
                lineHeight: 1.5,
              }}
            >
              {frase}
            </p>
          ) : null}

          <span
            style={{
              marginTop: 40,
              padding: '20px 40px',
              borderRadius: 9999,
              backgroundColor: '#FFFFFF',
              color: style.accent,
              fontSize: 32,
              fontWeight: 800,
              lineHeight: 1.2,
            }}
          >
            {dato}
          </span>
        </div>

        {/* Pie */}
        <p
          style={{
            margin: 0,
            paddingTop: 32,
            borderTop: '2px solid rgba(15, 23, 42, 0.1)',
            textAlign: 'center',
            fontSize: 26,
            fontWeight: 500,
            color: '#475569',
          }}
        >
          Hecho con FinEMPODER · finanzas para todos
        </p>
      </div>
    );
  },
);
