import React, { useEffect, useState } from 'react';
import { DownloadItem } from '../types';
import { downloadService } from '../services/downloadService';

export const StatusBar: React.FC = () => {
  const [activeDownload, setActiveDownload] = useState<DownloadItem | null>(null);

  useEffect(() => {
    const update = () => {
      setActiveDownload(downloadService.getActiveDownload());
    };
    update();
    return downloadService.subscribe(update);
  }, []);

  return (
    <footer className="status-bar">
      <div className="status-left">
        <span className={`status-dot ${activeDownload ? 'active' : ''}`} />
        <span className="status-text">
          {activeDownload
            ? `Downloading: ${activeDownload.title} (${activeDownload.speed} - ${activeDownload.progress.toFixed(0)}%)`
            : 'No downloads in progress'}
        </span>
      </div>
      <div className="status-right">
        SkyLauncher - v1.0.0 "Spectre"
      </div>
    </footer>
  );
};
