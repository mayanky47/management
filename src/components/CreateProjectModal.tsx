import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import type { ProjectType } from '../types/project';
import TagInput from './TagInput';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: {
    name: string;
    type: ProjectType;
    path: string;
    purpose: string;
    pastActivities: string;
    futurePlans: string;
    tags?: string[];
  }) => Promise<void>;
}

export default function CreateProjectModal({ isOpen, onClose, onCreate }: CreateProjectModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'React' as ProjectType,
    path: '',
    purpose: '',
    pastActivities: '',
    futurePlans: '',
    tags: [] as string[],
  });

  const handleChange = (key: keyof typeof formData, value: any) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleCreate = async () => {
    await onCreate(formData);
    setFormData({ name: '', type: 'React', path: '', purpose: '', pastActivities: '', futurePlans: '', tags: [] });
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title className="text-2xl font-bold mb-4">Create New Project</Dialog.Title>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-sm mb-1">Project Name</label>
                    <input
                      className="w-full border rounded p-2"
                      value={formData.name}
                      onChange={e => handleChange('name', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-sm mb-1">Type</label>
                    <select
                      className="w-full border rounded p-2"
                      value={formData.type}
                      onChange={e => handleChange('type', e.target.value)}
                    >
                      <option value="React">React</option>
                      <option value="Spring">Spring</option>
                      <option value="HTML/CSS/JS">HTML/CSS/JS</option>
                      <option value="Python">Python</option>
                      <option value="Java">Java</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-sm mb-1">Path</label>
                    <input
                      className="w-full border rounded p-2"
                      value={formData.path}
                      onChange={e => handleChange('path', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-sm mb-1">Purpose</label>
                    <textarea
                      className="w-full border rounded p-2"
                      value={formData.purpose}
                      onChange={e => handleChange('purpose', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-sm mb-1">Past Activities</label>
                    <textarea
                      className="w-full border rounded p-2"
                      value={formData.pastActivities}
                      onChange={e => handleChange('pastActivities', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-sm mb-1">Future Plans</label>
                    <textarea
                      className="w-full border rounded p-2"
                      value={formData.futurePlans}
                      onChange={e => handleChange('futurePlans', e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-medium text-sm mb-1">Tags</label>
                    <TagInput
  value={formData.tags || []}  // <-- use 'value' instead of 'tags'
  onChange={(tags) => handleChange('tags', tags)}
/>

                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    className="px-4 py-2 rounded-xl bg-gray-300 hover:bg-gray-400"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                    onClick={handleCreate}
                  >
                    Create
                  </button>
                </div>

              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
