import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../api';

interface FileRecord { id: number; name: string; size: number; type: string; status: 'pending' | 'uploading' | 'success' | 'error'; progress: number; }

export function FilesLab() {
  const { addToast } = useApp();
  const [files, setFiles] = useState<FileRecord[]>([]);

  const load = () => api.get<FileRecord[]>('/api/files').then(setFiles).catch(() => addToast('error', 'Failed to load files'));

  useEffect(() => { load(); }, []);

  const handleSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files;
    if (!selected) return;
    for (const f of Array.from(selected)) {
      const rec = await api.post<FileRecord>('/api/files', { name: f.name, size: f.size, type: f.type });
      setFiles(prev => [...prev, rec]);
      addToast('info', `${f.name} added`);
    }
    event.target.value = '';
  };

  const upload = async (id: number) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'uploading', progress: 0 } : f));
    // simulate progress
    for (let p = 10; p <= 90; p += 10) {
      await new Promise(r => setTimeout(r, 80));
      setFiles(prev => prev.map(f => f.id === id ? { ...f, progress: p } : f));
    }
    const updated = await api.post<FileRecord>(`/api/files/${id}/upload`, {});
    setFiles(prev => prev.map(f => f.id === id ? updated : f));
    addToast(updated.status === 'success' ? 'success' : 'error', updated.status === 'success' ? 'Upload complete' : 'Upload failed');
  };

  const retry  = async (id: number) => { await api.patch(`/api/files/${id}`, { status: 'pending', progress: 0 }); upload(id); };
  const remove = async (id: number) => { await api.delete(`/api/files/${id}`); setFiles(prev => prev.filter(f => f.id !== id)); addToast('info', 'File removed'); };

  return (
    <div data-testid="page-files">
      <div className="page-header">
        <h1>File &amp; Media Lab</h1>
        <p>File upload simulation with progress, success, error, and retry states</p>
      </div>

      <div className="section">
        <div className="section-title">Select Files</div>
        <div className="btn-row">
          <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
            Choose File
            <input type="file" className="file-input-hidden" onChange={handleSelect} data-testid="file-input-single" />
          </label>
          <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
            Choose Multiple Files
            <input type="file" multiple className="file-input-hidden" onChange={handleSelect} data-testid="file-input-multiple" />
          </label>
          <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
            Choose Image
            <input type="file" accept="image/*" className="file-input-hidden" onChange={handleSelect} data-testid="file-input-image" />
          </label>
        </div>
      </div>

      {files.length > 0 && (
        <div className="section">
          <div className="section-title">File List ({files.length})</div>
          <div className="file-list" data-testid="file-list">
            {files.map(f => (
              <div key={f.id} className="file-row" data-testid={`file-${f.id}`}>
                <div className="file-row-info">
                  <div className="file-row-name">{f.name}</div>
                  <div className="file-row-meta">{(f.size / 1024).toFixed(1)} KB &nbsp;·&nbsp; {f.type || 'unknown'}</div>
                </div>
                <div className="file-row-status">
                  {f.status === 'pending' && (
                    <button className="btn btn-primary btn-xs" onClick={() => upload(f.id)} data-testid={`upload-${f.id}`}>Upload</button>
                  )}
                  {f.status === 'uploading' && (
                    <div className="file-progress-bar">
                      <div className="file-progress-fill" style={{ width: `${f.progress}%` }} />
                    </div>
                  )}
                  {f.status === 'success' && <span className="file-status-ok">Uploaded</span>}
                  {f.status === 'error'   && (
                    <>
                      <span className="file-status-err">Failed</span>
                      <button className="btn btn-secondary btn-xs" onClick={() => retry(f.id)} data-testid={`retry-${f.id}`}>Retry</button>
                    </>
                  )}
                  <button className="btn btn-ghost btn-xs" onClick={() => remove(f.id)} aria-label="Remove" data-testid={`remove-${f.id}`}>×</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {files.length === 0 && (
        <p className="text-muted text-sm">No files selected yet.</p>
      )}
    </div>
  );
}
