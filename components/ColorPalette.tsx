import React from 'react';
import { ColorInfo } from '../types';
import Icon from './Icon';

interface ColorPaletteProps {
  colors: ColorInfo[];
}

const ColorPalette: React.FC<ColorPaletteProps> = ({ colors }) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <Icon name="palette" className="w-6 h-6 mr-3 text-indigo-500" />
        Bảng Màu
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {colors.map((color, index) => (
          <div key={index} className="flex flex-col items-center text-center group">
            <div
              className="w-20 h-20 rounded-full border-4 border-gray-100 shadow-sm mb-2"
              style={{ backgroundColor: color.hex }}
            ></div>
            <p className="font-semibold text-sm text-gray-700">{color.name}</p>
            <button onClick={() => copyToClipboard(color.hex)} className="text-xs text-gray-500 hover:text-indigo-600 transition-colors cursor-pointer opacity-75 group-hover:opacity-100">
              {color.hex}
            </button>
            <p className="text-xs text-gray-400">{color.cmyk_approx}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ColorPalette;