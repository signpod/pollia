'use client';

import { Typo } from '@repo/ui/components';
import { cn } from '@repo/ui/lib';
import { ComponentProps } from 'react';
import { GripVertical, Square, CheckSquare, Loader2Icon } from 'lucide-react';
import { Reorder } from 'framer-motion';
import {
  SearchBar,
  EmptyFallback,
  SurveyQuestionFilter,
  TypeTag,
  ToggleAllCheckButtons,
} from '@/app/survey/create/ui';
import { reorderQuestionsAtom, selectedQuestionAtom } from '@/atoms/create';
import { useAtom, useSetAtom } from 'jotai';
import { SurveyQuestionSummary } from '@/types/domain/survey';

export interface QuestionListProps extends ComponentProps<'section'> {
  title: string;
  questions: SurveyQuestionSummary[];
  isDraggable?: boolean;
  hasSearchBar?: boolean;
  showSelectControls?: boolean;
  showCheckboxInDraggable?: boolean;
  isLoading?: boolean;
  hasFilterBar?: boolean;
}

export function QuestionList({
  title,
  questions,
  isDraggable = false,
  hasSearchBar = false,
  showSelectControls = false,
  className,
  showCheckboxInDraggable = false,
  isLoading = false,
  hasFilterBar = false,
  ...props
}: QuestionListProps) {
  const reorderQuestions = useSetAtom(reorderQuestionsAtom);
  const { selectedQuestions, toggleQuestionSelection } =
    useToggleQuestionSelection();

  const isEmpty = questions.length === 0;
  const shouldShowSelectControls = showSelectControls && !isDraggable;

  return (
    <section className={cn('flex flex-col', className)} {...props}>
      <QuestionListHeader
        title={title}
        hasSearchBar={hasSearchBar}
        hasFilterBar={hasFilterBar}
        showSelectControls={shouldShowSelectControls}
        questions={questions}
      />

      <QuestionListContent
        questions={questions}
        isEmpty={isEmpty}
        isLoading={isLoading}
        isDraggable={isDraggable}
        showCheckboxInDraggable={showCheckboxInDraggable}
        selectedQuestions={selectedQuestions}
        onReorder={reorderQuestions}
        onSelectQuestion={toggleQuestionSelection}
      />
    </section>
  );
}

interface QuestionListHeaderProps {
  title: string;
  hasSearchBar: boolean;
  hasFilterBar: boolean;
  showSelectControls: boolean;
  questions: SurveyQuestionSummary[];
}

function QuestionListHeader({
  title,
  hasSearchBar,
  hasFilterBar,
  showSelectControls,
  questions,
}: QuestionListHeaderProps) {
  return (
    <div className="flex flex-col gap-4 bg-background">
      <div className="flex items-center justify-between">
        <Typo.SubTitle size="large">{title}</Typo.SubTitle>
        {showSelectControls && <ToggleAllCheckButtons questions={questions} />}
      </div>
      {hasSearchBar && <SearchBar />}
      {hasFilterBar && <SurveyQuestionFilter />}
    </div>
  );
}

interface QuestionListContentProps {
  questions: SurveyQuestionSummary[];
  isEmpty: boolean;
  isLoading: boolean;
  isDraggable: boolean;
  showCheckboxInDraggable: boolean;
  selectedQuestions: Set<SurveyQuestionSummary>;
  onReorder: (questions: SurveyQuestionSummary[]) => void;
  onSelectQuestion: (question: SurveyQuestionSummary) => void;
}

function QuestionListContent({
  questions,
  isEmpty,
  isLoading,
  isDraggable,
  showCheckboxInDraggable,
  selectedQuestions,
  onReorder,
  onSelectQuestion,
}: QuestionListContentProps) {
  if (isLoading)
    return (
      <div className="py-2 flex flex-col flex-1 min-h-0 overflow-y-auto items-center justify-center">
        <Loader2Icon className="size-12 text-zinc-200 animate-spin" />
      </div>
    );

  if (isEmpty) {
    return (
      <div className="py-2 flex flex-col flex-1 min-h-0 overflow-y-auto items-center justify-center">
        <EmptyFallback />
      </div>
    );
  }

  return isDraggable ? (
    <DraggableQuestionsList
      questions={questions}
      selectedQuestions={selectedQuestions}
      showCheckbox={showCheckboxInDraggable}
      onReorder={onReorder}
      onSelectQuestion={onSelectQuestion}
    />
  ) : (
    <StaticQuestionsList
      questions={questions}
      selectedQuestions={selectedQuestions}
      onSelectQuestion={onSelectQuestion}
    />
  );
}

interface DraggableQuestionsListProps {
  questions: SurveyQuestionSummary[];
  selectedQuestions: Set<SurveyQuestionSummary>;
  showCheckbox: boolean;
  onReorder: (questions: SurveyQuestionSummary[]) => void;
  onSelectQuestion: (question: SurveyQuestionSummary) => void;
}

function DraggableQuestionsList({
  questions,
  selectedQuestions,
  showCheckbox,
  onReorder,
  onSelectQuestion,
}: DraggableQuestionsListProps) {
  return (
    <Reorder.Group
      axis="y"
      values={questions}
      onReorder={onReorder}
      className="py-2 flex flex-col flex-1 min-h-0 overflow-y-auto"
      as="ul"
    >
      {questions.map((question, index) => (
        <DraggableQuestionItem
          key={question.id}
          question={question}
          index={index}
          isSelected={selectedQuestions.has(question)}
          onSelectQuestion={() => onSelectQuestion(question)}
          showCheckbox={showCheckbox}
        />
      ))}
    </Reorder.Group>
  );
}

