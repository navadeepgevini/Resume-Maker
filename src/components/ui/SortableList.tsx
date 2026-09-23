'use client';

import { type ReactNode, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

/* ------------------------------------------------------------------ */
/*  Public types                                                      */
/* ------------------------------------------------------------------ */

export interface SortableItem {
  id: string;
}

export interface SortableListProps<T extends SortableItem> {
  /** Array of items to render – each must include an `id` field */
  items: T[];
  /** Callback fired after the user finishes a drag. Receives the reordered array. */
  onReorder: (items: T[]) => void;
  /** Render function for each item. Receives the item and a drag‑handle element. */
  renderItem: (item: T, dragHandle: ReactNode) => ReactNode;
}

/* ------------------------------------------------------------------ */
/*  Drag handle                                                       */
/* ------------------------------------------------------------------ */

function DragHandleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      className="h-4 w-4"
      aria-hidden="true"
    >
      {/* Six‑dot grip pattern */}
      <circle cx="5.5" cy="3.5" r="1.25" />
      <circle cx="10.5" cy="3.5" r="1.25" />
      <circle cx="5.5" cy="8" r="1.25" />
      <circle cx="10.5" cy="8" r="1.25" />
      <circle cx="5.5" cy="12.5" r="1.25" />
      <circle cx="10.5" cy="12.5" r="1.25" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Internal sortable row                                             */
/* ------------------------------------------------------------------ */

interface SortableRowProps<T extends SortableItem> {
  item: T;
  renderItem: SortableListProps<T>['renderItem'];
}

function SortableRow<T extends SortableItem>({
  item,
  renderItem,
}: SortableRowProps<T>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const dragHandle = (
    <button
      type="button"
      className="inline-flex cursor-grab items-center justify-center rounded-[4px] p-1 text-[#6B6B63] transition-colors hover:bg-[#E4E4DF] hover:text-[#1C1C1A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#33415C]/40 active:cursor-grabbing"
      aria-label={`Reorder item ${item.id}`}
      {...attributes}
      {...listeners}
    >
      <DragHandleIcon />
    </button>
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={isDragging ? 'z-10 opacity-80' : ''}
    >
      {renderItem(item, dragHandle)}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Public component                                                  */
/* ------------------------------------------------------------------ */

/**
 * A generic, accessible, drag‑and‑drop sortable list powered by
 * **@dnd‑kit**.
 *
 * Each item receives a drag‑handle node that can be placed anywhere
 * inside the rendered row. Keyboard reordering is supported via
 * `KeyboardSensor`.
 */
export function SortableList<T extends SortableItem>({
  items,
  onReorder,
  renderItem,
}: SortableListProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        onReorder(arrayMove(items, oldIndex, newIndex));
      }
    },
    [items, onReorder],
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((i) => i.id)}
        strategy={verticalListSortingStrategy}
      >
        <div role="list" className="flex flex-col gap-2">
          {items.map((item) => (
            <div key={item.id} role="listitem">
              <SortableRow item={item} renderItem={renderItem} />
            </div>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
