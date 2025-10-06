import { GoogleGenAI, Type } from "@google/genai";
import { PatternData } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const systemInstruction = `
You are an expert AI 'pattern digitizer' for the fashion and textile industry. Your primary task is to analyze an image of a person wearing clothing with a pattern and generate a perfectly seamless, print-ready pattern tile.

Your process must follow these steps precisely:
1.  **Isolate Pattern:** Identify the main area of patterned fabric in the uploaded image.
2.  **Correct Distortion:** Analyze and correct for any perspective distortion (keystone effect), wrinkles, or fabric drape to create a flattened, 2D representation of the pattern. All lines in the final tile must be perfectly horizontal or vertical if they appear to be a grid. This straightening process must be precise.
3.  **Enhance Image Quality:** Before tracing, digitally clean the flattened pattern image. Reduce image noise and compression artifacts. Enhance the clarity and definition of the pattern's edges to ensure a crisp, high-fidelity reconstruction. This step is crucial for accurate tracing and vectorization.
4.  **Trace & Reconstruct:** Accurately trace and vectorize the core motifs of the pattern from the enhanced image. You must preserve the original's essential characteristics: motif shapes, layout, scale, repeat distances, and color palette.
5.  **Identify Repeat Type:** Determine the pattern's repeat style (e.g., straight, half-drop, half-brick, mirror).
6.  **Generate Seamless Tile:** Create a single, perfectly seamless 'repeat unit' tile. When this tile is placed side-by-side with itself, there should be no visible seams or breaks in the pattern.
7.  **Handle Logos:** If any logos, brand names, or wordmarks are part of the pattern, you MUST remove them completely. Do not replicate them.
8.  **Output Generation:**
    *   Produce a high-resolution PNG file of the tile (approx. 30x30 cm @ 300 DPI, which is about 3543x3543 px, but can be smaller for simple patterns). The PNG must have a transparent background.
    *   Produce an SVG vector file of the tile if the pattern consists of clear, simple shapes with distinct edges. If the pattern is too complex, noisy, or painterly for vectorization, state this in the fidelity notes and do not generate an SVG file.
    *   Extract the primary colors into a color palette.
    *   Package all information and file data into a single JSON object that conforms to the provided schema.

**Quality Constraints:**
*   **Fidelity:** The result must be an exact digital twin of the original pattern. Do not add new elements, simplify, or 'beautify' the pattern unless explicitly asked.
*   **Precision:** Geometric patterns (stripes, checks, dots) must have perfect alignment and spacing.
*   **Color:** The extracted color palette (in HEX) must be accurate. Provide an estimated CMYK conversion for print purposes.
*   **Clarity:** If the input image is too blurry, wrinkled, or low-resolution to produce a high-fidelity result, clearly state the limitations and any assumptions made in the 'fidelity_notes'.
`;

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    analysis_summary: {
      type: Type.OBJECT,
      properties: {
        pattern_name: { type: Type.STRING, description: "Tên mô tả cho họa tiết, ví dụ: 'Kẻ Sọc Caro Xanh' hoặc 'Họa Tiết Hoa Cổ Điển'." },
        description: { type: Type.STRING, description: "Mô tả ngắn gọn về phong cách và các yếu tố của họa tiết." },
        repeat_type: { type: Type.STRING, enum: ['straight', 'half-drop', 'half-brick', 'mirror', 'other'], description: "Kiểu lặp lại đã xác định của họa tiết." },
        fidelity_notes: { type: Type.STRING, description: "Ghi chú về chất lượng số hóa, bao gồm mọi giả định do chất lượng ảnh hoặc nếu không thể vector hóa." },
      },
      required: ["pattern_name", "description", "repeat_type", "fidelity_notes"],
    },
    tile_properties: {
      type: Type.OBJECT,
      properties: {
        dpi: { type: Type.NUMBER, description: "Dots Per Inch của các tệp đầu ra, nên là 300." },
        width_px: { type: Type.NUMBER, description: "Chiều rộng của mẫu lặp liền mạch tính bằng pixel." },
        height_px: { type: Type.NUMBER, description: "Chiều cao của mẫu lặp liền mạch tính bằng pixel." },
        width_cm: { type: Type.NUMBER, description: "Chiều rộng thực tế ước tính của mẫu lặp tính bằng centimet." },
        height_cm: { type: Type.NUMBER, description: "Chiều cao thực tế ước tính của mẫu lặp tính bằng centimet." },
      },
      required: ["dpi", "width_px", "height_px", "width_cm", "height_cm"],
    },
    color_palette: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Tên mô tả cho màu sắc, ví dụ: 'Xanh Navy' hoặc 'Trắng Kem'." },
          hex: { type: Type.STRING, description: "Mã màu ở định dạng HEX, ví dụ: '#FFFFFF'." },
          cmyk_approx: { type: Type.STRING, description: "Giá trị chuyển đổi CMYK ước tính để in, ví dụ: 'C91 M79 Y0 K0'." },
        },
        required: ["name", "hex", "cmyk_approx"],
      },
    },
    files: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          filename: { type: Type.STRING, description: "Tên tệp được đề xuất, ví dụ: 'hoa-tiet-caro.png'." },
          mime_type: { type: Type.STRING, enum: ['image/png', 'image/svg+xml'], description: "Loại MIME của tệp." },
          data: { type: Type.STRING, description: "Chuỗi nội dung tệp được mã hóa base64." },
        },
        required: ["filename", "mime_type", "data"],
      },
    },
  },
  required: ["analysis_summary", "tile_properties", "color_palette", "files"],
};


export const digitizePattern = async (base64Image: string, mimeType: string): Promise<PatternData> => {
  const imagePart = {
    inlineData: {
      data: base64Image,
      mimeType: mimeType,
    },
  };

  const textPart = {
    text: "Analyze the provided image of clothing and perform the pattern digitization process as per your instructions. Generate the seamless pattern tile files and all associated metadata.",
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [textPart, imagePart] },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.1, // Lower temperature for more deterministic, precise results
      },
    });

    const jsonText = response.text.trim();
    const patternData: PatternData = JSON.parse(jsonText);
    
    if (!patternData.files || patternData.files.length === 0) {
      throw new Error("AI response did not include any downloadable files.");
    }
    
    return patternData;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to digitize pattern: ${error.message}`);
    }
    throw new Error("An unknown error occurred during pattern digitization.");
  }
};