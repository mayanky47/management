// src/components/ProjectModal.tsx
import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Project, ProjectStatus, ProjectType } from '../types/project';
import TagInput from './TagInput';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onUpdate: (project: Project) => Promise<void>;
}

const statusOptions: ProjectStatus[] = ['active', 'on-hold', 'completed', 'archived'];
const typeOptions: ProjectType[] = ['React', 'Spring', 'HTML/CSS/JS', 'Python', 'Java', 'Other'];

export default function ProjectModal({ isOpen, onClose, project, onUpdate }: Props) {
  const [formData, setFormData] = useState(project);

  useEffect(() => {
    setFormData(project); // update when project changes
  }, [project]);

  const handleSave = async () => {
    await onUpdate(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
      <div className="min-h-screen px-4 text-center bg-black/30">
        <span className="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="inline-block w-full max-w-xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl"
        >
          <Dialog.Title className="flex justify-between items-center text-2xl font-bold mb-4">
            Edit Project
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </Dialog.Title>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as ProjectType })}
                className="mt-1 block w-full border border-gray-300 rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {typeOptions.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={formData.status || 'active'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                className="mt-1 block w-full border border-gray-300 rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Progress</label>
              <input
                type="number"
                min={0}
                max={100}
                value={formData.progress || 0}
                onChange={(e) => setFormData({ ...formData, progress: Number(e.target.value) })}
                className="mt-1 block w-full border border-gray-300 rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Tags</label>
              <TagInput
                value={formData.tags || []}
                onChange={(tags) => setFormData({ ...formData, tags })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Purpose</label>
              <textarea
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Past Activities</label>
              <textarea
                value={formData.pastActivities}
                onChange={(e) => setFormData({ ...formData, pastActivities: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Future Plans</label>
              <textarea
                value={formData.futurePlans}
                onChange={(e) => setFormData({ ...formData, futurePlans: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                rows={3}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              Save
            </button>
          </div>
        </motion.div>
      </div>
    </Dialog>
  );
}
