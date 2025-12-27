import { DiagramLabelingValue } from '../components/DiagramLabelingInputs';
import { CriteriaType } from '../lib/api-cleaned';

/**
 * Converts DiagramLabelingValue to backend gap_filling format
 */
export function convertDiagramLabelingToGapFilling(data: DiagramLabelingValue) {
  if (!data || !data.items || data.items.length === 0) {
    return {
      title: '',
      principle: 'ONE_WORD' as CriteriaType,
      body: '',
    };
  }

  // Build the body text with diagram structure
  let bodyText = '';

  // Add title if exists
  if (data.diagramTitle) {
    bodyText += `Diagram: ${data.diagramTitle}\n\n`;
  }

  // Note: diagramImageUrl will be handled separately via diagram_chart
  // Add note about diagram
  bodyText += '(Diagram not shown – labels correspond to numbered parts)\n\n';

  // Add items/labels
  data.items.forEach((item) => {
    if (item.content.trim()) {
      bodyText += item.content.trim() + '\n\n';
    }
  });

  // Add options if provided
  if (data.options && data.options.length > 0) {
    bodyText += 'Options:\n';
    data.options.forEach(option => {
      if (option.trim()) {
        bodyText += `${option}\n`;
      }
    });
  }

  // Add correct answers if provided (for admin reference)
  if (data.answers && data.answers.length > 0) {
    bodyText += '\n✅ Correct Answers:\n';
    data.answers
      .sort((a, b) => a.questionNumber - b.questionNumber)
      .forEach(answer => {
        bodyText += `${answer.questionNumber} → ${answer.correctAnswer}\n`;
      });
  }

  const result: any = {
    title: data.instruction || 'Label the diagram below.',
    principle: data.principle,
    body: bodyText.trim(),
  };

  // Add diagram_chart if image exists
  if (data.diagramImageUrl) {
    result.diagram_chart = {
      image: data.diagramImageUrl
    };
    console.log('✅ Added diagram_chart to diagram_labeling result:', {
      hasDiagramChart: !!result.diagram_chart,
      imageType: result.diagram_chart.image.startsWith('data:image') ? 'base64' : 'url',
      imageLength: result.diagram_chart.image.length,
    });
  }

  return result;
}

/**
 * Converts backend gap_filling format to DiagramLabelingValue
 */
export function convertGapFillingToDiagramLabeling(gapFilling: {
  title?: string;
  principle: CriteriaType;
  body: string;
  diagram_chart?: { image: string };
}): DiagramLabelingValue {
  const generateId = () => {
    return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Parse the body text
  const lines = gapFilling.body.split('\n');
  
  let diagramTitle = '';
  let diagramImageUrl = '';
  const items: { id: string; content: string }[] = [];
  const options: string[] = [];
  const answers: { questionNumber: number; correctAnswer: string }[] = [];
  
  let currentSection: 'body' | 'options' | 'answers' = 'body';
  let itemContent = '';

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Detect Diagram title
    if (trimmedLine.startsWith('Diagram:')) {
      diagramTitle = trimmedLine.replace('Diagram:', '').trim();
      continue;
    }

    // Detect image URL
    if (trimmedLine.startsWith('(Diagram Image:')) {
      const match = trimmedLine.match(/\(Diagram Image:\s*(.+)\)/);
      if (match) {
        diagramImageUrl = match[1].trim();
      }
      continue;
    }

    // Skip diagram note
    if (trimmedLine.includes('Diagram not shown') || trimmedLine.includes('labels correspond to numbered parts')) {
      continue;
    }

    // Detect sections
    if (trimmedLine === 'Options:' || trimmedLine.toLowerCase() === 'options') {
      if (itemContent) {
        items.push({ id: generateId(), content: itemContent.trim() });
        itemContent = '';
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
      if (trimmedLine) {
        // Check if this line contains a question number (like (1), (2))
        if (trimmedLine.match(/\(\d+\)/)) {
          // If we have accumulated content, save it as an item
          if (itemContent) {
            items.push({ id: generateId(), content: itemContent.trim() });
          }
          // Start new item
          itemContent = trimmedLine;
        } else if (itemContent) {
          // Continue accumulating content for current item
          itemContent += ' ' + trimmedLine;
        } else {
          // Start new item
          itemContent = trimmedLine;
        }
      } else if (itemContent) {
        // Empty line - save current item
        items.push({ id: generateId(), content: itemContent.trim() });
        itemContent = '';
      }
    } else if (currentSection === 'options') {
      if (trimmedLine && !trimmedLine.startsWith('✅')) {
        options.push(trimmedLine);
      }
    } else if (currentSection === 'answers') {
      // Parse answer format: "1 → hub" or "1: hub"
      const answerMatch = trimmedLine.match(/^(\d+)\s*[→:]\s*(.+)$/);
      if (answerMatch) {
        answers.push({
          questionNumber: parseInt(answerMatch[1]),
          correctAnswer: answerMatch[2].trim(),
        });
      }
    }
  }

  // Add last item if exists
  if (itemContent) {
    items.push({ id: generateId(), content: itemContent.trim() });
  }

  // Ensure at least 2 items
  if (items.length === 0) {
    items.push({ id: generateId(), content: '' });
    items.push({ id: generateId(), content: '' });
  }

  // Use diagram_chart.image if available, otherwise use parsed diagramImageUrl
  const finalImageUrl = gapFilling.diagram_chart?.image || diagramImageUrl || undefined;

  return {
    principle: gapFilling.principle,
    instruction: gapFilling.title || undefined,
    diagramTitle: diagramTitle || undefined,
    diagramImageUrl: finalImageUrl,
    items,
    options: options.length > 0 ? options : undefined,
    answers: answers.length > 0 ? answers : undefined,
  };
}
