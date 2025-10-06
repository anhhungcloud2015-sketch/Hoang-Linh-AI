
export interface ColorInfo {
  name: string;
  hex: string;
  cmyk_approx: string;
}

export interface FileOutput {
  filename: string;
  mime_type: 'image/png' | 'image/svg+xml';
  data: string; // base64 encoded string
}

export interface PatternData {
  analysis_summary: {
    pattern_name: string;
    description: string;
    repeat_type: 'straight' | 'half-drop' | 'half-brick' | 'mirror' | 'other';
    fidelity_notes: string;
  };
  tile_properties: {
    dpi: number;
    width_px: number;
    height_px: number;
    width_cm: number;
    height_cm: number;
  };
  color_palette: ColorInfo[];
  files: FileOutput[];
}
