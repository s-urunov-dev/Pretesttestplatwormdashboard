import { FlowChartCompletionValue } from '../components/FlowChartCompletionInputs';
import { CriteriaType } from '../lib/api-cleaned';

/**
 * Converts FlowChartCompletionValue to backend gap_filling format
 */
export function convertFlowChartCompletionToGapFilling(data: FlowChartCompletionValue) {
  console.log('🔄 convertFlowChartCompletionToGapFilling - Input:', {
    hasSteps: !!data?.steps,
    stepsCount: data?.steps?.length || 0,
    hasImage: !!data?.image,
    imageType: data?.image ? (data.image.startsWith('data:image') ? 'base64' : 'url') : 'none',
    imageLength: data?.image?.length || 0,
  });

  if (!data || !data.steps || data.steps.length === 0) {
    return {
      title: '',
      principle: 'ONE_WORD' as CriteriaType,
      body: '',
    };
  }

  // Build the body text with flow chart structure
  let bodyText = '';

  // Add title if exists
  if (data.flowChartTitle) {
    bodyText += `Flow Chart: ${data.flowChartTitle}\n\n`;
  }

  // Add steps with arrows
  data.steps.forEach((step, index) => {
    bodyText += step.content;
    // Add arrow between steps (except after last step)
    if (index < data.steps.length - 1) {
      bodyText += '\n⬇️\n';
    }
  });

  // Add options if provided
  if (data.options && data.options.length > 0) {
    bodyText += '\n\nOptions:\n';
    data.options.forEach(option => {
      if (option.trim()) {
        bodyText += `${option}\n`;
      }
    });
  }

  // Add correct answers if provided (for admin reference)
  if (data.answers && data.answers.length > 0) {
    bodyText += '\n\n✅ Correct Answers:\n';
    data.answers
      .sort((a, b) => a.questionNumber - b.questionNumber)
      .forEach(answer => {
        bodyText += `${answer.questionNumber} → ${answer.correctAnswer}\n`;
      });
  }

  const result: any = {
    title: data.instruction || 'Complete the flow chart below.',
    principle: data.principle,
    body: bodyText.trim(),
  };

  // Add diagram_chart if image exists
  if (data.image) {
    result.diagram_chart = {
      image: data.image
    };
    console.log('✅ Added diagram_chart to result:', {
      hasDiagramChart: !!result.diagram_chart,
      imageType: result.diagram_chart.image.startsWith('data:image') ? 'base64' : 'url',
      imageLength: result.diagram_chart.image.length,
    });
  }

  console.log('✅ convertFlowChartCompletionToGapFilling - Output:', {
    hasTitle: !!result.title,
    hasPrinciple: !!result.principle,
    hasBody: !!result.body,
    hasDiagramChart: !!result.diagram_chart,
  });

  return result;
}

/**
 * Converts backend gap_filling format to FlowChartCompletionValue
 */
export function convertGapFillingToFlowChartCompletion(gapFilling: {
  title?: string;
  principle: CriteriaType;
  body: string;
  diagram_chart?: { image: string };
}): FlowChartCompletionValue {
  const generateId = () => {
    return `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Parse the body text
  const lines = gapFilling.body.split('\n');
  
  let flowChartTitle = '';
  const steps: { id: string; content: string }[] = [];
  const options: string[] = [];
  const answers: { questionNumber: number; correctAnswer: string }[] = [];
  
  let currentSection: 'body' | 'options' | 'answers' = 'body';
  let stepContent = '';

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Detect Flow Chart title
    if (trimmedLine.startsWith('Flow Chart:')) {
      flowChartTitle = trimmedLine.replace('Flow Chart:', '').trim();
      continue;
    }

    // Detect sections
    if (trimmedLine === 'Options:' || trimmedLine.toLowerCase() === 'options') {
      if (stepContent) {
        steps.push({ id: generateId(), content: stepContent.trim() });
        stepContent = '';
      }
      currentSection = 'options';
      continue;
    }

    if (trimmedLine.startsWith('✅ Correct Answers') || trimmedLine === 'Correct Answers:') {
      currentSection = 'answers';
      continue;
    }

    // Process based on current section
    if (currentSection === 'body') {
      // Skip arrow lines
      if (trimmedLine === '⬇️' || trimmedLine === '↓') {
        if (stepContent) {
          steps.push({ id: generateId(), content: stepContent.trim() });
          stepContent = '';
        }
      } else if (trimmedLine) {
        stepContent += (stepContent ? ' ' : '') + trimmedLine;
      }
    } else if (currentSection === 'options') {
      if (trimmedLine && !trimmedLine.startsWith('✅')) {
        options.push(trimmedLine);
      }
    } else if (currentSection === 'answers') {
      // Parse answer format: "1 → sun" or "1: sun"
      const answerMatch = trimmedLine.match(/^(\d+)\s*[→:]\s*(.+)$/);
      if (answerMatch) {
        answers.push({
          questionNumber: parseInt(answerMatch[1]),
          correctAnswer: answerMatch[2].trim(),
        });
      }
    }
  }

  // Add last step if exists
  if (stepContent) {
    steps.push({ id: generateId(), content: stepContent.trim() });
  }

  // Ensure at least 2 steps
  if (steps.length === 0) {
    steps.push({ id: generateId(), content: '' });
    steps.push({ id: generateId(), content: '' });
  }

  return {
    principle: gapFilling.principle,
    instruction: gapFilling.title || undefined,
    flowChartTitle: flowChartTitle || undefined,
    image: gapFilling.diagram_chart?.image || undefined,
    steps,
    options: options.length > 0 ? options : undefined,
    answers: answers.length > 0 ? answers : undefined,
  };
}