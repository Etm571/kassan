import React from 'react';

type CustomConfirmModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
};

function CustomConfirmModal({ isOpen, onClose, onConfirm, title, message }: CustomConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-200 bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <p className="mb-4 text-gray-700">{message}</p>
                <div className="flex justify-center space-x-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 transition w-24"
                    >
                        No
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition w-24"
                    >
                        Yes
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CustomConfirmModal;