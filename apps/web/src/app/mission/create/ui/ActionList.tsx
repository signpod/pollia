"use client";

import {
  EmptyFallback,
  SearchBar,
  SurveyQuestionFilter,
  ToggleAllCheckButtons,
  TypeTag,
} from "@/app/mission/create/ui";
import {
  reorderActionsAtom,
  searchQueryAtom,
  selectedActionAtom,
} from "@/atoms/mission/missionAtoms";
import { ActionSummary } from "@/types/domain/action";
import { Typo } from "@repo/ui/components";
import { cn } from "@repo/ui/lib";
import { Reorder } from "framer-motion";
import { useAtomValue } from "jotai";
import { useAtom, useSetAtom } from "jotai";
import { CheckSquare, GripVertical, Loader2Icon, Square } from "lucide-react";
import { ComponentProps, useMemo } from "react";

export interface ActionListProps extends ComponentProps<"section"> {
  title: string;
  actions: ActionSummary[];
  isDraggable?: boolean;
  hasSearchBar?: boolean;
  showSelectControls?: boolean;
  showCheckboxInDraggable?: boolean;
  isLoading?: boolean;
  hasFilterBar?: boolean;
}

export function ActionList({
  title,
  actions,
  isDraggable = false,
  hasSearchBar = false,
  showSelectControls = false,
  className,
  showCheckboxInDraggable = false,
  isLoading = false,
  hasFilterBar = false,
  ...props
}: ActionListProps) {
  const reorderQuestions = useSetAtom(reorderActionsAtom);
  const { selectedQuestions, toggleQuestionSelection } = useToggleActionSelection();
  const searchQuery = useAtomValue(searchQueryAtom);

  const filteredQuestions = useMemo(() => {
    if (!hasSearchBar || !searchQuery) return actions;
    return actions.filter(action => action.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [actions, searchQuery, hasSearchBar]);

  const isEmpty = filteredQuestions.length === 0;
  const shouldShowSelectControls = showSelectControls && !isDraggable;

  return (
    <section className={cn("flex flex-col", className)} {...props}>
      <ActionListHeader
        title={title}
        hasSearchBar={hasSearchBar}
        hasFilterBar={hasFilterBar}
        showSelectControls={shouldShowSelectControls}
        actions={filteredQuestions}
      />

      <ActionListContent
        actions={filteredQuestions}
        isEmpty={isEmpty}
        isLoading={isLoading}
        isDraggable={isDraggable}
        showCheckboxInDraggable={showCheckboxInDraggable}
        selectedActions={selectedQuestions}
        onReorder={reorderQuestions}
        onSelectAction={toggleQuestionSelection}
      />
    </section>
  );
}

interface ActionListHeaderProps {
  title: string;
  hasSearchBar: boolean;
  hasFilterBar: boolean;
  showSelectControls: boolean;
  actions: ActionSummary[];
}

function ActionListHeader({
  title,
  hasSearchBar,
  hasFilterBar,
  showSelectControls,
  actions,
}: ActionListHeaderProps) {
  return (
    <div className="bg-background flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Typo.SubTitle size="large">{title}</Typo.SubTitle>
        {showSelectControls && <ToggleAllCheckButtons actions={actions} />}
      </div>
      {hasSearchBar && <SearchBar />}
      {hasFilterBar && <SurveyQuestionFilter />}
    </div>
  );
}

interface ActionListContentProps {
  actions: ActionSummary[];
  isEmpty: boolean;
  isLoading: boolean;
  isDraggable: boolean;
  showCheckboxInDraggable: boolean;
  selectedActions: ActionSummary[];
  onReorder: (actions: ActionSummary[]) => void;
  onSelectAction: (action: ActionSummary) => void;
}

function ActionListContent({
  actions,
  isEmpty,
  isLoading,
  isDraggable,
  showCheckboxInDraggable,
  selectedActions,
  onReorder,
  onSelectAction,
}: ActionListContentProps) {
  if (isLoading)
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto py-2">
        <Loader2Icon className="size-12 animate-spin text-zinc-200" />
      </div>
    );

  if (isEmpty) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto py-2">
        <EmptyFallback />
      </div>
    );
  }

  return isDraggable ? (
    <DraggableQuestionsList
      actions={actions}
      selectedActions={selectedActions}
      showCheckbox={showCheckboxInDraggable}
      onReorder={onReorder}
      onSelectAction={onSelectAction}
    />
  ) : (
    <StaticActionsList
      actions={actions}
      selectedActions={selectedActions}
      onSelectAction={onSelectAction}
    />
  );
}

interface DraggableActionsListProps {
  actions: ActionSummary[];
  selectedActions: ActionSummary[];
  showCheckbox: boolean;
  onReorder: (actions: ActionSummary[]) => void;
  onSelectAction: (action: ActionSummary) => void;
}

