import React, { useState } from 'react';
import { PatternData } from './types';
import { digitizePattern } from './services/geminiService';
import ImageUploader from './components/ImageUploader';
import LoadingState from './components/LoadingState';
import ResultsDisplay from './components/ResultsDisplay';
import Icon from './components/Icon';

// Helper to convert file to base64
const fileToBase64 = (file: File): Promise<{ base64: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve({ base64, mimeType: file.type });
    };
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
};

const App: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);
  const [patternData, setPatternData] = useState<PatternData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelect = (file: File) => {
    setSelectedFile(file);
    setPatternData(null);
    setError(null);
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
  };

  const handleDigitize = async () => {
    if (!selectedFile) {
      setError("Vui lòng chọn một ảnh trước.");
      return;
    }

    setProcessing(true);
    setPatternData(null);
    setError(null);

    try {
      const { base64, mimeType } = await fileToBase64(selectedFile);
      const result = await digitizePattern(base64, mimeType);
      setPatternData(result);
    } catch (err) {
      if (err instanceof Error) {
        setError(`Đã xảy ra lỗi: ${err.message}`);
      } else {
        setError("Đã xảy ra một lỗi không xác định.");
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8">
      <main className="w-full max-w-5xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
            In Vải Hoàng Linh AI
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
            Tải lên ảnh chụp quần áo và xem AI trích xuất, làm phẳng và tái tạo một mẫu hoạ tiết lặp liền mạch, sẵn sàng để in.
          </p>
        </header>

        <div className="space-y-6">
          <ImageUploader 
            onImageSelect={handleImageSelect} 
            processing={processing}
            selectedImagePreview={imagePreview}
          />

          <div className="flex justify-center">
            <button
              onClick={handleDigitize}
              disabled={!selectedFile || processing}
              className="px-8 py-3 text-lg font-semibold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {processing ? 'Đang xử lý...' : 'Số Hóa Họa Tiết'}
            </button>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md text-center">
              <strong>Lỗi:</strong> {error}
            </div>
          )}

          <div className="mt-10">
            {processing && <LoadingState />}
            {patternData && <ResultsDisplay data={patternData} />}
          </div>
        </div>
      </main>
        <footer className="w-full max-w-5xl mx-auto text-center py-8 mt-10 border-t border-gray-200">
            <p className="text-gray-500 text-sm">Phát triển bằng Gemini API. Dành cho chuyên gia dệt may và người yêu thích sáng tạo.</p>
        </footer>
    </div>
  );
};

export default App;