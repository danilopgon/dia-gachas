#!/usr/bin/env bash
# Estado de la migración de Día de Gachas.
#
# Dos fuentes:
#   DETECTADO → se deriva del repositorio. No puede mentir.
#   DECLARADO → lo que dice docs/plan/42-estado.md. Lo escriben humanos/agentes.
#
# Si no coinciden, gana DETECTADO y el script avisa.
#
# Uso:  ./scripts/migration-status.sh [--quiet]

set -uo pipefail
cd "$(dirname "$0")/.." || exit 1

ESTADO_FILE="docs/plan/42-estado.md"
FE_PKG="frontend/package.json"
FE_SRC="frontend/src"
DOTNET="backend-dotnet"

OK="✅"; NO="⬜"; WIP="🔄"; SKIP="⏭️"; MANUAL="✋"

# ── helpers ──────────────────────────────────────────────────────────────────

ng_major() {
  [ -f "$FE_PKG" ] || { echo 0; return; }
  grep -oE '"@angular/core": *"[^"]+"' "$FE_PKG" \
    | grep -oE '[0-9]+' | head -1 || echo 0
}

# grep sobre código de aplicación, sin node_modules ni docs
appgrep() { grep -rqiE "$1" "${2:-$FE_SRC}" >/dev/null 2>&1 && return 0 || return 1; }

exists() { [ -e "$1" ]; }

# busca un identificador en el backend .NET
dotgrep() {
  [ -d "$DOTNET" ] || return 1
  grep -rqE "$1" "$DOTNET" --include='*.cs' >/dev/null 2>&1 && return 0 || return 1
}

declarado() { # $1 = número de fase (00..23)
  [ -f "$ESTADO_FILE" ] || { echo "$NO"; return; }
  local row
  row=$(grep -E "^\| *$1 *\|" "$ESTADO_FILE" | head -1)
  [ -z "$row" ] && { echo "$NO"; return; }
  echo "$row" | awk -F'|' '{gsub(/ /,"",$3); print $3}' | grep -oE "$OK|$WIP|$SKIP|$NO" | head -1 || echo "$NO"
}

# ── señales de verificación, fase a fase ─────────────────────────────────────
# Cada función devuelve 0 si la fase está hecha, 1 si no, 2 si no es derivable.

check_00() { git tag --list 'baseline/*' | grep -q . ; }
check_01() { [ "$(ng_major)" -ge 20 ] 2>/dev/null; }
check_02() { [ "$(ng_major)" -ge 21 ] 2>/dev/null; }
check_03() { ! appgrep '<p-(button|floatlabel|popover|toast)|p-button|p-floatLabel'; }
check_04() { ! appgrep 'p-autoComplete|<p-autocomplete' && appgrep 'class CityAutocompleteComponent'; }
check_05() { ! appgrep 'prime' && ! grep -qi 'prime' "$FE_PKG" 2>/dev/null; }
check_06() { [ "$(ng_major)" -ge 22 ] 2>/dev/null; }
check_07() { ! grep -q '"zone.js"' "$FE_PKG" 2>/dev/null && ! appgrep 'provideZoneChangeDetection'; }
check_08() { grep -q '"vitest"' "$FE_PKG" 2>/dev/null && ! exists frontend/jest.config.js; }
check_09() { appgrep 'httpResource'; }
check_10() { exists "$DOTNET/src/DiaGachas.Api"; }
check_11() { dotgrep 'SearchCitiesQuery'; }
check_12() { dotgrep 'ImportMunicipalityCatalogCommand'; }
check_13() { dotgrep 'AemetForecastProvider' && dotgrep 'AemetForecastMapper'; }
check_14() { dotgrep 'GachasScoringPolicy'; }
check_15() { dotgrep 'GetWeatherForecastQuery'; }
check_16() { dotgrep 'HybridCache|AddRateLimiter'; }
check_17() { dotgrep 'BestForGachas'; }
check_18() { return 2; }   # a qué API apunta el deploy: no vive en el repo
check_19() { appgrep 'gachasReasons|GachasReasons'; }
check_20() { exists "$DOTNET/tests/DiaGachas.ContractTests" || appgrep 'contract' "$DOTNET" ; }
check_21() { return 2; }   # staging desplegado: no vive en el repo
check_22() { return 2; }   # cutover DNS: no vive en el repo
check_23() { ! exists backend/src/app.module.ts; }

