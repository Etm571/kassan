'use client';

import { useEffect, useState } from 'react';
import { useWebSocket } from '@/app/providers/websocket';
import { format } from 'date-fns-tz';
import type { Scanner } from './page';

const formatDateClientSide = (dateString: string | null) => {
  if (!dateString || isNaN(new Date(dateString).getTime())) return 'Not recorded';
  return format(new Date(dateString), 'yyyy-MM-dd HH:mm');
};

function InfoRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col space-y-1">
      <span className="text-sm font-medium text-gray-500">{label}</span>
      <div className="flex items-center gap-2">
        {icon && <span>{icon}</span>}
        <span className="font-medium text-gray-900 break-all">{value}</span>
      </div>
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <h2 className="flex items-center text-lg font-semibold text-gray-700 mb-4">
      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
      {title}
    </h2>
  );
}

export default function ScannerDetailClient({
  scanner: initialScanner,
  id,
}: {
  scanner: Scanner | null;
  id: string;
}) {
  const [scanner, setScanner] = useState<Scanner | null>(initialScanner);
  const { addMessageHandler, removeMessageHandler, send } = useWebSocket();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleTerminate = () => {
    if (!scanner) {
      console.warn('No scanner to terminate');
      return;
    }
    send({ type: 'free', id: scanner.id });
  };

  useEffect(() => {
    const handler = (data: any) => {
      if (data.type === 'scanner-list') {
        const updatedScanner = data.scanners?.find((s: Scanner) => s.id === id);
        if (updatedScanner) {
          setScanner(updatedScanner);
        }
      }
    };
    addMessageHandler(handler);
    return () => removeMessageHandler(handler);
  }, [addMessageHandler, removeMessageHandler, id]);

  if (!scanner) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="max-w-xl p-6 border-2 border-red-200 bg-gradient-to-br from-red-50 to-white rounded-2xl shadow-lg text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="flex-shrink-0 p-2 bg-red-100 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-red-700">Scanner Not Found</h1>
          </div>
          <p className="text-red-600">
            Scanner with ID{' '}
            <span className="font-mono bg-red-100 px-2 py-1 rounded">{id}</span>{' '}
            could not be located.
          </p>
        </div>
      </div>
    );
  }

  const { status, user, startTime, deviceInfo, batteryInfo } = scanner;

  const statusColors = {
    free: 'bg-green-100 text-green-800',
    occupied: 'bg-amber-100 text-amber-800',
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    error: 'bg-red-100 text-red-800',
    scanning: 'bg-blue-100 text-blue-800',
  };

  const statusColor =
    statusColors[status.toLowerCase() as keyof typeof statusColors] ||
    'bg-gray-100 text-gray-800';

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Scanner Details</h1>
            <p className="text-gray-500 mt-1">
              Detailed information about the scanning device
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
            {status === 'occupied' && (
              <button
                onClick={handleTerminate}
                className="px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Terminate
              </button>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow label="Scanner ID" value={scanner.id} />
              <InfoRow 
                label="Start Time" 
                value={isClient ? formatDateClientSide(startTime) : 'Loading...'} 
              />
              <InfoRow
                label="Assigned User"
                value={user ? `${user.name} (${user.userId})` : 'Unassigned'}
                icon={
                  user ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : null
                }
              />
            </div>
          </div>

          {deviceInfo && (
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <SectionTitle title="Device Specifications" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoRow label="Device Model" value={deviceInfo.model} />
                {deviceInfo.operatingSystem && (
                  <InfoRow
                    label="Operating System"
                    value={deviceInfo.operatingSystem}
                  />
                )}
                {deviceInfo.osVersion && (
                  <InfoRow label="OS Version" value={deviceInfo.osVersion} />
                )}
                {deviceInfo.androidSDKVersion && (
                  <InfoRow
                    label="Android SDK Version"
                    value={deviceInfo.androidSDKVersion.toString()}
                  />
                )}
                {deviceInfo.manufacturer && (
                  <InfoRow
                    label="Manufacturer"
                    value={deviceInfo.manufacturer}
                  />
                )}
                {deviceInfo.webViewVersion && (
                  <InfoRow
                    label="WebView Version"
                    value={deviceInfo.webViewVersion}
                  />
                )}
              </div>
            </div>
          )}

          {batteryInfo && (
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <SectionTitle title="Battery Status" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoRow
                  label="Battery Level"
                  value={
                    batteryInfo?.batteryLevel != null
                      ? `${(batteryInfo.batteryLevel * 100).toFixed(1)}%`
                      : 'Not available'
                  }
                  icon={
                    <div className="relative w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-full bg-green-500"
                        style={{
                          width: `${(batteryInfo?.batteryLevel || 0) * 100}%`,
                        }}
                      />
                    </div>
                  }
                />
                <InfoRow
                  label="Charging Status"
                  value={
                    batteryInfo?.isCharging != null
                      ? batteryInfo.isCharging
                        ? 'Charging'
                        : 'Not charging'
                      : 'Not available'
                  }
                  icon={
                    batteryInfo?.isCharging ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-yellow-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.7 1.7l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 010-1.4l8-8a1 1 0 011.4 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.7 1.7l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 010-1.4l8-8a1 1 0 011.4 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )
                  }
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}