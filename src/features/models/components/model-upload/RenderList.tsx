import { FC } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

interface RenderItem {
    id: string;
    preview: string;
}

interface RenderListProps {
    renders: RenderItem[];
    primaryId: string | null;
    onRemove: (id: string) => void;
    onReorder: (sourceIndex: number, destIndex: number) => void;
    onSetPrimary: (id: string) => void;
}

export const RenderList: FC<RenderListProps> = ({ renders, primaryId, onRemove, onReorder, onSetPrimary }) => {
    const handleDragEnd = (result: DropResult) => {
        if (!result.destination || result.destination.index === result.source.index) {
            return;
        }
        onReorder(result.source.index, result.destination.index);
    };

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="all-renders" direction="horizontal">
                {(provided) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="flex gap-3 overflow-x-auto py-2 -mx-6 px-6" // Negative margin to extend scroll area
                    >
                        {renders.map((render, index) => (
                            <Draggable key={render.id} draggableId={render.id} index={index}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        onClick={() => onSetPrimary(render.id)}
                                        className={`group relative flex-shrink-0 w-28 h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-pointer transition-all duration-200
                                            ${snapshot.isDragging ? 'ring-2 ring-accent scale-105 shadow-lg' : ''}
                                            ${render.id === primaryId ? 'ring-2 ring-accent' : 'hover:ring-2 hover:ring-gray-300 dark:hover:ring-gray-600'}`
                                        }
                                    >
                                        <img src={render.preview} alt={`Render ${index + 1}`} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity" />
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onRemove(render.id);
                                            }}
                                            className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center  text-white opacity-0 group-hover:opacity-100 transition-all duration-150"
                                            aria-label="Remove Render"
                                        >
                                            <FontAwesomeIcon icon={faXmark} size="sm" />
                                        </button>
                                    </div>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
    );
};
