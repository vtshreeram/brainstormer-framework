'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { formatDate } from '@/data/mockData';
import { Button, Modal } from '@/components/ui';

export default function SettingsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  
  const {
    projects,
    setCurrentProject,
    deleteProject,
    updateProject,
    restoreVersion,
    addToast
  } = useStore();
  
  const project = projects.find(p => p.id === projectId);
  
  const [title, setTitle] = useState(project?.title || '');
  const [description, setDescription] = useState(project?.description || '');
  const [titleError, setTitleError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [restoreTargetId, setRestoreTargetId] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState<string | null>(null);

  const isSaveDisabled =
    !title.trim() ||
    (title === project?.title && description === (project?.description || ''));
  
  useEffect(() => {
    if (projectId) {
      setCurrentProject(projectId);
    }
  }, [projectId, setCurrentProject]);
  
  useEffect(() => {
    if (project) {
      setTitle(project.title);
      setDescription(project.description || '');
    }
  }, [project]);
  
  if (!project) {
    return <div>Loading...</div>;
  }
  
  const handleSave = () => {
    if (!title.trim()) {
      setTitleError('Project title is required.');
      return;
    }
    setTitleError('');
    updateProject(projectId, { title: title.trim(), description: description.trim() });
    addToast({ type: 'success', message: 'Project details saved.' });
  };

  const handleGenerateShareLink = () => {
    const token = Math.random().toString(36).substring(2, 15);
    setShareLink(`${window.location.origin}/share/${token}`);
    addToast({ type: 'success', message: 'Share link generated!' });
  };
  
  const handleCopyShareLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      addToast({ type: 'success', message: 'Link copied to clipboard!' });
    }
  };
  
  const handleDeleteProject = () => {
    setIsDeleting(true);
    deleteProject(projectId);
    addToast({ type: 'success', message: 'Project deleted' });
    router.push('/');
  };

  const handleRestoreVersion = () => {
    if (!restoreTargetId) return;
    restoreVersion(projectId, restoreTargetId);
    setRestoreTargetId(null);
    addToast({ type: 'success', message: 'Version restored successfully.' });
    router.push(`/project/${projectId}`);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href={`/project/${projectId}`} className="text-gray-500 hover:text-gray-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Project Settings</h1>
              <p className="text-sm text-gray-500">{project.title}</p>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Details</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => { setTitle(e.target.value); if (e.target.value.trim()) setTitleError(''); }}
                className={`w-full px-4 py-2 border-0 border-b-2 bg-gray-50 focus:outline-none focus:bg-white ${titleError ? 'border-b-red-500' : 'border-b-gray-300 focus:border-b-primary-600'}`}
              />
              {titleError && (
                <p className="mt-1 text-sm text-red-500">{titleError}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border-0 border-b-2 border-b-gray-300 bg-gray-50 focus:outline-none focus:border-b-primary-600 focus:bg-white resize-none"
                placeholder="Add a description for your project"
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={isSaveDisabled}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
        
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Version History</h2>
          
          <div className="space-y-3">
            {project.versions.map((version) => (
              <div
                key={version.id}
                className={`
                  p-4 border
                  ${version.isCurrent ? 'border-l-4 border-l-primary-600 border-gray-200 bg-primary-10' : 'border-gray-200 hover:border-gray-300'}
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {version.isCurrent && (
                      <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded font-medium">
                        Current
                      </span>
                    )}
                    <span className="font-medium text-gray-900">{version.versionNumber}</span>
                    <span className="text-gray-500">·</span>
                    <span className="text-gray-500 text-sm">{version.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-400">
                      {formatDate(version.createdAt)}
                    </span>
                    {!version.isCurrent && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setRestoreTargetId(version.id)}
                      >
                        Restore
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Sharing</h2>
          
          {shareLink ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Anyone with this link can view your project details and documents.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  className="flex-1 px-4 py-2 bg-gray-50 border-0 border-b-2 border-b-gray-300 text-sm"
                />
                <Button variant="secondary" onClick={handleCopyShareLink}>
                  Copy
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="secondary" onClick={handleGenerateShareLink}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Generate Share Link
            </Button>
          )}
        </div>
        
        <div className="card p-6 border-red-200">
          <h2 className="text-lg font-semibold text-red-600 mb-2">Danger Zone</h2>
          <p className="text-sm text-gray-600 mb-4">
            Once you delete a project, there is no going back. All your responses and generated documents will be permanently removed.
          </p>
          <Button 
            variant="danger" 
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete Project
          </Button>
        </div>
      </main>
      
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Project"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete <strong>{project.title}</strong>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteProject} isLoading={isDeleting}>
              Delete Project
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!restoreTargetId}
        onClose={() => setRestoreTargetId(null)}
        title="Restore Version"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Restore this version? Your current wizard responses will be replaced with the responses from this version.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setRestoreTargetId(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleRestoreVersion}>
              Restore
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
