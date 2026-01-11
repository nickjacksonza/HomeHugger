
import React, { useState } from 'react';
import { Project, Item, COLORS } from '../types';
import { Plus, Tag, Trash2 } from 'lucide-react';

interface ProjectViewProps {
  projects: Project[];
  items: Item[];
  onAddProject: (project: Omit<Project, 'id'>) => void;
  onDeleteProject: (id: string) => void;
}

export const ProjectView: React.FC<ProjectViewProps> = ({ projects, items, onAddProject, onDeleteProject }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '', color: COLORS[0] });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newProject.name.trim();
    if (!cleanName) return;
    
    onAddProject({
        ...newProject,
        name: cleanName,
        description: newProject.description.trim()
    });
    
    setNewProject({ name: '', description: '', color: COLORS[0] });
    setIsAdding(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Projects & Tags</h2>
          <p className="text-slate-500">Organize items across rooms by projects or themes.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded-xl border border-slate-200 shadow-lg animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Project Name</label>
              <input 
                type="text" 
                value={newProject.name}
                onChange={e => setNewProject({...newProject, name: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="e.g., Smart Home Upgrade"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <input 
                type="text" 
                value={newProject.description}
                onChange={e => setNewProject({...newProject, description: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="Brief description..."
              />
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">Color Tag</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setNewProject({...newProject, color: c})}
                  className={`w-8 h-8 rounded-full ${c} ${newProject.color === c ? 'ring-2 ring-offset-2 ring-slate-400' : ''}`}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button 
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Create Project
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => {
          const projectItems = items.filter(i => i.projectIds.includes(project.id));
          return (
            <div key={project.id} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${project.color}`} />
                  <h3 className="text-lg font-bold text-slate-800">{project.name}</h3>
                </div>
                <button 
                  onClick={() => onDeleteProject(project.id)}
                  className="text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-slate-600 text-sm mb-6 h-10 line-clamp-2">{project.description}</p>
              
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-slate-500 text-sm mb-3">
                  <Tag className="w-4 h-4" />
                  <span>{projectItems.length} items tagged</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {projectItems.slice(0, 5).map(i => (
                    <span key={i.id} className="text-[10px] px-2 py-1 bg-slate-50 text-slate-600 rounded border border-slate-200 truncate max-w-[100px]">
                      {i.name}
                    </span>
                  ))}
                  {projectItems.length > 5 && (
                    <span className="text-[10px] px-2 py-1 bg-slate-50 text-slate-400 rounded border border-slate-200">
                      +{projectItems.length - 5}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
