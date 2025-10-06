import React, { useState } from 'react';
import { PatternData, FileOutput } from '../types';
import ColorPalette from './ColorPalette';
import Icon from './Icon';

interface ResultsDisplayProps {
  data: PatternData;
}

const InfoCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-gray-50 p-4 rounded-lg flex items-start space-x-3">
        <div className="flex-shrink-0 text-indigo-500">{icon}</div>
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-base font-semibold text-gray-800">{value}</p>
        </div>
    </div>
);

const downloadFile = (file: FileOutput) => {
    const link = document.createElement('a');
    link.href = `data:${file.mime_type};base64,${file.data}`;
    link.download = file.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ data }) => {
    const [isTiled, setIsTiled] = useState(false);
    const pngFile = data.files.find(f => f.mime_type === 'image/png');
    const svgFile = data.files.find(f => f.mime_type === 'image/svg+xml');

    return (
        <div className="w-full space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Left Column: Pattern Tile */}
                <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-gray-800 flex items-center">
                            <Icon name="image" className="w-6 h-6 mr-3 text-indigo-500" />
                            Xem Trước
                        </h3>
                        <div className="flex items-center bg-gray-100 rounded-lg p-1 text-sm font-medium">
                            <button onClick={() => setIsTiled(false)} className={`px-3 py-1 rounded-md transition-colors ${!isTiled ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}>
                                Một Mẫu
                            </button>
                            <button onClick={() => setIsTiled(true)} className={`px-3 py-1 rounded-md transition-colors ${isTiled ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}>
                                Lặp Lại
                            </button>
                        </div>
                    </div>

                    {pngFile && (
                        <div className="aspect-square rounded-md overflow-hidden bg-gray-100" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Crect width=\'10\' height=\'10\' x=\'0\' y=\'0\' fill=\'%23e5e7eb\'/%3E%3Crect width=\'10\' height=\'10\' x=\'10\' y=\'10\' fill=\'%23e5e7eb\'/%3E%3C/svg%3E")' }}>
                            {isTiled ? (
                                <div
                                    className="w-full h-full"
                                    style={{
                                        backgroundImage: `url(data:${pngFile.mime_type};base64,${pngFile.data})`,
                                        backgroundSize: '33.3333%',
                                        imageRendering: 'pixelated',
                                    }}
                                    aria-label="Xem trước họa tiết lặp lại"
                                ></div>
                            ) : (
                                <img
                                    src={`data:${pngFile.mime_type};base64,${pngFile.data}`}
                                    alt="Họa tiết liền mạch đã tạo"
                                    className="w-full h-full object-contain"
                                />
                            )}
                        </div>
                    )}
                    <div className="mt-6 flex flex-col space-y-3">
                        {pngFile && (
                            <button onClick={() => downloadFile(pngFile)} className="w-full flex items-center justify-center px-4 py-2.5 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                <Icon name="download" className="w-5 h-5 mr-2" />
                                Tải Xuống PNG
                            </button>
                        )}
                        {svgFile && (
                            <button onClick={() => downloadFile(svgFile)} className="w-full flex items-center justify-center px-4 py-2.5 bg-gray-700 text-white font-semibold rounded-md shadow-sm hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600">
                                <Icon name="download" className="w-5 h-5 mr-2" />
                                Tải Xuống SVG
                            </button>
                        )}
                    </div>
                </div>

                {/* Right Column: Details */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                            <Icon name="info" className="w-6 h-6 mr-3 text-indigo-500" />
                            Tóm Tắt Phân Tích
                        </h3>
                        <h4 className="text-lg font-semibold text-gray-900">{data.analysis_summary.pattern_name}</h4>
                        <p className="mt-2 text-gray-600">{data.analysis_summary.description}</p>
                        <p className="mt-4 text-sm text-gray-500 italic">
                            <strong>Ghi Chú Độ Chính Xác:</strong> {data.analysis_summary.fidelity_notes}
                        </p>

                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InfoCard title="Kiểu Lặp Lại" value={data.analysis_summary.repeat_type} icon={<Icon name="info" className="w-6 h-6"/>} />
                            <InfoCard 
                                title="Kích Thước Mẫu" 
                                value={`${data.tile_properties.width_px} x ${data.tile_properties.height_px} px`} 
                                icon={<Icon name="dimensions" className="w-6 h-6"/>} 
                            />
                            <InfoCard 
                                title="Kích Thước In (Ước tính)" 
                                value={`${data.tile_properties.width_cm.toFixed(1)} x ${data.tile_properties.height_cm.toFixed(1)} cm`} 
                                icon={<Icon name="dimensions" className="w-6 h-6"/>}
                            />
                            <InfoCard title="Độ Phân Giải" value={`${data.tile_properties.dpi} DPI`} icon={<Icon name="info" className="w-6 h-6"/>} />
                        </div>
                    </div>
                    
                    <ColorPalette colors={data.color_palette} />
                </div>
            </div>
        </div>
    );
};

export default ResultsDisplay;