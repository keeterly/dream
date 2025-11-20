import React from "react";
import type { AnswerMap, Question } from "../../types";

interface QuestionStepProps {
  questions: Question[];
  currentIndex: number;
  answers: AnswerMap;
  onChooseAnswer: (questionId: string, optionId: string) => void;
}

export const QuestionStep: React.FC<QuestionStepProps> = ({
  questions,
  currentIndex,
  answers,
  onChooseAnswer,
}) => {
  const question = questions[currentIndex];
  const selected = answers[question.id];

  return (
    <section className="app-screen app-screen-questions">
      <div className="question-card">
        <div className="question-header">
          <span className="question-step-indicator">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <h2 className="question-title">{question.prompt}</h2>
          {question.subtitle && (
            <p className="question-subtitle">{question.subtitle}</p>
          )}
        </div>

        <div className="question-options">
          {question.options.map((opt) => (
            <button
              key={opt.id}
              className={
                "question-option" +
                (selected === opt.id ? " question-option--selected" : "")
              }
              onClick={() => onChooseAnswer(question.id, opt.id)}
            >
              <span className="question-option-label">{opt.label}</span>
              {opt.helper && (
                <span className="question-option-helper">{opt.helper}</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
