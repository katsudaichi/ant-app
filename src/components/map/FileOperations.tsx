import React, { useRef, useState } from 'react';
import { Download, Upload, Users } from 'lucide-react';
import { useMapStore } from '../../store/mapStore';
import { exportToJson, importFromJson, exportToExcel, importFromExcel } from '../../utils/fileUtils';

export function FileOperations() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const setActiveTab = useMapStore((state) => state.setActiveTab);
  const { actors, groups, relations, setActors, setGroups, setRelations } = useMapStore();

  const handleExport = (format: 'json' | 'excel') => {
    const data = { actors, groups, relations };
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    if (format === 'json') {
      const jsonString = exportToJson(data);
      const blob = new Blob([jsonString], { type: 'application/json' });
      downloadFile(blob, `relation-map-${timestamp}.json`);
    } else {
      const excelBuffer = exportToExcel(data);
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      downloadFile(blob, `relation-map-${timestamp}.xlsx`);
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        let data;
        if (file.name.endsWith('.json')) {
          data = importFromJson(event.target?.result as string);
        } else {
          data = importFromExcel(event.target?.result as ArrayBuffer);
        }

        if (window.confirm('This will replace all existing data. Are you sure?')) {
          setActors(data.actors);
          setGroups(data.groups);
          setRelations(data.relations);
        }
      } catch (error) {
        alert('Failed to import file: ' + (error as Error).message);
      }
    };

    if (file.name.endsWith('.json')) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
    
    // Reset input
    e.target.value = '';
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center space-x-2 mb-4">
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.xlsx"
        onChange={handleImport}
        className="hidden"
      />
      
      <div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-md"
          title="Import from file"
        >
          <Upload className="w-5 h-5" />
        </button>
      </div>

      <div className="relative group">
        <button
          className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-md"
        >
          <Download className="w-5 h-5" />
        </button>
        <div 
          className="absolute left-1/2 -translate-x-1/2 top-full mt-1 hidden group-hover:block bg-white border border-gray-200 rounded-md shadow-lg transition-all duration-200"
          style={{ transitionDelay: '100ms' }}
        >
          <button
            onClick={() => handleExport('json')}
            className="block w-full text-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 first:rounded-t-md"
          >
            JSON
          </button>
          <button
            onClick={() => handleExport('excel')}
            className="block w-full text-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 last:rounded-b-md"
          >
            Excel
          </button>
        </div>
      </div>
      
      <div>
        <button
          onClick={() => setActiveTab('members')}
          className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-md"
          title="Project Members"
        >
          <Users className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}