import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, SidebarClose, SidebarOpen } from 'lucide-react';
import { MapCanvas } from '../components/map/MapCanvas';
import { MapSidebar } from '../components/map/MapSidebar';
import { MapMinimap } from '../components/map/MapMinimap';
import { ZoomControl } from '../components/map/ZoomControl';
import { MapToolbar } from '../components/map/MapToolbar';
import { EditActorModal } from '../components/modals/EditActorModal';
import { Actor } from '../types';
import { useMapStore } from '../store/mapStore';

export function RelationMapPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  // Handle sidebar open requests
  React.useEffect(() => {
    const handleOpenSidebar = () => {
      setIsSidebarOpen(true);
    };

    window.addEventListener('openSidebar', handleOpenSidebar);
    return () => {
      window.removeEventListener('openSidebar', handleOpenSidebar);
    };
  }, []);

  const scale = useMapStore((state) => state.scale);
  const position = useMapStore((state) => state.viewportPosition);
  const setScale = useMapStore((state) => state.setScale);
  const setViewportPosition = useMapStore((state) => state.setViewportPosition);

  const handleScaleChange = (newScale: number) => {
    setScale(newScale);
  };

  return (
    <div className="fixed inset-0 flex overflow-hidden bg-gray-100">
      {/* Back button */}
      <button
        onClick={() => navigate('/projects')}
        className="absolute top-4 left-4 z-10 flex items-center space-x-2 px-3 py-2 bg-white/90 backdrop-blur-sm rounded-md shadow-sm hover:bg-white"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Projects</span>
      </button>

      {/* Main canvas area */}
      <div className="flex-1 relative">
        <MapCanvas
         scale={scale}
         position={position}
         onEditActor={() => null}
         onPositionChange={setViewportPosition}
         onScaleChange={handleScaleChange}
        />

        {/* Fixed position elements */}
        <div className="fixed inset-0 pointer-events-none">
          {/* Zoom control - Bottom center */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-auto">
           <ZoomControl scale={scale} onScaleChange={handleScaleChange} />
          </div>

          {/* Minimap - Bottom left */}
          <div className="absolute left-4 bottom-4 pointer-events-auto">
           <MapMinimap
             scale={scale}
             position={position}
             onPositionChange={setViewportPosition}
           />
          </div>
        </div>

        {/* Tools */}
       <MapToolbar />
      </div>

      {/* Sidebar */}
      <div className={`
        fixed right-0 top-0 h-full bg-white shadow-lg
        transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
        w-80
      `}>
        <div className="w-80 h-full">
          <MapSidebar onEditActor={() => null} />
        </div>
      </div>

      {/* Sidebar toggle */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`
          fixed z-10 p-2 transition-all duration-300 ease-in-out
          bg-white/90 backdrop-blur-sm rounded-md shadow-sm hover:bg-white
          ${isSidebarOpen ? 'right-[20rem]' : 'right-4'} top-4
        `}
      >
        {isSidebarOpen ? (
          <SidebarClose className="w-5 h-5" />
        ) : (
          <SidebarOpen className="w-5 h-5" />
        )}
      </button>
    </div>
  );
}