function DraggableQuestionsList({
  actions: questions,
  selectedActions: selectedQuestions,
  showCheckbox,
  onReorder,
  onSelectAction: onSelectQuestion,
}: DraggableActionsListProps) {
  return (
    <Reorder.Group
      axis="y"
      values={questions}
      onReorder={onReorder}
      className="flex min-h-0 flex-1 flex-col overflow-y-auto py-2"
      as="ul"
    >
      {questions.map((question, index) => (
        <DraggableActionItem
          key={question.id}
          action={question}
          index={index}
          isSelected={selectedQuestions.some(q => q.id === question.id)}
          onSelectAction={() => onSelectQuestion(question)}
          showCheckbox={showCheckbox}
        />
      ))}
    </Reorder.Group>
  );
}

interface StaticActionsListProps {
  actions: ActionSummary[];
  selectedActions: ActionSummary[];
  onSelectAction: (action: ActionSummary) => void;
}

function StaticActionsList({ actions, selectedActions, onSelectAction }: StaticActionsListProps) {
  return (
    <ul className="flex min-h-0 flex-1 flex-col overflow-y-auto py-2">
      {actions.map((action, index) => (
        <QuestionItem
          key={action.id}
          action={action}
          index={index}
          isSelected={selectedActions.some(a => a.id === action.id)}
          onSelectAction={onSelectAction}
        />
      ))}
    </ul>
  );
}

interface DraggableActionItemProps {
  action: ActionSummary;
  index: number;
  isSelected: boolean;
  onSelectAction: () => void;
  showCheckbox?: boolean;
}

function DraggableActionItem({
  action,
  index,
  onSelectAction,
  showCheckbox = false,
  isSelected,
}: DraggableActionItemProps) {
  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectAction();
  };

  return (
    <Reorder.Item
      value={action}
      className={cn(
        "group flex items-center justify-between select-none py-3",
        "cursor-grab active:cursor-grabbing",
        "hover:bg-zinc-50 active:bg-violet-50",
        "transition-colors duration-200 ease-in-out",
      )}
      style={{ listStyle: "none" }}
    >
      <ActionContent
        action={action}
        index={index}
        isSelected={isSelected}
        showCheckbox={showCheckbox}
        onCheckboxClick={handleCheckboxClick}
        isDraggable
      />
      <GripVertical className="pointer-events-none size-4 text-zinc-400 transition-colors group-active:text-violet-500" />
    </Reorder.Item>
  );
}

interface ActionItemProps {
  action: ActionSummary;
  index: number;
  isSelected: boolean;
  onSelectAction: (action: ActionSummary) => void;
}

function QuestionItem({ action, index, isSelected, onSelectAction }: ActionItemProps) {
  return (
    <li
      onClick={() => onSelectAction(action)}
      className={cn(
        "flex items-center justify-between select-none py-3 group cursor-pointer",
        "hover:bg-zinc-50 active:bg-violet-100",
        "transition-colors duration-200 ease-in-out",
      )}
    >
      <ActionContent
        action={action}
        index={index}
        isSelected={isSelected}
        showCheckbox
        isDraggable={false}
      />
    </li>
  );
}

interface ActionContentProps {
  action: ActionSummary;
  index: number;
  isSelected: boolean;
  showCheckbox?: boolean;
  onCheckboxClick?: (e: React.MouseEvent) => void;
  isDraggable: boolean;
}

function ActionContent({
  action,
  index,
  isSelected,
  showCheckbox = false,
  onCheckboxClick,
  isDraggable,
}: ActionContentProps) {
  const CheckboxIcon = isSelected ? CheckSquare : Square;
  const checkboxColorClass = isSelected ? "text-violet-500" : "text-zinc-300";

  return (
    <div className={cn("flex items-center gap-4", isDraggable && "pointer-events-none")}>
      {showCheckbox && !isDraggable && (
        <CheckboxIcon className={cn("size-5", checkboxColorClass)} />
      )}

      {showCheckbox && isDraggable && (
        <div className="pointer-events-auto" onClick={onCheckboxClick}>
          <CheckboxIcon className={cn("size-5 cursor-pointer", checkboxColorClass)} />
        </div>
      )}

      {isDraggable && <ActionNumber index={index} />}

      <TypeTag type={action.type} />

      <Typo.Body size="medium" className={cn(isDraggable && "group-active:text-violet-500")}>
        {action.title}
      </Typo.Body>
    </div>
  );
}

interface ActionNumberProps {
  index: number;
}

function ActionNumber({ index }: ActionNumberProps) {
  return (
    <div className="flex aspect-square w-5 items-center justify-center rounded-full bg-violet-50">
      <Typo.Body size="small" className="font-semibold text-violet-600">
        {index + 1}
      </Typo.Body>
    </div>
  );
}

function useToggleActionSelection() {
  const [selectedQuestions, setSelectedQuestions] = useAtom(selectedActionAtom);

  const toggleActionSelection = (action: ActionSummary) => {
    const isSelected = selectedQuestions.some(a => a.id === action.id);

    if (isSelected) {
      setSelectedQuestions(selectedQuestions.filter(a => a.id !== action.id));
    } else {
      setSelectedQuestions([...selectedQuestions, action]);
    }
  };

  return {
    selectedQuestions,
    toggleQuestionSelection: toggleActionSelection,
  };
}