interface StaticQuestionsListProps {
  questions: SurveyQuestionSummary[];
  selectedQuestions: Set<SurveyQuestionSummary>;
  onSelectQuestion: (question: SurveyQuestionSummary) => void;
}

function StaticQuestionsList({
  questions,
  selectedQuestions,
  onSelectQuestion,
}: StaticQuestionsListProps) {
  return (
    <ul className="py-2 flex flex-col flex-1 min-h-0 overflow-y-auto">
      {questions.map((question, index) => (
        <QuestionItem
          key={question.id}
          question={question}
          index={index}
          isSelected={selectedQuestions.has(question)}
          onSelectQuestion={onSelectQuestion}
        />
      ))}
    </ul>
  );
}

interface DraggableQuestionItemProps {
  question: SurveyQuestionSummary;
  index: number;
  isSelected: boolean;
  onSelectQuestion: () => void;
  showCheckbox?: boolean;
}

function DraggableQuestionItem({
  question,
  index,
  onSelectQuestion,
  showCheckbox = false,
  isSelected,
}: DraggableQuestionItemProps) {
  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectQuestion();
  };

  return (
    <Reorder.Item
      value={question}
      className={cn(
        'group flex items-center justify-between select-none p-3',
        'cursor-grab active:cursor-grabbing',
        'hover:bg-zinc-50 active:bg-violet-50',
        'transition-colors duration-200 ease-in-out'
      )}
      style={{ listStyle: 'none' }}
    >
      <QuestionContent
        question={question}
        index={index}
        isSelected={isSelected}
        showCheckbox={showCheckbox}
        onCheckboxClick={handleCheckboxClick}
        isDraggable
      />
      <GripVertical className="size-4 text-zinc-400 pointer-events-none group-active:text-violet-500 transition-colors" />
    </Reorder.Item>
  );
}

interface QuestionItemProps {
  question: SurveyQuestionSummary;
  index: number;
  isSelected: boolean;
  onSelectQuestion: (question: SurveyQuestionSummary) => void;
}

function QuestionItem({
  question,
  index,
  isSelected,
  onSelectQuestion,
}: QuestionItemProps) {
  return (
    <li
      onClick={() => onSelectQuestion(question)}
      className={cn(
        'flex items-center justify-between select-none p-3 group cursor-pointer',
        'hover:bg-zinc-50 active:bg-violet-100',
        'transition-colors duration-200 ease-in-out'
      )}
    >
      <QuestionContent
        question={question}
        index={index}
        isSelected={isSelected}
        showCheckbox
        isDraggable={false}
      />
    </li>
  );
}

interface QuestionContentProps {
  question: SurveyQuestionSummary;
  index: number;
  isSelected: boolean;
  showCheckbox?: boolean;
  onCheckboxClick?: (e: React.MouseEvent) => void;
  isDraggable: boolean;
}

function QuestionContent({
  question,
  index,
  isSelected,
  showCheckbox = false,
  onCheckboxClick,
  isDraggable,
}: QuestionContentProps) {
  const CheckboxIcon = isSelected ? CheckSquare : Square;
  const checkboxColorClass = isSelected ? 'text-violet-500' : 'text-zinc-300';

  return (
    <div
      className={cn(
        'flex gap-4 items-center',
        isDraggable && 'pointer-events-none'
      )}
    >
      {showCheckbox && !isDraggable && (
        <CheckboxIcon className={cn('size-5', checkboxColorClass)} />
      )}

      {showCheckbox && isDraggable && (
        <div className="pointer-events-auto" onClick={onCheckboxClick}>
          <CheckboxIcon
            className={cn('size-5 cursor-pointer', checkboxColorClass)}
          />
        </div>
      )}

      {isDraggable && <QuestionNumber index={index} />}

      <TypeTag type={question.type} />

      <Typo.Body
        size="medium"
        className={cn(isDraggable && 'group-active:text-violet-500')}
      >
        {question.title}
      </Typo.Body>
    </div>
  );
}

interface QuestionNumberProps {
  index: number;
}

function QuestionNumber({ index }: QuestionNumberProps) {
  return (
    <div className="aspect-square w-5 flex items-center justify-center bg-violet-50 rounded-full">
      <Typo.Body size="small" className="font-semibold text-violet-600">
        {index + 1}
      </Typo.Body>
    </div>
  );
}

function useToggleQuestionSelection() {
  const [selectedQuestions, setSelectedQuestions] =
    useAtom(selectedQuestionAtom);

  const toggleQuestionSelection = (question: SurveyQuestionSummary) => {
    const isSelected = selectedQuestions.has(question);
    const updatedQuestions = new Set(selectedQuestions);

    if (isSelected) {
      updatedQuestions.delete(
        [...updatedQuestions].find((q) => q.id === question.id)!
      );
    } else {
      updatedQuestions.add(question);
    }

    setSelectedQuestions(updatedQuestions);
  };

  return {
    selectedQuestions,
    toggleQuestionSelection,
  };
}
