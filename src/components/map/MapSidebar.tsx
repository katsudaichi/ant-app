import React, { useState, useRef } from 'react';
import { Plus, Search, ArrowRight, ArrowLeft } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { useMapStore } from '../../store/mapStore';
import { Actor, Group, Relation } from '../../types';
import { ActorListItem } from './ActorListItem';
import { RelationListItem } from './RelationListItem';
import { GroupListItem } from './GroupListItem';
import { CommentListItem } from './CommentListItem';
import { CollaborationPanel } from '../collaboration/CollaborationPanel';
import { FileOperations } from './FileOperations';

interface MapSidebarProps {
  onEditActor: (actor: Actor) => void;
}

const TABS = {
  ACTORS: 'actors',
  RELATIONS: 'relations',
  COMMENTS: 'comments',
  MEMBERS: 'members',
} as const;

type TabType = typeof TABS[keyof typeof TABS];

export function MapSidebar({ onEditActor }: MapSidebarProps) {
  const [actorName, setActorName] = useState('');
  const [groupName, setGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingRelationId, setEditingRelationId] = useState<string | null>(null);
  const [editingActorId, setEditingActorId] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [isGroupsOpen, setIsGroupsOpen] = useState(true);
  const [isActorsOpen, setIsActorsOpen] = useState(true);
  const editingActorRef = useRef<HTMLDivElement>(null);
  const editingRelationRef = useRef<HTMLDivElement>(null);
  const editingCommentRef = useRef<HTMLDivElement>(null);
  const activeTab = useMapStore((state) => state.activeTab || TABS.ACTORS);
  const setActiveTab = useMapStore((state) => state.setActiveTab);

  // Handle actor edit request from canvas
  React.useEffect(() => {
    const handleActorEdit = (e: CustomEvent<string>) => {
      setActiveTab(TABS.ACTORS);
      setEditingActorId(e.detail);
      setIsActorsOpen(true);
      // Wait for the state to update and DOM to render
      setTimeout(() => {
        editingActorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    };

    window.addEventListener('editActor', handleActorEdit as EventListener);
    return () => {
      window.removeEventListener('editActor', handleActorEdit as EventListener);
    };
  }, []);

  // Handle comment edit request from canvas
  React.useEffect(() => {
    const handleCommentEdit = (e: CustomEvent<string>) => {
      setActiveTab(TABS.COMMENTS);
      setEditingCommentId(e.detail);
      // Wait for the state to update and DOM to render
      setTimeout(() => {
        editingCommentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    };

    window.addEventListener('editComment', handleCommentEdit as EventListener);
    return () => {
      window.removeEventListener('editComment', handleCommentEdit as EventListener);
    };
  }, []);

  const addActor = useMapStore((state) => state.addActor);
  const actors = useMapStore((state) => state.actors);
  const deleteActor = useMapStore((state) => state.deleteActor);
  const addGroup = useMapStore((state) => state.addGroup);
  const groups = useMapStore((state) => state.groups);
  const reorderActors = useMapStore((state) => state.reorderActors);
  const relations = useMapStore((state) => state.relations);
  const position = useMapStore((state) => state.viewportPosition);
  const setViewportPosition = useMapStore((state) => state.setViewportPosition);
  const comments = useMapStore((state) => state.comments);
  const updateComment = useMapStore((state) => state.updateComment);
  const deleteComment = useMapStore((state) => state.deleteComment);
  const currentProjectId = useMapStore((state) => state.currentProjectId);
  const scale = useMapStore((state) => state.scale);

  const filteredActors = actors.filter(actor =>
    actor.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredComments = comments.filter(comment =>
    comment.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Organize actors by groups
  const organizedActors = React.useMemo(() => {
    const organized = {
      ungrouped: filteredActors.filter(actor => actor.groups.length === 0),
      byGroup: new Map<string, Actor[]>()
    };

    groups.forEach(group => {
      const groupActors = filteredActors.filter(actor => 
        actor.groups.includes(group.id)
      );
      if (groupActors.length > 0) {
        organized.byGroup.set(group.id, groupActors);
      }
    });

    return organized;
  }, [filteredActors, groups]);

  const filteredRelations = relations.filter(relation => {
    const sourceActor = actors.find(a => a.id === relation.sourceId);
    const targetActor = actors.find(a => a.id === relation.targetId);
    const searchTerm = searchQuery.toLowerCase();
    return (
      (relation.name?.toLowerCase().includes(searchTerm) ?? false) ||
      (sourceActor?.name.toLowerCase().includes(searchTerm) ?? false) ||
      (targetActor?.name.toLowerCase().includes(searchTerm) ?? false)
    );
  });

  const handleActorSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const focusOnActor = (actor: Actor) => {
    // Calculate the center position of the viewport
    const viewportWidth = window.innerWidth / scale;
    const viewportHeight = window.innerHeight / scale;
    
    // Calculate new position to center the actor
    const newX = -actor.position.x * scale + (viewportWidth * scale / 2);
    const newY = -actor.position.y * scale + (viewportHeight * scale / 2);
    
    // Ensure the position stays within bounds
    const boundedX = Math.min(Math.max(newX, -10000), 0);
    const boundedY = Math.min(Math.max(newY, -10000), 0);
    
    setViewportPosition({ x: boundedX, y: boundedY });
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = actors.findIndex((actor) => actor.id === active.id);
      const newIndex = actors.findIndex((actor) => actor.id === over.id);
      reorderActors(arrayMove(actors, oldIndex, newIndex));
    }
  };

  const handleAddActor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actorName.trim()) return;

    // Calculate the center position in the viewport
    const viewportCenterX = -position.x / scale + (window.innerWidth / 2 / scale);
    const viewportCenterY = -position.y / scale + (window.innerHeight / 2 / scale);

    const newActor: Actor = {
      id: crypto.randomUUID(),
      name: actorName.trim(),
      position: { x: viewportCenterX, y: viewportCenterY },
      color: '#4F46E5', // Default indigo color
      size: '3',
      groups: [],
    };
    
    addActor(newActor);
    setActorName('');
  };

  const handleAddGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;
    
    const newGroup: Group = {
      id: crypto.randomUUID(),
      name: groupName.trim(),
      color: '#4F46E5',
    };
    
    addGroup(newGroup);
    setGroupName('');
  };

  // Function to handle relation edit request from canvas
  React.useEffect(() => {
    const handleRelationEdit = (e: CustomEvent<string>) => {
      setActiveTab(TABS.RELATIONS);
      setEditingRelationId(e.detail);
      // Wait for the state to update and DOM to render
      setTimeout(() => {
        editingRelationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    };

    window.addEventListener('editRelation', handleRelationEdit as EventListener);
    return () => {
      window.removeEventListener('editRelation', handleRelationEdit as EventListener);
    };
  }, []);

  return (
    <div className="h-full p-4 overflow-y-auto">
      {/* File Operations */}
      <FileOperations />
      
      {/* Tabs */}
      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setActiveTab('actors')}
          className={`
            flex-1 px-3 py-2 text-sm font-medium rounded-md
            ${activeTab === TABS.ACTORS
              ? 'bg-indigo-100 text-indigo-700'
              : 'bg-white text-gray-700 hover:bg-gray-50'
            }
          `}
        >
          Actors
        </button>
        <button
          onClick={() => setActiveTab('relations')}
          className={`
            flex-1 px-3 py-2 text-sm font-medium rounded-md
            ${activeTab === TABS.RELATIONS
              ? 'bg-indigo-100 text-indigo-700'
              : 'bg-white text-gray-700 hover:bg-gray-50'
            }
          `}
        >
          Relations
        </button>
        <button
          onClick={() => setActiveTab('comments')}
          className={`
            flex-1 px-3 py-2 text-sm font-medium rounded-md
            ${activeTab === TABS.COMMENTS
              ? 'bg-indigo-100 text-indigo-700'
              : 'bg-white text-gray-700 hover:bg-gray-50'
            }
          `}
        >
          Comments
        </button>
      </div>

      {activeTab === TABS.ACTORS ? (
        <>
      {/* Add Actor Form */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Add New Actor</h3>
        <form onSubmit={handleAddActor} className="space-y-2">
          <input
            type="text"
            value={actorName}
            onChange={(e) => setActorName(e.target.value)}
            placeholder="Actor name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            type="submit"
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Actor
          </button>
        </form>
      </div>

      {/* Groups Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between w-full text-left mb-2">
          <button
            onClick={() => setIsGroupsOpen(!isGroupsOpen)}
            className="flex items-center space-x-2 text-lg font-medium text-gray-900"
          >
            <div className="w-4 h-4 flex items-center justify-center">
              {isGroupsOpen ? (
                <ArrowRight className="w-4 h-4 transform rotate-90" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
            </div>
            <span>Groups</span>
          </button>
          <Plus className="w-4 h-4" onClick={() => setIsGroupsOpen(true)} />
        </div>
        {isGroupsOpen && (
          <div className="space-y-2">
            <form onSubmit={handleAddGroup} className="mb-2">
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="New group name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </form>
            {groups.map((group) => (
              <GroupListItem key={group.id} group={group} />
            ))}
          </div>
        )}
      </div>

      {/* Actors List */}
      <div>
        <div className="flex items-center justify-between w-full text-left mb-4">
          <button
            onClick={() => setIsActorsOpen(!isActorsOpen)}
            className="flex items-center space-x-2 text-lg font-medium text-gray-900"
          >
            <div className="w-4 h-4 flex items-center justify-center">
              {isActorsOpen ? (
                <ArrowRight className="w-4 h-4 transform rotate-90" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
            </div>
            <span>Actors</span>
          </button>
        </div>
        {isActorsOpen && (
          <div>
            <div className="relative mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={handleActorSearch}
                placeholder="Search actors..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            <div className="space-y-2">
              {/* Grouped actors */}
              {Array.from(organizedActors.byGroup.entries()).map(([groupId, groupActors]) => {
                const group = groups.find(g => g.id === groupId);
                if (!group) return null;
                
                return (
                  <div key={groupId} className="mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: group.color }}
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {group.emoji} {group.name}
                      </span>
                    </div>
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={groupActors}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-2 pl-4">
                          {groupActors.map((actor) => {
                            const isEditing = actor.id === editingActorId;
                            return (
                              <div
                                key={actor.id}
                                ref={isEditing ? editingActorRef : null}
                              >
                                <ActorListItem
                                  actor={actor}
                                  onDelete={deleteActor}
                                  onFocus={() => focusOnActor(actor)}
                                  isEditing={isEditing}
                                  onEditingChange={(editing) => setEditingActorId(editing ? actor.id : null)}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </SortableContext>
                    </DndContext>
                  </div>
                );
              })}

              {/* Ungrouped actors */}
              {organizedActors.ungrouped.length > 0 && (
                <div className="mb-4">
                  <div className="mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Ungrouped Actors
                    </span>
                  </div>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={organizedActors.ungrouped}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-2 pl-4">
                        {organizedActors.ungrouped.map((actor) => {
                          const isEditing = actor.id === editingActorId;
                          return (
                            <div
                              key={actor.id}
                              ref={isEditing ? editingActorRef : null}
                            >
                              <ActorListItem
                                actor={actor}
                                onDelete={deleteActor}
                                onFocus={() => focusOnActor(actor)}
                                isEditing={isEditing}
                                onEditingChange={(editing) => setEditingActorId(editing ? actor.id : null)}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
        </>
      ) : activeTab === TABS.RELATIONS ? (
        <div>
          <div className="relative mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={handleActorSearch}
              placeholder="Search relations..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
          <div className="space-y-2">
            {filteredRelations.map((relation) => {
              const isEditing = relation.id === editingRelationId;
              return (
                <div
                  key={relation.id}
                  ref={isEditing ? editingRelationRef : null}
                >
                  <RelationListItem
                    relation={relation}
                    actors={actors}
                    isEditing={isEditing}
                    onEditingChange={(editing) => setEditingRelationId(editing ? relation.id : null)}
                  />
                </div>
              );
            })}
            {filteredRelations.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No relations found
              </p>
            )}
          </div>
        </div>
      ) : activeTab === TABS.COMMENTS ? (
        <div>
          <div className="relative mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search comments..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
          <div className="space-y-2">
            {filteredComments.map((comment) => (
              <CommentListItem
                key={comment.id}
                comment={comment}
                isEditing={comment.id === editingCommentId}
                onEditingChange={(editing) => setEditingCommentId(editing ? comment.id : null)}
                ref={comment.id === editingCommentId ? editingCommentRef : null}
                onDelete={() => {
                  if (window.confirm('Are you sure you want to delete this comment?')) {
                    deleteComment(comment.id);
                  }
                }}
                onSave={(text) => {
                  updateComment({ ...comment, text });
                  setEditingCommentId(null);
                }}
              />
            ))}
            {comments.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No comments found. Double-click on the canvas to add a comment.
              </p>
            )}
          </div>
        </div>
      ) : activeTab === TABS.MEMBERS ? (
        <CollaborationPanel projectId={currentProjectId || ''} />
      ) : null}
      
    </div>
  );
}