FASES=(
  "00|Baseline|docs/plan/40-fases.md"
  "01|Angular 20|docs/frontend/10-angular-upgrade.md"
  "02|Angular 21|docs/frontend/10-angular-upgrade.md"
  "03|PrimeNG removal: primitives|docs/frontend/12-primeng-sustituciones.md"
  "04|Autocomplete accesible|docs/frontend/14-autocomplete-accesible.md"
  "05|PrimeNG purge|docs/frontend/11-primeng-decision.md"
  "06|Angular 22|docs/frontend/10-angular-upgrade.md"
  "07|Zoneless / OnPush|docs/frontend/15-reactividad-signals.md"
  "08|Vitest|docs/frontend/17-testing-frontend.md"
  "09|Angular modern API refactor|docs/frontend/15-reactividad-signals.md"
  "10|.NET skeleton|docs/backend/20-arquitectura.md"
  "11|Cities|docs/backend/22-cities.md"
  "12|Municipality import|docs/backend/22-cities.md"
  "13|AEMET infrastructure|docs/backend/23-aemet.md"
  "14|Gachas domain|docs/backend/24-dominio-gachas.md"
  "15|Weather query|docs/backend/25-contratos-api.md"
  "16|Resilience|docs/backend/26-resiliencia.md"
  "17|Nuevo Weather contract|docs/backend/25-contratos-api.md"
  "18|Angular/.NET integration|docs/plan/40-fases.md"
  "19|Nueva UI Weather|docs/frontend/16-ui-veredicto-y-share.md"
  "20|Contract parity|docs/backend/25-contratos-api.md"
  "21|Staging|docs/ops/30-docker-coolify.md"
  "22|Cutover|docs/ops/30-docker-coolify.md"
  "23|Nest retirement|docs/plan/40-fases.md"
)

# ── informe ──────────────────────────────────────────────────────────────────

printf '\n  Día de Gachas — estado de la migración\n'
printf '  Angular %s · backend .NET %s\n\n' \
  "$(ng_major)" "$([ -d "$DOTNET" ] && echo presente || echo ausente)"
printf '  %-5s %-11s %-11s %s\n' "FASE" "DECLARADO" "DETECTADO" "DESCRIPCIÓN"
printf '  %s\n' "──────────────────────────────────────────────────────────────────"

siguiente=""; siguiente_doc=""; avisos=()

for f in "${FASES[@]}"; do
  IFS='|' read -r num desc doc <<< "$f"
  dec=$(declarado "$num")
  "check_$num" >/dev/null 2>&1; rc=$?
  case $rc in
    0) det="$OK" ;;
    2) det="$MANUAL" ;;
    *) det="$NO" ;;
  esac

  # la fase actual es la primera que no está hecha ni omitida
  if [ -z "$siguiente" ] && [ "$det" != "$OK" ] && [ "$dec" != "$SKIP" ]; then
    if [ "$det" = "$MANUAL" ] && [ "$dec" = "$OK" ]; then :; else
      siguiente="$num — $desc"; siguiente_doc="$doc"
    fi
  fi

  # incoherencias entre lo declarado y lo detectado
  if [ "$dec" = "$OK" ] && [ "$det" = "$NO" ]; then
    avisos+=("Fase $num declarada hecha, pero el repo dice que no. Revisa $ESTADO_FILE.")
  fi
  if [ "$dec" = "$NO" ] && [ "$det" = "$OK" ]; then
    avisos+=("Fase $num hecha en el repo pero sin registrar. Actualiza $ESTADO_FILE.")
  fi

  printf '  %-5s %s%s%s%s%s\n' "$num" "$dec" "         " "$det" "         " "$desc"
done

printf '\n  Leyenda: %s hecha · %s en curso · %s pendiente · %s omitida · %s no derivable del repo\n' \
  "$OK" "$WIP" "$NO" "$SKIP" "$MANUAL"

if [ -n "$siguiente" ]; then
  printf '\n  → Fase actual: %s\n' "$siguiente"
  printf '    Lee: %s\n' "$siguiente_doc"
else
  printf '\n  → Migración completa. Ve a por harina de almortas.\n'
fi

if [ ${#avisos[@]} -gt 0 ]; then
  printf '\n  ⚠  Incoherencias:\n'
  for a in "${avisos[@]}"; do printf '     · %s\n' "$a"; done
fi
printf '\n'
