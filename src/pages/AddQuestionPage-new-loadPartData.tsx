  const loadPartData = () => {
    const currentPart = parts.find(
      (p) => p.part_type === selectedSubType
    );

    if (currentPart) {
      // ✅ Set current part ID for updates
      setCurrentPartId(currentPart.id);
      
      // ✅ Load title and audio
      setTitle(currentPart.title || '');
      
      const audioUrlFromPart = typeof currentPart.audio === 'object' && currentPart.audio?.audio
        ? currentPart.audio.audio
        : currentPart.audio || '';
      setAudioUrl(audioUrlFromPart);

      // ✅ Convert backend groups to frontend format
      const backendGroups = currentPart.groups || currentPart.question_groups || [];
      
      const convertedGroups: QuestionGroup[] = backendGroups.map((group: any) => {
        // Backend returns listening_question_type as string (for listening parts)
        const questionType = typeof group.listening_question_type === 'string' 
          ? group.listening_question_type 
          : group.listening_question_type?.type;
        
        const convertedGroup: QuestionGroup = {
          question_type: questionType,
          from_value: group.from_value,
          to_value: group.to_value,
        };

        // ✅ Check gap_containers first (NEW API FORMAT), then completion, then gap_filling
        const gapData = group.gap_containers || group.completion || group.gap_filling;
        
        if (gapData) {
          const gapFillingData = {
            title: gapData.title || '',
            principle: gapData.principle || gapData.criteria || 'NMT_TWO',
            body: gapData.body || '',
          };
          
          convertedGroup.gap_filling = gapFillingData;
          
          // Convert to specific types based on question_type
          if (questionType === 'sentence_completion' && !group.sentence_completion) {
            convertedGroup.sentence_completion = convertGapFillingToSentenceCompletion(gapFillingData);
          }
          
          if (questionType === 'form_completion') {
            convertedGroup.form_completion = {
              title: gapFillingData.title || 'Complete the form below',
              body: gapFillingData.body || '',
              principle: gapFillingData.principle || 'NMT_TWO',
            };
          }
          
          if (questionType === 'summary_completion' && !group.summary_completion) {
            convertedGroup.summary_completion = {
              title: gapFillingData.title || 'Complete the summary below.',
              body: gapFillingData.body || '',
              principle: gapFillingData.principle || 'NMT_TWO',
            };
          }
          
          if (questionType === 'flow_chart_completion' && !group.flow_chart_completion) {
            convertedGroup.flow_chart_completion = {
              title: gapFillingData.title || 'Complete the flow chart below.',
              body: gapFillingData.body || '',
              principle: gapFillingData.principle || 'NMT_TWO',
            };
          }
        }

        // Convert matching_statement to matching_item OR multiple_choice_data
        if (group.matching_statement && Array.isArray(group.matching_statement) && group.matching_statement.length > 0) {
          const firstStatement = group.matching_statement[0];
          
          if (questionType === 'multiple_choice_one' || questionType === 'multiple_choice_multiple') {
            const statements = firstStatement.statement || [];
            const options = firstStatement.option || [];
            
            const questions = statements.map((statement: string, idx: number) => {
              const questionOptionsArray = options[idx] || [];
              const variantType = firstStatement.variant_type || 'letter';
              const optionsArray = questionOptionsArray.map((text: string, optIdx: number) => {
                let key = '';
                if (variantType === 'letter') {
                  key = String.fromCharCode(65 + optIdx);
                } else if (variantType === 'number') {
                  key = String(optIdx + 1);
                } else {
                  const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
                  key = romanNumerals[optIdx] || String(optIdx + 1);
                }
                return { key, text };
              });
              
              return {
                question: statement,
                options: optionsArray,
                correctAnswer: firstStatement.answer_count > 1 ? [] : ''
              };
            });
            
            convertedGroup.multiple_choice_data = {
              title: firstStatement.title || '',
              variant_type: firstStatement.variant_type || 'letter',
              answer_count: firstStatement.answer_count || 1,
              questions: questions,
            };
          } else {
            convertedGroup.matching_item = {
              title: firstStatement.title || '',
              statement: firstStatement.statement || [],
              option: firstStatement.option || [],
              variant_type: firstStatement.variant_type || 'letter',
              answer_count: firstStatement.answer_count || 1,
            };
          }
        }
        else if (group.matching) {
          convertedGroup.matching_item = {
            title: group.matching.title || '',
            statement: group.matching.statement || [],
            option: group.matching.option || [],
            variant_type: group.matching.variant_type || 'letter',
            answer_count: group.matching.answer_count || 1,
          };
        }

        if (group.identify_info) {
          convertedGroup.identify_info = {
            title: group.identify_info.title || '',
            question: group.identify_info.question || [],
          };
        }

        if (group.sentence_completion) {
          convertedGroup.sentence_completion = {
            title: group.sentence_completion.title || '',
            instruction: group.sentence_completion.instruction || '',
            sentences: group.sentence_completion.sentences || [],
          };
        }

        if (group.table_completion) {
          let tableDetails: any = group.table_completion.table_details;
          
          if (typeof tableDetails === 'string') {
            try {
              tableDetails = JSON.parse(tableDetails);
            } catch (e) {
              tableDetails = {};
            }
          }
          
          if (!tableDetails || typeof tableDetails !== 'object') {
            tableDetails = {};
          }

          convertedGroup.table_completion = {
            principle: group.table_completion.principle || 'ONE_WORD',
            table_details: tableDetails,
          } as any;
        }

        return convertedGroup;
      });

      setGroups(convertedGroups);
      
      const allGroupIndexes = convertedGroups.map((_, index) => index);
      setExpandedGroups(allGroupIndexes);
    } else {
      // Clear form if part doesn't exist
      setCurrentPartId(undefined);
      setTitle('');
      setAudioUrl('');
      setGroups([]);
      setExpandedGroups([]);
    }
  };
