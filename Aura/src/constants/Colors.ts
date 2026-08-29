// 1. RAW COLOR PRIMITIVES (CDS Base Scales)
export const Palette = {
  blue: {
    0: '#F5F8FF',
    5: '#D3E1FF',
    10: '#B0CAFF',
    20: '#73A2FF',
    40: '#266EFF',
    60: '#0052FF', // Coinbase Brand Blue
    70: '#004BEB',
    80: '#003EC1',
  },
  gray: {
    0: '#FFFFFF',   // Pure White Canvas
    5: '#F7F8F9',   // Canvas Alternate
    10: '#EEF0F3',  // Surface Soft / Hairline Light
    15: '#DEE1E6',  // Hairline Default
    20: '#CED2DB',  // Border Heavy
    30: '#B1B7C3',
    40: '#89909E',
    50: '#717886',  // Muted Mid-tone
    60: '#5B616E',  // Body Text Gray
    70: '#464B55',
    80: '#32353D',  // Elevated Dark Surface 2
    90: '#1E2025',  // Elevated Dark Surface 1 (#16181C)
    100: '#0A0B0D', // Base Dark Canvas / Ink Black
  },
  green: {
    10: '#A3EBCD',
    60: '#05B169',  // Trade Up / Positive
    70: '#047043',
  },
  red: {
    10: '#FDCED2',
    60: '#CF202F',  // Trade Down / Negative / Danger
    70: '#A81423',
  },
  orange: {
    50: '#F4B000',  // Warning / Brand Yellow-Orange Accent
    60: '#CF470E',
  },
} as const;

// 2. SEMANTIC TOKEN TYPE SPECIFICATION
export type ThemeTokens = {
  // Page / Canvas Surfaces
  background: string;
  backgroundAlt: string;
  surface: string;
  surfaceElevated: string;

  // Text & Typography
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;

  // Brand & Action CTAs
  primary: string;
  primaryHover: string;
  primaryActive: string;
  primaryDisabled: string;
  onPrimary: string;

  //Button
  buttonPrimary: string,
  buttonSecondary: string,

  // Lines, Hairlines & Separators
  border: string;
  borderSoft: string;
  borderFocus: string;

  // Financial Trading & Status Semantics
  positive: string;
  negative: string;
  warning: string;

  // Effects & Overlays
  shadow: string;
  overlay: string;
  glass: string;
};

// 3. FULL LIGHT & DARK COLOR TOKENS
export const Colors: { light: ThemeTokens; dark: ThemeTokens } = {
  light: {
    // Canvas & Surfaces
    background: Palette.gray[0],          // #FFFFFF
    backgroundAlt: Palette.gray[5],       // #F7F8F9
    surface: Palette.gray[10],            // #EEF0F3
    surfaceElevated: Palette.gray[0],    // #FFFFFF

    // Text & Typography
    textPrimary: Palette.gray[100],       // #0A0B0D (Ink)
    textSecondary: Palette.gray[60],      // #5B616E
    textMuted: Palette.gray[50],          // #717886
    textInverse: Palette.gray[0],         // #FFFFFF

    // Brand & Buttons
    primary: Palette.blue[60],            // #0052FF
    primaryHover: Palette.blue[70],       // #004BEB
    primaryActive: Palette.blue[80],      // #003EC1
    primaryDisabled: Palette.blue[10],    // #B0CAFF
    onPrimary: Palette.gray[0],           // #FFFFFF

    //Button
    buttonPrimary: Palette.blue[60],
    buttonSecondary: Palette.gray[10],

    // Borders & Hairlines
    border: Palette.gray[15],             // #DEE1E6
    borderSoft: Palette.gray[10],         // #EEF0F3
    borderFocus: Palette.blue[60],        // #0052FF

    // Trading & Status
    positive: Palette.green[60],          // #05B169
    negative: Palette.red[60],            // #CF202F
    warning: Palette.orange[50],          // #F4B000

    // Effects
    shadow: 'rgba(10, 11, 13, 0.08)',
    overlay: 'rgba(10, 11, 13, 0.40)',
    glass: 'rgba(255, 255, 255, 0.85)',
  },

  dark: {
    // Canvas & Surfaces
    background: Palette.gray[100],        // #0A0B0D
    backgroundAlt: Palette.gray[90],      // #1E2025
    surface: Palette.gray[90],           // #16181C
    surfaceElevated: Palette.gray[80],    // #32353D

    // Text & Typography
    textPrimary: Palette.gray[0],         // #FFFFFF
    textSecondary: Palette.gray[40],      // #89909E
    textMuted: Palette.gray[50],          // #717886
    textInverse: Palette.gray[100],       // #0A0B0D

    // Brand & Buttons
    primary: Palette.blue[60],            // #0052FF
    primaryHover: Palette.blue[40],       // #266EFF
    primaryActive: Palette.blue[20],      // #73A2FF
    primaryDisabled: '#1C2B4D',
    onPrimary: Palette.gray[0],           // #FFFFFF

    //Button
    buttonPrimary: Palette.blue[60],
    buttonSecondary: Palette.gray[60],

    // Borders & Hairlines
    border: Palette.gray[80],             // #32353D
    borderSoft: Palette.gray[90],         // #1E2025
    borderFocus: Palette.blue[60],        // #0052FF

    // Trading & Status
    positive: Palette.green[60],          // #05B169
    negative: Palette.red[60],            // #CF202F
    warning: Palette.orange[50],          // #F4B000

    // Effects
    shadow: 'rgba(0, 0, 0, 0.60)',
    overlay: 'rgba(0, 0, 0, 0.70)',
    glass: 'rgba(10, 11, 13, 0.85)',
  },
};