import { FC } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { X } from "lucide-react";

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

export const RenderList: FC<RenderListProps> = ({
  renders,
  primaryId,
  onRemove,
  onReorder,
  onSetPrimary,
}) => {
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
            className="-mx-1 flex gap-2 overflow-x-auto px-1 py-2"
          >
            {renders.map((render, index) => {
              const isPrimary = render.id === primaryId;
              return (
                <Draggable key={render.id} draggableId={render.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      onClick={() => onSetPrimary(render.id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") onSetPrimary(render.id);
                      }}
                      aria-label={`Image ${index + 1}${isPrimary ? ", cover" : ""}. Enter sets it as cover, space picks it up to reorder.`}
                      className={`group relative h-20 w-28 shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 bg-surface-card transition-[border-color,transform] duration-200 ${
                        snapshot.isDragging
                          ? "scale-105 border-accent shadow-lg"
                          : isPrimary
                            ? "border-accent"
                            : "border-transparent hover:border-br-primary"
                      }`}
                    >
                      <img src={render.preview} alt="" className="size-full object-cover" />
                      <span className="absolute bottom-1 left-1 bg-page/80 px-1.5 font-mono text-[0.65rem] text-txt-secondary backdrop-blur">
                        {isPrimary ? "COVER" : String(index + 1).padStart(2, "0")}
                      </span>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onRemove(render.id);
                        }}
                        className="chamfer absolute right-1 top-1 flex size-6 items-center justify-center bg-page/85 text-txt-primary backdrop-blur [--cut:5px] transition-[opacity,color] hover:text-error focus-visible:opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100"
                        aria-label={`Remove image ${index + 1}`}
                      >
                        <X className="size-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  )}
                </Draggable>
              );
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};
