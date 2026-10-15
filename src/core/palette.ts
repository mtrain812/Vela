// The semantic palette — every fixed color Vela ships that is NOT part of a swappable
// `VelaTheme`. These are brand/meaning constants (an accent stays the accent whichever
// theme is active), so they live here once instead of being retyped as literals in the
// chrome, the pickers, the defaults and the tokens.
//
// Theme-dependent colors (surfaces, text, borders, candles) belong to `VelaTheme` in
// `theme.ts` and must NOT be duplicated here.

/** Selection/menu accent — active entries, "native" badges, selected controls. */
export const ACCENT = '#2962ff';

/** The lighter brand blue: "on" affordances and the default drawing color, brighter than
 *  {@link ACCENT} so a switch reads clearly enabled. */
export const ACCENT_BRIGHT = '#38c0fd';

/** Bullish/bearish reference pair — the dark theme's candle colors, reused wherever a
 *  fixed directional color is needed outside a theme (volume profiles, baseline defaults). */
export const BULLISH = '#089981';
export const BEARISH = '#f23645';

/** Neutral gray for de-emphasized geometry (unstyled level lines, gann 1/1 diagonals). */
export const NEUTRAL = '#787b86';

/** Attention amber — favorited items. */
export const HIGHLIGHT = '#e0b400';

/** Warm accent used by the categorical palette and warning-ish marks. */
export const WARNING = '#ff9800';

/** Soft informational blue — statistical overlays (regression, VWAP) and the blue rung of the
 *  drawing level palette, which should read as derived data rather than user-drawn geometry. */
export const INFO = '#5b9cf6';

/** Highlighter ink — a saturated marker orange, always drawn translucent. */
export const MARKER = '#ff5d00';

/** Validity tints — a pattern that satisfies its rules vs one that does not. Brighter and
 *  cooler than {@link BULLISH}/{@link BEARISH} so a validity wash never reads as direction. */
export const VALID = '#0ecb81';
export const INVALID = '#f6465d';

/** Market-session states beside the theme's up-colored "open": pre-market dawn amber,
 *  post-market dusk sky, and the shared closed/holiday gray (statusline badge). */
export const SESSION_PRE = '#f97316';
export const SESSION_POST = '#0ea5e9';
export const SESSION_OFF = '#9ca3af';

/** Default color of a plain line/area series — a softer blue than {@link ACCENT}, which is
 *  reserved for interactive chrome. */
export const SERIES_LINE = '#3b82f6';

/** Crosshair ink: a cool gray that stays legible over both candles and empty surface. */
export const CROSSHAIR = '#9aa0ad';

/** Fixed slate plates for canvas badges that float over chart content of any color (info
 *  badges on drawings) — they cannot follow the theme surface and stay readable.
 *  `SLATE_DEEP` is the plate, `SLATE` its border. */
export const SLATE_DEEP = '#1e293b';
export const SLATE = '#475569';

/** The crosshair's axis chips: a fixed mid gray, brighter than the dark chart surface so the
 *  chip stands off the axis on both themes while its white ink stays readable. */
export const CHIP_PLATE = '#595959';

/** Strategy trade markers — entry arrows per position side, and the exits' shared violet.
 *  The entry pair deliberately reuses the accent blue / bearish red (the reference palette
 *  of order-fill marks); the violet keeps exits apart from both directions. */
export const TRADE_LONG = ACCENT;
export const TRADE_SHORT = BEARISH;
export const TRADE_EXIT = '#d500f9';

/** Categorical hues for auto-assigned colors (symbol badges, multi-series defaults).
 *  Ordered for adjacent-hue contrast, not by hue family. */
export const CATEGORICAL: readonly string[] = [ACCENT, BULLISH, BEARISH, WARNING, '#7e57c2', '#26a69a', INFO, '#e573b5'];

/** Pick a stable categorical color for a string key (same key ⇒ same color). */
export function categoricalColor(key: string): string {
    let h = 0;
    for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
    return CATEGORICAL[h % CATEGORICAL.length]!;
}

/** Color-picker swatch table — the Material Design scale (the convention traders know
 *  from TradingView's picker). Columns: red · orange · yellow · green · teal · cyan ·
 *  blue · indigo · purple · pink. Rows: the vivid 500 base first (TradingView order),
 *  then tints→shades 100→900. The picker prepends its own grayscale row. */
export const SWATCH_SHADES: ReadonlyArray<readonly string[]> = [
    ['#f44336', '#ff9800', '#ffeb3b', '#4caf50', '#009688', '#00bcd4', '#2196f3', '#3f51b5', '#9c27b0', '#e91e63'], // 500
    ['#ffcdd2', '#ffe0b2', '#fff9c4', '#c8e6c9', '#b2dfdb', '#b2ebf2', '#bbdefb', '#c5cae9', '#e1bee7', '#f8bbd0'], // 100
    ['#ef9a9a', '#ffcc80', '#fff59d', '#a5d6a7', '#80cbc4', '#80deea', '#90caf9', '#9fa8da', '#ce93d8', '#f48fb1'], // 200
    ['#e57373', '#ffb74d', '#fff176', '#81c784', '#4db6ac', '#4dd0e1', '#64b5f6', '#7986cb', '#ba68c8', '#f06292'], // 300
    ['#ef5350', '#ffa726', '#ffee58', '#66bb6a', '#26a69a', '#26c6da', '#42a5f5', '#5c6bc0', '#ab47bc', '#ec407a'], // 400
    ['#d32f2f', '#f57c00', '#fbc02d', '#388e3c', '#00796b', '#0097a7', '#1976d2', '#303f9f', '#7b1fa2', '#c2185b'], // 700
    ['#b71c1c', '#e65100', '#f57f17', '#1b5e20', '#004d40', '#006064', '#0d47a1', '#1a237e', '#4a148c', '#880e4f'], // 900
];
