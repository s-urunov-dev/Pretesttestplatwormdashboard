import { ShortAnswerValue } from '../components/ShortAnswerInputs';
import { CriteriaType } from '../lib/api-cleaned';

/**
 * Converts ShortAnswerValue to backend gap_filling format
 */
export function convertShortAnswerToGapFilling(data: ShortAnswerValue) {
  if (!data || !data.questions || data.questions.length === 0) {
    return {
      title: '',
      principle: 'NMT_TWO' as CriteriaType,
      body: '',
    };
  }

  // Build the body text with questions
  let bodyText = 'Questions\n\n';

  data.questions.forEach((question, index) => {
    if (question.question.trim()) {
      bodyText += `${index + 1}. ${question.question.trim()}\n\n`;
    }
  });

  // Add correct answers if provided (for admin reference)
  const hasAnswers = data.questions.some(q => q.correctAnswer.trim());
  if (hasAnswers) {
    bodyText += '✅ Correct Answers:\n';
    data.questions.forEach((question, index) => {
      if (question.question.trim() && question.correctAnswer.trim()) {
        bodyText += `${index + 1} → ${question.correctAnswer.trim()}\n`;
      }
    });
  }

  // Generate instruction
  let instruction = data.instruction;
  if (!instruction) {
    instruction = 'Answer the questions below.';
  }

  return {
    title: instruction,
    principle: data.principle,
    body: bodyText.trim(),
  };
}

/**
 * Converts backend gap_filling format to ShortAnswerValue
 */
export function convertGapFillingToShortAnswer(gapFilling: {
  title?: string;
  principle: CriteriaType;
  body: string;
}): ShortAnswerValue {
  const generateId = () => {
    return `question_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Parse the body text
  const lines = gapFilling.body.split('\n');
  
  const questions: { id: string; question: string; correctAnswer: string }[] = [];
  const answers: Record<number, string> = {};
  
  let currentSection: 'questions' | 'answers' = 'questions';

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Skip empty lines and section headers
    if (!trimmedLine || trimmedLine.toLowerCase() === 'questions') {
      continue;
    }

    // Detect answers section
    if (trimmedLine.startsWith('✅ Correct Answers') || trimmedLine === 'Correct Answers:') {
      currentSection = 'answers';
      continue;
    }

    // Process based on current section
    if (currentSection === 'questions') {
      // Match question format: "1. What is...?" or "1) What is...?"
      const questionMatch = trimmedLine.match(/^(\d+)[.)]\s*(.+)$/);
      if (questionMatch) {
        const questionNumber = parseInt(questionMatch[1]);
        const questionText = questionMatch[2].trim();
        
        questions.push({
          id: generateId(),
          question: questionText,
          correctAnswer: '',
        });
      }
    } else if (currentSection === 'answers') {
      // Parse answer format: "1 → answer" or "1: answer"
      const answerMatch = trimmedLine.match(/^(\d+)\s*[→:]\s*(.+)$/);
      if (answerMatch) {
        const questionNumber = parseInt(answerMatch[1]);
        answers[questionNumber] = answerMatch[2].trim();
      }
    }
  }

  // Merge answers into questions
  questions.forEach((question, index) => {
    const questionNumber = index + 1;
    if (answers[questionNumber]) {
      question.correctAnswer = answers[questionNumber];
    }
  });

  // Ensure at least 3 questions
  if (questions.length === 0) {
    questions.push(
      { id: generateId(), question: '', correctAnswer: '' },
      { id: generateId(), question: '', correctAnswer: '' },
      { id: generateId(), question: '', correctAnswer: '' }
    );
  }

  return {
    principle: gapFilling.principle,
    instruction: gapFilling.title || undefined,
    questions,
  };
}
