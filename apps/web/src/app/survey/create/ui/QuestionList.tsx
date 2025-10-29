'use client';

import { SurveyQuestionType } from '@prisma/client';
import { Button, Typo } from '@repo/ui/components';
import { cn } from '@repo/ui/lib';
import { ComponentProps } from 'react';
import { GripVertical, Square, CheckSquare, Loader2Icon } from 'lucide-react';
import { Reorder } from 'framer-motion';
import { SearchBar } from './SearchBar';
import { EmptyFallback } from './EmptyFallback';
import { TypeTag } from './TypeTag';

export interface QuestionListProps extends ComponentProps<'section'> {
  title: string;
  questions: {
    id: string;
    title: string;
    type: SurveyQuestionType;
  }[];
  getIsSelected?: (questionId: string) => boolean;
  onSelectQuestion: (questionId: string) => void;
  isDraggable?: boolean;
  onReorder?: (
    newOrder: { id: string; title: string; type: SurveyQuestionType }[]
  ) => void;
  hasSearchBar?: boolean;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
  showSelectControls?: boolean;
  searchQuery?: string;
  setSearchQuery?: (searchQuery: string) => void;
  showCheckboxInDraggable?: boolean;
  isLoading?: boolean;
}

export function QuestionList({
  title,
  questions,
  onSelectQuestion,
  isDraggable = false,
  getIsSelected = () => false,
  onReorder,
  hasSearchBar = false,
  onSelectAll,
  onDeselectAll,
  showSelectControls = false,
  className,
  searchQuery,
  setSearchQuery,
  showCheckboxInDraggable = false,
  isLoading = false,
  ...props
}: QuestionListProps) {
  return (
    <section className={cn('flex flex-col', className)} {...props}>
      <div className="flex-shrink-0 bg-background">
        <div className="py-1 flex items-center justify-between">
          <Typo.SubTitle size="large">{title}</Typo.SubTitle>
          {showSelectControls && !isDraggable && (
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={onDeselectAll}
                className="p-2 h-auto"
              >
                <Typo.Body size="small">전체 해제</Typo.Body>
              </Button>

              <Button
                variant="secondary"
                onClick={onSelectAll}
                className="p-2 h-auto"
              >
                <Typo.Body size="small">전체 선택</Typo.Body>
              </Button>
            </div>
          )}
        </div>
        {hasSearchBar && (
          <div className="py-2">
            <SearchBar
              searchQuery={searchQuery ?? ''}
              setSearchQuery={
                setSearchQuery ??
                (() => {
                  return;
                })
              }
            />
          </div>
        )}
      </div>
      {!isLoading && isDraggable && onReorder ? (
        <Reorder.Group
          axis="y"
          values={questions}
          onReorder={onReorder}
          className="py-2 flex flex-col flex-1 min-h-0 overflow-y-auto"
          as="ul"
        >
          {questions?.length > 0 ? (
            questions?.map((question, index) => (
              <DraggableQuestionItem
                key={question.id}
                question={question}
                index={index}
                isSelected={getIsSelected?.(question.id)}
                onSelectQuestion={onSelectQuestion}
                showCheckbox={showCheckboxInDraggable}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center flex-1">
              {!isLoading ? (
                <EmptyFallback />
              ) : (
                <Loader2Icon className="size-12 animate-spin text-violet-100" />
              )}
            </div>
          )}
        </Reorder.Group>
      ) : (
        <ul className="py-2 flex flex-col flex-1 min-h-0 overflow-y-auto">
          {questions?.length > 0 ? (
            questions?.map((question, index) => (
              <QuestionItem
                key={question.id}
                index={index}
                isSelected={getIsSelected?.(question.id)}
                title={question.title}
                questionId={question.id}
                onSelectQuestion={onSelectQuestion}
                isDraggable={isDraggable}
                type={question.type}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center flex-1">
              {!isLoading ? (
                <EmptyFallback />
              ) : (
                <Loader2Icon className="size-12 animate-spin text-violet-100" />
              )}
            </div>
          )}
        </ul>
      )}
    </section>
  );
}

interface DraggableQuestionItemProps {
  question: { id: string; title: string; type: SurveyQuestionType };
  index: number;
  isSelected: boolean;
  onSelectQuestion: (questionId: string) => void;
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
    onSelectQuestion(question.id);
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
      <div className="flex gap-4 items-center pointer-events-none">
        {showCheckbox && (
          <div className="pointer-events-auto" onClick={handleCheckboxClick}>
            {isSelected ? (
              <CheckSquare className="size-5 text-violet-500 cursor-pointer" />
            ) : (
              <Square className="size-5 text-zinc-300 cursor-pointer" />
            )}
          </div>
        )}
        <div className="aspect-square w-5 flex items-center justify-center bg-violet-50 rounded-full">
          <Typo.Body size="small" className="font-semibold text-violet-600">
            {index + 1}
          </Typo.Body>
        </div>
        <TypeTag type={question.type} />
        <Typo.Body size="medium" className="group-active:text-violet-500">
          {question.title}
        </Typo.Body>
      </div>
      <GripVertical className="size-4 text-zinc-400 pointer-events-none group-active:text-violet-500 transition-colors" />
    </Reorder.Item>
  );
}

interface QuestionItemProps extends ComponentProps<'li'> {
  title: string;
  questionId: string;
  onSelectQuestion: (questionId: string) => void;
  index: number;
  isDraggable?: boolean;
  isSelected?: boolean;
  type: SurveyQuestionType;
}

function QuestionItem({
  title,
  type,
  questionId,
  onSelectQuestion,
  isDraggable = false,
  isSelected = false,
  index,
  ...props
}: QuestionItemProps) {
  return (
    <li
      onClick={() => onSelectQuestion(questionId)}
      {...props}
      className={cn(
        'flex items-center justify-between select-none p-3 group cursor-pointer',
        isDraggable
          ? 'cursor-grab active:cursor-grabbing hover:bg-zinc-50 active:bg-violet-50 '
          : 'cursor-pointer hover:bg-zinc-50 active:bg-violet-100',
        'transition-colors duration-200 ease-in-out',
        props.className
      )}
    >
      <div className="flex gap-4 items-center">
        {!isDraggable && (
          <>
            {isSelected ? (
              <CheckSquare className="size-5 text-violet-500" />
            ) : (
              <Square className="size-5 text-zinc-300" />
            )}
          </>
        )}

        {isDraggable && (
          <div className="aspect-square w-5 flex items-center justify-center bg-violet-50 rounded-full">
            <Typo.Body size="small" className="font-semibold text-violet-600">
              {index + 1}
            </Typo.Body>
          </div>
        )}
        <TypeTag type={type} />
        <Typo.Body size="medium">{title}</Typo.Body>
      </div>

      {isDraggable && (
        <GripVertical className="size-4 text-zinc-400 group-active:text-violet-500" />
      )}
    </li>
  );
}
