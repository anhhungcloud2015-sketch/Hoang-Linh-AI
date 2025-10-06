import React, { useState, useEffect } from 'react';

const loadingMessages = [
    "Đang phân tích vải và phối cảnh...",
    "Đang điều chỉnh nếp nhăn và độ rủ...",
    "Đang truy vết các họa tiết...",
    "Đang xác định kiểu lặp lại...",
    "Đang tạo mẫu lặp liền mạch...",
    "Đang trích xuất bảng màu...",
    "Đang hoàn tất các tệp đầu ra...",
];

const LoadingState: React.FC = () => {
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
        }, 2500);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="w-full p-8 bg-white/50 backdrop-blur-sm rounded-lg shadow-md border border-gray-200 flex flex-col items-center justify-center space-y-6">
            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-800">Đang Số Hóa Họa Tiết Của Bạn</h3>
                <p className="text-gray-600 mt-2 transition-opacity duration-500 ease-in-out">
                    {loadingMessages[messageIndex]}
                </p>
            </div>
        </div>
    );
};

export default LoadingState;