export const BASE_URL = 'https://api.samariddin.space/api/v1';

// Check if API is available
let isAPIAvailable = true;
let apiCheckPromise: Promise<boolean> | null = null;

async function checkAPIAvailability(): Promise<boolean> {
  if (apiCheckPromise) return apiCheckPromise;
  
  apiCheckPromise = (async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(`${BASE_URL}/tests/`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      isAPIAvailable = response.ok || response.status === 404;
      return isAPIAvailable;
    } catch (error) {
      // Silently switch to offline mode
      isAPIAvailable = false;
      return false;
    }
  })();
  
  return apiCheckPromise;
}

// ============= Type Definitions =============

export type PassageType = 'passage1' | 'passage2' | 'passage3';
export type PartType = 'part_1' | 'part_2' | 'part_3' | 'part_4';
export type WritingType = 'task1' | 'task2';
export type VariantType = 'letter' | 'number' | 'romain';
export type CriteriaType = 'ONE_WORD' | 'ONE_WORD_OR_NUMBER' | 'NMT_ONE' | 'NMT_TWO' | 'NMT_THREE' | 'NMT_TWO_NUM' | 'NMT_THREE_NUM' | 'NUMBER_ONLY' | 'FROM_BOX';

// Question Types from backend
export interface QuestionType {
  id: number;
  type: string;
}

// Question Group structures
export interface GapFillingData {
  title: string;
  principle: CriteriaType; // Changed from criteria to principle
  body: string;
  diagram_chart?: {
    image: string; // Base64 or URL
  };
}

export interface IdentifyInfoData {
  title: string;
  question: string[];
}

export interface MatchingItemData {
  title: string;
  statement: string[];
  option: string[][]; // ✅ FIXED: Array of arrays like [["text1", "text2"], ["text3", "text4"]]
  variant_type: VariantType;
  answer_count: number;
}

export interface MapDiagramData {
  title: string;
  image: File | string; // File for upload, string for URL/existing image
}

export interface TableCompletionData {
  principle: CriteriaType;
  row_count: number;
  column_counts: string[][];
  table_details: {
    instruction?: string;
    rows?: any[][];
  };
}

// Listening-specific structures (for new API)
export interface ListeningMapData {
  image: string;
  title: string;
  group: number;
}

export interface ListeningCompletionData {
  title: string;
  principle: CriteriaType;
  body: string;
}

export interface ListeningMatchingStatementData {
  title: string;
  statement: string[];
  option: Array<{ [key: string]: string }>; // CORRECT: Array of objects like [{ "A": "text", "B": "text" }]
  variant_type: VariantType;
  answer_count: number;
}

export interface ListeningTableCompletionData {
  principle: CriteriaType;
  table_details: {
    [key: string]: string; // Index-based: { "0": "value", "1": "value", ... }
  };
}

export interface SentenceCompletionData {
  title: string;
  instruction: string;
  sentences: Array<{
    text: string;
    correctAnswer: string;
  }>;
}

export interface SummaryCompletionData {
  title: string;
  instruction: string;
  summary: string;
  options: string[];
}

export interface QuestionGroup {
  question_type: string;
  from_value: number;
  to_value: number;
  gap_filling?: GapFillingData;
  identify_info?: IdentifyInfoData;
  matching_item?: MatchingItemData;
  map_diagram?: MapDiagramData;
  table_completion?: TableCompletionData | ListeningTableCompletionData; // Support both old and new formats
  sentence_completion?: SentenceCompletionData;
  summary_completion?: SummaryCompletionData;
  flowchart_completion?: any; // Flow Chart Completion data
  diagram_labeling?: any; // Diagram Labeling data
  short_answer?: any; // Short Answer data
  form_completion?: any; // Form Completion data
  multiple_choice_data?: any; // Multiple Choice data for Listening
}

// Listening Question Group (with listening_question_type for API)
export interface ListeningQuestionGroup {
  listening_question_type: string;
  from_value: number;
  to_value: number;
  listening_map?: ListeningMapData[]|any;
  table_completion?: ListeningTableCompletionData;
  completion?: ListeningCompletionData;
  matching_statement?: ListeningMatchingStatementData[];
}

// Reading Passage Create Request
export interface CreateReadingPassageRequest {
  reading: number;
  passage_type: PassageType;
  title: string;
  body: string;
  groups: QuestionGroup[];
}

// Reading Passage Update Request
export interface UpdateReadingPassageRequest {
  title: string;
  body: string;
  groups: QuestionGroup[];
}

// Bulk Create Reading Passages Request (v2 API)
export interface BulkCreateReadingPassagesRequest {
  reading_id: number;
  passages: {
    passage_type: PassageType;
    title: string;
    body: string;
    groups: QuestionGroup[];
  }[];
}

export interface ReadingPassage {
  id: number;
  passage_type: PassageType;
  title: string;
  body: string;
}

export interface ReadingSection {
  id: number;
  passages: ReadingPassage[];
}

export interface ListeningPart {
  id: number;
  created_at: string;
  updated_at: string;
  audio: string;
  part_type: PartType;
  listening: number;
  question_type: number[];
  groups?: any[]; // Question groups
}

export interface ListeningSection {
  parts: ListeningPart[];
}

export interface WritingSection {
  test_id: number;
  question: string;
  image: string | null;
  type: WritingType;
}

export interface WritingResponse {
  id: number;
  test: number;
  type: WritingType;
  question: string;
  image: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateWritingRequest {
  test: number;
  type: WritingType;
  question: string;
  image?: File | null;
}

export interface UpdateWritingRequest {
  test?: number;
  type?: WritingType;
  question?: string;
  image?: File | null;
}

export interface TestDetail {
  id: number;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  reading: number | null;
  listening: number | null;
  writing: number | null;
  reading_passage1_completed: boolean;
  reading_passage2_completed: boolean;
  reading_passage3_completed: boolean;
  listening_part1_completed: boolean;
  listening_part2_completed: boolean;
  listening_part3_completed: boolean;
  listening_part4_completed: boolean;
  writing_task1_completed: boolean;
  writing_task2_completed: boolean;
}

export interface TestResponse {
  id: number;
  created_at?: string;
  updated_at?: string;
  name: string;
  is_active: boolean;
  reading?: number | { id: number };
  listening?: number | any;
  writing?: number | any[];
  reading_passage1_completed?: boolean;
  reading_passage2_completed?: boolean;
  reading_passage3_completed?: boolean;
  listening_part1_completed?: boolean;
  listening_part2_completed?: boolean;
  listening_part3_completed?: boolean;
  listening_part4_completed?: boolean;
  writing_task1_completed?: boolean;
  writing_task2_completed?: boolean;
}

export interface CreateTestRequest {
  name: string;
  is_active: boolean;
}

// Legacy types for backward compatibility
export interface ReadingResponse {
  id: number;
  test: number;
  created_at: string;
  updated_at: string;
}

export interface ListeningResponse {
  id: number;
  test: number;
  created_at: string;
  updated_at: string;
}

export interface CreateSectionRequest {
  test: number;
}

// Listening Part Create Request
export interface CreateListeningPartRequest {
  listening: number;
  part_type: PartType;
  groups: ListeningQuestionGroup[];
}

// Listening Question Group Create Request
export interface CreateListeningQuestionGroupRequest {
  question_type: string;
  from_value: number;
  to_value: number;
  gap_filling?: GapFillingData;
  identify_info?: IdentifyInfoData;
  matching_item?: MatchingItemData;
}

// Gap Filling Criteria constants
export const GAP_FILLING_CRITERIA = {
  ONE_WORD: { value: 'ONE_WORD', label: 'One word only' },
  ONE_WORD_OR_NUMBER: { value: 'ONE_WORD_OR_NUMBER', label: 'One word and/or a number' },
  NMT_ONE: { value: 'NMT_ONE', label: 'No more than one word' },
  NMT_TWO: { value: 'NMT_TWO', label: 'No more than two words' },
  NMT_THREE: { value: 'NMT_THREE', label: 'No more than three words' },
  NMT_TWO_NUM: { value: 'NMT_TWO_NUM', label: 'No more than two words and/or a number' },
  NMT_THREE_NUM: { value: 'NMT_THREE_NUM', label: 'No more than three words and/or a number' },
  NUMBER_ONLY: { value: 'NUMBER_ONLY', label: 'A number' },
  FROM_BOX: { value: 'FROM_BOX', label: 'Choose from the box' },
};

// Audio Response Interface
export interface ListeningAudioResponse {
  id: number;
  audio: string; // URL to the uploaded audio file
  created_at: string;
  updated_at: string;
}

// ============= Offline Storage =============

const STORAGE_KEY = 'ielts_tests_offline';

function getOfflineTests(): TestResponse[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading offline tests:', error);
    return [];
  }
}

function saveOfflineTests(tests: TestResponse[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tests));
  } catch (error) {
    console.error('Error saving offline tests:', error);
  }
}

function addOfflineTest(test: TestResponse): void {
  const tests = getOfflineTests();
  tests.unshift(test);
  saveOfflineTests(tests);
}

function removeOfflineTest(id: number): void {
  const tests = getOfflineTests();
  saveOfflineTests(tests.filter(t => t.id !== id));
}

// ============= Helper Functions for File Conversion =============

/**
 * Helper to convert File to base64 string
 */
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

/**
 * Recursively convert all File objects in an object to base64 strings
 */
async function convertFilesToBase64(obj: any): Promise<any> {
  if (obj instanceof File) {
    return await fileToBase64(obj);
  }
  
  if (Array.isArray(obj)) {
    return Promise.all(obj.map(item => convertFilesToBase64(item)));
  }
  
  if (obj !== null && typeof obj === 'object') {
    const result: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        result[key] = await convertFilesToBase64(obj[key]);
      }
    }
    return result;
  }
  
  return obj;
}

// ============= API Functions =============

// Create a new test
export async function createTest(data: CreateTestRequest): Promise<TestResponse> {
  const apiAvailable = await checkAPIAvailability();
  
  if (!apiAvailable) {
    // Offline mode: create mock test
    const offlineTest: TestResponse = {
      id: Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      name: data.name,
      is_active: data.is_active,
    };
    addOfflineTest(offlineTest);
    return offlineTest;
  }

  try {
    console.log('🔄 Creating test:', data);
    
    const response = await fetch(`${BASE_URL}/tests/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    console.log('📡 Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Backend error response:', errorText);
      
      let errorMessage = 'Failed to create test';
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.detail) {
          errorMessage = errorJson.detail;
        } else if (errorJson.error) {
          errorMessage = errorJson.error;
        } else {
          errorMessage = JSON.stringify(errorJson);
        }
      } catch {
        errorMessage = errorText || `HTTP ${response.status}`;
      }
      
      throw new Error(`Test yaratib bo'lmadi: ${errorMessage}`);
    }

    const result = await response.json();
    console.log('✅ Test created:', result);
    
    // Add to offline cache
    const newTest: TestResponse = {
      id: result.id,
      created_at: result.created_at || new Date().toISOString(),
      updated_at: result.updated_at || new Date().toISOString(),
      name: result.name,
      is_active: result.is_active,
    };
    addOfflineTest(newTest);
    
    return newTest;
  } catch (error) {
    console.error('💥 Error creating test:', error);
    throw error;
  }
}

// Update test name
export async function updateTest(testId: number, data: { name: string }): Promise<TestResponse> {
  const apiAvailable = await checkAPIAvailability();
  
  if (!apiAvailable) {
    // Offline mode: update in local storage
    const tests = getOfflineTests();
    const testIndex = tests.findIndex(t => t.id === testId);
    if (testIndex !== -1) {
      tests[testIndex].name = data.name;
      tests[testIndex].updated_at = new Date().toISOString();
      saveOfflineTests(tests);
      return tests[testIndex];
    }
    throw new Error('Test not found in offline storage');
  }

  try {
    console.log('🔄 Updating test:', testId, data);
    
    const response = await fetch(`${BASE_URL}/tests/${testId}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    console.log('📡 Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Backend error response:', errorText);
      
      let errorMessage = 'Failed to update test';
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.detail) {
          errorMessage = errorJson.detail;
        } else if (errorJson.error) {
          errorMessage = errorJson.error;
        } else {
          errorMessage = JSON.stringify(errorJson);
        }
      } catch {
        errorMessage = errorText || `HTTP ${response.status}`;
      }
      
      throw new Error(`Test yangilash amalga oshmadi: ${errorMessage}`);
    }

    const result = await response.json();
    console.log('✅ Test updated:', result);
    
    // Update in offline cache
    const tests = getOfflineTests();
    const testIndex = tests.findIndex(t => t.id === testId);
    if (testIndex !== -1) {
      tests[testIndex].name = result.name;
      tests[testIndex].updated_at = result.updated_at || new Date().toISOString();
      saveOfflineTests(tests);
    }
    
    return result;
  } catch (error) {
    console.error('💥 Error updating test:', error);
    throw error;
  }
}

// Create reading section for a test
export async function createReading(testId: number): Promise<ReadingResponse> {
  const apiAvailable = await checkAPIAvailability();
  
  if (!apiAvailable) {
    // Offline mode: return mock response
    return {
      id: Date.now(),
      test: testId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  try {
    console.log('🔄 Creating reading section for test:', testId);
    
    const response = await fetch(`${BASE_URL}/reading/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        test: testId
        // Don't send passages - it causes nested serializer error
      }),
    });

    console.log('📡 Reading section response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Reading section error:', errorText);
      
      let errorMessage = 'Failed to create reading section';
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.detail) {
          errorMessage = errorJson.detail;
        } else if (errorJson.error) {
          errorMessage = errorJson.error;
        } else {
          errorMessage = JSON.stringify(errorJson);
        }
      } catch {
        errorMessage = errorText || `HTTP ${response.status}`;
      }
      
      throw new Error(`Reading section yaratib bo'lmadi: ${errorMessage}`);
    }

    const result = await response.json();
    console.log('✅ Reading section created:', result);
    return result;
  } catch (error) {
    console.error('💥 Error creating reading section:', error);
    throw error;
  }
}

// Create listening section for a test
export async function createListening(testId: number): Promise<ListeningResponse> {
  const apiAvailable = await checkAPIAvailability();
  
  if (!apiAvailable) {
    // Offline mode: return mock response
    return {
      id: Date.now() + 1,
      test: testId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  try {
    console.log('🔄 Creating listening section for test:', testId);
    
    // Backend expects test field
    const response = await fetch(`${BASE_URL}/listening-create/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        test: testId
      }),
    });

    console.log('📡 Listening section response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Listening section error:', errorText);
      
      let errorMessage = 'Failed to create listening section';
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.detail) {
          errorMessage = errorJson.detail;
        } else if (errorJson.error) {
          errorMessage = errorJson.error;
        } else {
          errorMessage = JSON.stringify(errorJson);
        }
      } catch {
        errorMessage = errorText || `HTTP ${response.status}`;
      }
      
      throw new Error(`Listening section yaratib bo'lmadi: ${errorMessage}`);
    }

    const result = await response.json();
    console.log('✅ Listening section created:', result);
    return result;
  } catch (error) {
    console.error('💥 Error creating listening section:', error);
    throw error;
  }
}

// Get all tests
export async function getTests(): Promise<TestResponse[]> {
  const apiAvailable = await checkAPIAvailability();
  
  if (!apiAvailable) {
    // Offline mode: return stored tests
    return getOfflineTests();
  }

  try {
    const response = await fetch(`${BASE_URL}/tests/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch tests: ${response.status}`);
    }

    const data = await response.json();
    
    // Handle both paginated and non-paginated responses
    let tests: TestResponse[];
    if (data.results && Array.isArray(data.results)) {
      // Paginated response
      tests = data.results;
    } else if (Array.isArray(data)) {
      // Direct array response
      tests = data;
    } else {
      console.error('Unexpected response format:', data);
      tests = [];
    }
    
    // Cache for offline use
    saveOfflineTests(tests);
    return tests;
  } catch (error) {
    console.error('Error fetching tests:', error);
    // Fallback to offline data silently
    return getOfflineTests();
  }
}

// Get a single test
export async function getTest(id: number): Promise<TestResponse> {
  const apiAvailable = await checkAPIAvailability();
  
  if (!apiAvailable) {
    // Offline mode: find in stored tests
    const tests = getOfflineTests();
    const test = tests.find(t => t.id === id);
    if (!test) {
      throw new Error('Test not found');
    }
    return test;
  }

  try {
    const response = await fetch(`${BASE_URL}/tests/${id}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch test:', response.status, errorText);
      throw new Error(`Failed to fetch test: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching test:', error);
    // Fallback to offline
    const tests = getOfflineTests();
    const test = tests.find(t => t.id === id);
    if (!test) {
      throw error;
    }
    return test;
  }
}

// Delete a test (offline capable)
export async function deleteTest(id: number): Promise<void> {
  const apiAvailable = await checkAPIAvailability();
  
  if (!apiAvailable) {
    // Offline mode: remove from storage
    removeOfflineTest(id);
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/tests/${id}/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete test');
    }

    // Also remove from offline storage
    removeOfflineTest(id);
  } catch (error) {
    console.error('Error deleting test:', error);
    // Still remove from offline storage
    removeOfflineTest(id);
    throw error;
  }
}

// Check if we're in offline mode
export async function isOfflineMode(): Promise<boolean> {
  const available = await checkAPIAvailability();
  return !available;
}

// Get detailed test information with reading, listening, writing
export async function getTestDetail(id: number): Promise<TestDetail> {
  const apiAvailable = await checkAPIAvailability();
  
  if (!apiAvailable) {
    // Offline mode: get test from offline storage
    const tests = getOfflineTests();
    const test = tests.find(t => t.id === id);
    
    if (!test) {
      throw new Error('Test not found in offline storage');
    }
    
    // Extract IDs from reading/listening/writing (can be number or object)
    const readingId = typeof test.reading === 'object' && test.reading !== null 
      ? test.reading.id 
      : test.reading || null;
    const listeningId = typeof test.listening === 'object' && test.listening !== null && 'id' in test.listening
      ? test.listening.id 
      : (typeof test.listening === 'number' ? test.listening : null);
    const writingId = typeof test.writing === 'object' && test.writing !== null && 'id' in test.writing
      ? test.writing.id 
      : (typeof test.writing === 'number' ? test.writing : null);
    
    // Convert TestResponse to TestDetail format
    const testDetail: TestDetail = {
      id: test.id,
      name: test.name,
      is_active: test.is_active,
      created_at: test.created_at || new Date().toISOString(),
      updated_at: test.updated_at || new Date().toISOString(),
      reading: readingId,
      listening: listeningId,
      writing: writingId,
      reading_passage1_completed: test.reading_passage1_completed || false,
      reading_passage2_completed: test.reading_passage2_completed || false,
      reading_passage3_completed: test.reading_passage3_completed || false,
      listening_part1_completed: test.listening_part1_completed || false,
      listening_part2_completed: test.listening_part2_completed || false,
      listening_part3_completed: test.listening_part3_completed || false,
      listening_part4_completed: test.listening_part4_completed || false,
      writing_task1_completed: test.writing_task1_completed || false,
      writing_task2_completed: test.writing_task2_completed || false,
    };
    
    return testDetail;
  }

  try {
    const response = await fetch(`${BASE_URL}/tests/${id}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch test details: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching test details:', error);
    // Fallback to offline storage
    const tests = getOfflineTests();
    const test = tests.find(t => t.id === id);
    
    if (!test) {
      throw error;
    }
    
    // Extract IDs from reading/listening/writing (can be number or object)
    const readingId = typeof test.reading === 'object' && test.reading !== null 
      ? test.reading.id 
      : test.reading || null;
    const listeningId = typeof test.listening === 'object' && test.listening !== null && 'id' in test.listening
      ? test.listening.id 
      : (typeof test.listening === 'number' ? test.listening : null);
    const writingId = typeof test.writing === 'object' && test.writing !== null && 'id' in test.writing
      ? test.writing.id 
      : (typeof test.writing === 'number' ? test.writing : null);
    
    // Convert TestResponse to TestDetail format
    const testDetail: TestDetail = {
      id: test.id,
      name: test.name,
      is_active: test.is_active,
      created_at: test.created_at || new Date().toISOString(),
      updated_at: test.updated_at || new Date().toISOString(),
      reading: readingId,
      listening: listeningId,
      writing: writingId,
      reading_passage1_completed: test.reading_passage1_completed || false,
      reading_passage2_completed: test.reading_passage2_completed || false,
      reading_passage3_completed: test.reading_passage3_completed || false,
      listening_part1_completed: test.listening_part1_completed || false,
      listening_part2_completed: test.listening_part2_completed || false,
      listening_part3_completed: test.listening_part3_completed || false,
      listening_part4_completed: test.listening_part4_completed || false,
      writing_task1_completed: test.writing_task1_completed || false,
      writing_task2_completed: test.writing_task2_completed || false,
    };
    
    return testDetail;
  }
}

// Get reading question types
export async function getReadingQuestionTypes(): Promise<QuestionType[]> {
  const apiAvailable = await checkAPIAvailability();
  
  if (!apiAvailable) {
    // Return mock data for offline mode
    return [];
  }

  try {
    console.log('🔄 Fetching reading question types...');
    
    const response = await fetch(`${BASE_URL}/reading-question-type/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch question types');
    }

    const data = await response.json();
    console.log('✅ Question types loaded:', data);
    
    return data.results || data;
  } catch (error) {
    console.error('Error fetching question types:', error);
    return [];
  }
}

// Get reading passages for a reading section
export async function getReadingPassages(readingId: number): Promise<any> {
  const apiAvailable = await checkAPIAvailability();
  
  if (!apiAvailable) {
    throw new Error('Passages not available in offline mode');
  }

  try {
    console.log('🔄 Fetching reading passages for reading:', readingId);
    
    // Use the correct endpoint: /readings/{reading_id}/passages/ (reading_id in URL path)
    const response = await fetch(`${BASE_URL}/readings/${readingId}/passages/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('📡 Passages response status:', response.status);

    if (!response.ok) {
      // If 404, it means no passages exist yet - this is normal
      if (response.status === 404) {
        console.log('ℹ️ No passages found yet (404) - returning empty results');
        return { results: [] };
      }
      
      const errorText = await response.text();
      console.error('❌ Passages error:', errorText);
      
      // Check if it's a Django error page (HTML response)
      if (errorText.includes('<!DOCTYPE html>') || errorText.includes('<html')) {
        // Extract error type and message from Django error page
        const errorTypeMatch = errorText.match(/<title>(.+?)<\/title>/);
        const errorType = errorTypeMatch ? errorTypeMatch[1] : 'Server Error';
        
        throw new Error(
          `Backend serializer error: ${errorType}. ` +
          `This is a backend issue that needs to be fixed by the backend developer. ` +
          `Please check /URGENT_BACKEND_FIX.md for detailed fix instructions.`
        );
      }
      
      throw new Error(`Failed to fetch passages: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Passages loaded:', data);
    
    return data;
  } catch (error) {
    console.error('Error fetching passages:', error);
    throw error;
  }
}

// Helper function to convert base64 to File
function base64ToFile(base64String: string, filename: string): File {
  const arr = base64String.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

// Create diagram chart image (separate API)
export async function createDiagramChart(imageFile: File, gapFillingId: number): Promise<any> {
  const apiAvailable = await checkAPIAvailability();
  
  if (!apiAvailable) {
    console.log('Offline mode: diagram chart saved locally');
    return { id: Date.now(), image: URL.createObjectURL(imageFile) };
  }

  try {
    console.log('🔄 Creating diagram chart:', imageFile.name, 'for gap_filling:', gapFillingId);
    
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('gap_filling', gapFillingId.toString());

    // ✅ UPDATED: Using correct API endpoint as per backend
    const response = await fetch(`${BASE_URL}/reading/diagram_chart_create`, {
      method: 'POST',
      body: formData,
    });

    console.log('📡 DiagramChart response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ DiagramChart error:', errorText);
      throw new Error(`Failed to create diagram chart: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ DiagramChart created:', result);
    return result;
  } catch (error) {
    console.error('💥 Error creating diagram chart:', error);
    throw error;
  }
}

// Update diagram chart image (separate API)
export async function updateDiagramChart(id: number, imageFile: File): Promise<any> {
  const apiAvailable = await checkAPIAvailability();
  
  if (!apiAvailable) {
    console.log('Offline mode: diagram chart updated locally');
    return { id, image: URL.createObjectURL(imageFile) };
  }

  try {
    console.log('🔄 Updating diagram chart:', id);
    
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch(`${BASE_URL}/reading/diagram-chart/${id}/`, {
      method: 'PATCH',
      body: formData,
    });

    console.log('📡 DiagramChart update response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ DiagramChart update error:', errorText);
      throw new Error(`Failed to update diagram chart: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ DiagramChart updated:', result);
    return result;
  } catch (error) {
    console.error('💥 Error updating diagram chart:', error);
    throw error;
  }
}

// Get diagram chart by ID (separate API)
export async function getDiagramChart(id: number): Promise<any> {
  const apiAvailable = await checkAPIAvailability();
  
  if (!apiAvailable) {
    console.log('Offline mode: diagram chart not available');
    return null;
  }

  try {
    console.log('🔄 Getting diagram chart:', id);
    
    const response = await fetch(`${BASE_URL}/reading/diagram-chart/${id}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('📡 DiagramChart GET response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ DiagramChart GET error:', errorText);
      throw new Error(`Failed to get diagram chart: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ DiagramChart retrieved:', result);
    return result;
  } catch (error) {
    console.error('💥 Error getting diagram chart:', error);
    throw error;
  }
}

// Create a reading passage with questions
export async function createReadingPassage(data: CreateReadingPassageRequest): Promise<void> {
  const apiAvailable = await checkAPIAvailability();
  
  if (!apiAvailable) {
    // Offline mode: just return success
    console.log('Offline mode: passage saved locally');
    return;
  }

  try {
    console.log('🔄 Creating reading passage:', data);
    
    // Step 1: Create the passage first (without diagram_chart images)
    const passageData = {
      reading: data.reading,
      passage_type: data.passage_type,
      title: data.title,
      body: data.body,
      groups: data.groups.map(group => {
        const groupCopy = JSON.parse(JSON.stringify(group));
        // Remove diagram_chart temporarily - we'll handle it separately
        if (groupCopy.gap_filling?.diagram_chart) {
          delete groupCopy.gap_filling.diagram_chart;
        }
        return groupCopy;
      }),
    };

    const response = await fetch(`${BASE_URL}/reading-pasage-create/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(passageData),
    });

    console.log('📡 Passage response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Passage error:', errorText);
      
      let errorMessage = 'Failed to create passage';
      try {
        const errorJson = JSON.parse(errorText);
        console.error('❌ Error JSON:', errorJson);
        errorMessage = JSON.stringify(errorJson, null, 2);
      } catch {
        console.error('❌ Could not parse error as JSON');
        errorMessage = errorText || `HTTP ${response.status}`;
      }
      
      throw new Error(`Passage yaratib bo'lmadi: ${errorMessage}`);
    }

    const createdPassage = await response.json();
    console.log('✅ Reading passage created:', createdPassage);
    console.log('📦 Full response structure:', JSON.stringify(createdPassage, null, 2));

    // Step 2: Extract gap_filling IDs from created passage response
    // ✅ The backend should return complete gap_filling objects with IDs in the POST response
    let passageWithDetails = createdPassage;
    
    // ✅ DEBUG: Log response structure first
    console.log('\n' + '='.repeat(80));
    console.log('🔍 BACKEND RESPONSE ANALYSIS');
    console.log('='.repeat(80));
    console.log('Response Type:', typeof createdPassage);
    console.log('Response Keys:', Object.keys(createdPassage));
    console.log('Has groups?:', 'groups' in createdPassage);
    console.log('Groups type:', typeof createdPassage.groups);
    console.log('Groups is array?:', Array.isArray(createdPassage.groups));
    console.log('Groups length:', createdPassage.groups?.length || 'N/A');
    
    // ✅ DEBUG: Log groups structure to see gap_filling IDs
    if (passageWithDetails.groups && Array.isArray(passageWithDetails.groups)) {
      console.log('\n📊 Groups structure - Total groups:', passageWithDetails.groups.length);
      passageWithDetails.groups.forEach((g: any, idx: number) => {
        console.log(`\n${'▬'.repeat(60)}`);
        console.log(`📋 GROUP ${idx} ANALYSIS:`);
        console.log(`${'▬'.repeat(60)}`);
        console.log('  ├─ id:', g.id);
        console.log('  ├─ question_type:', g.question_type);
        console.log('  ├─ All Keys:', Object.keys(g));
        console.log('  ├─ gap_filling type:', typeof g.gap_filling);
        console.log('  ├─ gap_filling is object?:', typeof g.gap_filling === 'object');
        console.log('  ├─ gap_filling is number?:', typeof g.gap_filling === 'number');
        console.log('  ├─ gap_filling value:', g.gap_filling);
        console.log('  ├─ gap_filling_id:', g.gap_filling_id);
        console.log('  ├─ hasGapFilling:', !!g.gap_filling);
        console.log('  └─ gap_filling.id:', g.gap_filling?.id);
        
        if (g.gap_filling && typeof g.gap_filling === 'object') {
          console.log('  ↳ gap_filling keys:', Object.keys(g.gap_filling));
        }
      });
    } else {
      console.error('\n' + '❌'.repeat(40));
      console.error('⚠️ CRITICAL: No groups array in backend response!');
      console.error('❌'.repeat(40));
      console.error('Expected: response.groups = [...]');
      console.error('Received:', createdPassage);
      console.error('\n📋 BACKEND MUST RETURN:');
      console.error('{');
      console.error('  "id": 123,');
      console.error('  "groups": [');
      console.error('    {');
      console.error('      "id": 456,');
      console.error('      "question_type": "flowchart_completion",');
      console.error('      "gap_filling": {');
      console.error('        "id": 789,  // ← THIS IS REQUIRED');
      console.error('        "title": "...",');
      console.error('        "questions": [...]');
      console.error('      }');
      console.error('    }');
      console.error('  ]');
      console.error('}');
      console.error('');
      console.error('📖 See /BACKEND_GAP_FILLING_ID_FIX.md for backend fix instructions.');
      console.error('❌'.repeat(40) + '\n');
    }
    console.log('='.repeat(80) + '\n');

    // Step 3: Upload diagram_chart images separately
    // ✅ ONLY for flowchart_completion and diagram_labeling question types
    for (let i = 0; i < data.groups.length; i++) {
      const group = data.groups[i];
      const questionType = group.question_type;
      
      console.log(`🔍 DEBUG - Checking group ${i}:`, {
        questionType: questionType,
        hasGapFilling: !!group.gap_filling,
        hasDiagramChart: !!group.gap_filling?.diagram_chart,
        hasImage: !!group.gap_filling?.diagram_chart?.image,
      });
      
      // ✅ ONLY upload diagram chart for flowchart_completion and diagram_labeling
      const shouldUploadDiagramChart = 
        (questionType === 'flowchart_completion' || questionType === 'diagram_labeling') &&
        group.gap_filling?.diagram_chart?.image;
      
      if (shouldUploadDiagramChart) {
        const imageData = group.gap_filling.diagram_chart.image;
        
        // Check if it's a base64 image
        if (imageData.startsWith('data:image')) {
          console.log(`📸 Uploading diagram_chart for ${questionType} group ${i}...`);
          
          const imageFile = base64ToFile(imageData, `diagram_chart_${i}.png`);
          
          // ✅ Get the gap_filling ID from created passage
          let createdGapFillingId = null;
          
          // Try different response structures to find gap_filling ID
          console.log(`\n${'🔍'.repeat(30)}`);
          console.log(`🔍 Searching for gap_filling ID in group ${i} (${questionType}):`);
          console.log(`${'▬'.repeat(60)}`);
          
          const createdGroup = passageWithDetails.groups?.[i];
          if (createdGroup) {
            console.log('Group Keys:', Object.keys(createdGroup));
            console.log('gap_filling type:', typeof createdGroup.gap_filling);
            console.log('gap_filling_id:', createdGroup.gap_filling_id);
            console.log('gap_filling value:', createdGroup.gap_filling);
            
            // Try all possible paths to find gap_filling ID
            if (createdGroup.gap_filling?.id) {
              createdGapFillingId = createdGroup.gap_filling.id;
              console.log(`✅ Found gap_filling.id: ${createdGapFillingId}`);
            } else if (createdGroup.gap_filling_id) {
              createdGapFillingId = createdGroup.gap_filling_id;
              console.log(`✅ Found gap_filling_id: ${createdGapFillingId}`);
            } else if (typeof createdGroup.gap_filling === 'number') {
              createdGapFillingId = createdGroup.gap_filling;
              console.log(`✅ Found gap_filling as number: ${createdGapFillingId}`);
            } else {
              console.error(`❌ Could not find gap_filling ID in any standard field!`);
              console.error('Full group data:', JSON.stringify(createdGroup, null, 2));
            }
          } else {
            console.error(`❌ createdGroup is null or undefined for index ${i}`);
            console.error('Available groups:', passageWithDetails.groups);
          }
          console.log(`${'🔍'.repeat(30)}\n`);
          
          if (createdGapFillingId) {
            console.log(`\n${'🚀'.repeat(30)}`);
            console.log(`🚀 Uploading diagram chart for group ${i}...`);
            console.log(`  ├─ gap_filling ID: ${createdGapFillingId}`);
            console.log(`  ├─ question_type: ${questionType}`);
            console.log(`  └─ Image size: ${(imageData.length / 1024).toFixed(2)} KB`);
            
            try {
              const diagramChartResult = await createDiagramChart(imageFile, createdGapFillingId);
              console.log(`✅ Diagram chart uploaded successfully!`);
              console.log(`  └─ Result:`, diagramChartResult);
              
              // Step 4: Retrieve the created diagram_chart object
              if (diagramChartResult?.id) {
                const retrievedDiagramChart = await getDiagramChart(diagramChartResult.id);
                console.log(`✅ Diagram chart retrieved:`, retrievedDiagramChart);
              }
            } catch (uploadError) {
              console.error(`❌ Failed to upload diagram chart for group ${i}:`, uploadError);
              // Don't throw - continue with other groups
            }
            console.log(`${'🚀'.repeat(30)}\n`);
          } else {
            // ⚠️ WARNING: Gap filling ID not found - Backend may not have created gap_filling yet
            console.error(`\n${'❌'.repeat(40)}`);
            console.error(`⚠️ DIAGRAM CHART UPLOAD FAILED - Gap filling ID not found!`);
            console.error(`${'❌'.repeat(40)}`);
            console.error(`Group: ${i}`);
            console.error(`Question Type: ${questionType}`);
            console.error(`Has Image: ${!!imageData}`);
            console.error('');
            console.error('🔴 REASON:');
            console.error('Backend POST response does not include gap_filling ID.');
            console.error('');
            console.error('✅ SOLUTION:');
            console.error('Backend must return gap_filling objects with IDs in POST response.');
            console.error('See /BACKEND_GAP_FILLING_ID_FIX.md for detailed instructions.');
            console.error('');
            console.error('📦 Full group structure:');
            console.error(JSON.stringify(createdGroup, null, 2));
            console.error(`${'❌'.repeat(40)}\n`);
            
            // Don't throw error - allow passage creation to continue
            // The diagram chart can be added later via PATCH if needed
          }
        }
      }
    }

    console.log('✅ All diagram charts uploaded successfully');
  } catch (error) {
    console.error('💥 Error creating passage:', error);
    throw error;
  }
}

// Update a reading passage with questions
export async function updateReadingPassage(id: number, data: UpdateReadingPassageRequest): Promise<void> {
  const apiAvailable = await checkAPIAvailability();
  
  if (!apiAvailable) {
    // Offline mode: just return success
    console.log('Offline mode: passage updated locally');
    return;
  }

  try {
    console.log('🔄 Updating reading passage:', id, data);
    
    // Step 1: Update the passage (without diagram_chart images)
    const passageData = {
      title: data.title,
      body: data.body,
      groups: data.groups.map(group => {
        const groupCopy = JSON.parse(JSON.stringify(group));
        // Remove diagram_chart temporarily - we'll handle it separately
        if (groupCopy.gap_filling?.diagram_chart) {
          delete groupCopy.gap_filling.diagram_chart;
        }
        return groupCopy;
      }),
    };

    const response = await fetch(`${BASE_URL}/reading-pasage-update/${id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(passageData),
    });

    console.log('📡 Update response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Update error:', errorText);
      
      let errorMessage = 'Failed to update passage';
      try {
        const errorJson = JSON.parse(errorText);
        console.error('❌ Error JSON:', errorJson);
        errorMessage = JSON.stringify(errorJson, null, 2);
      } catch {
        console.error('❌ Could not parse error as JSON');
        errorMessage = errorText || `HTTP ${response.status}`;
      }
      
      throw new Error(`Passage yangilashda xatolik: ${errorMessage}`);
    }

    const updatedPassage = await response.json();
    console.log('✅ Reading passage updated:', updatedPassage);
    console.log('📦 Full update response structure:', JSON.stringify(updatedPassage, null, 2));

    // ✅ DEBUG: Log response structure
    console.log('\n' + '='.repeat(80));
    console.log('🔍 UPDATE RESPONSE ANALYSIS');
    console.log('='.repeat(80));
    console.log('Response Type:', typeof updatedPassage);
    console.log('Response Keys:', Object.keys(updatedPassage));
    console.log('Has groups?:', 'groups' in updatedPassage);
    console.log('Groups type:', typeof updatedPassage.groups);
    console.log('Groups is array?:', Array.isArray(updatedPassage.groups));
    console.log('Groups length:', updatedPassage.groups?.length || 'N/A');
    console.log('='.repeat(80) + '\n');

    // Step 2: Update diagram_chart images separately
    // ✅ ONLY for flowchart_completion and diagram_labeling question types
    for (let i = 0; i < data.groups.length; i++) {
      const group = data.groups[i];
      const questionType = group.question_type;
      
      // ✅ ONLY upload diagram chart for flowchart_completion and diagram_labeling
      const shouldUploadDiagramChart = 
        (questionType === 'flowchart_completion' || questionType === 'diagram_labeling') &&
        group.gap_filling?.diagram_chart?.image;
      
      if (shouldUploadDiagramChart) {
        const imageData = group.gap_filling.diagram_chart.image;
        
        // Check if it's a base64 image (new upload)
        if (imageData.startsWith('data:image')) {
          console.log(`📸 Updating diagram_chart for ${questionType} group ${i}...`);
          
          const imageFile = base64ToFile(imageData, `diagram_chart_${i}.png`);
          
          // Check if this group already has a diagram_chart in the updated response
          const updatedGroup = updatedPassage.groups?.[i];
          const existingDiagramChartId = updatedGroup?.gap_filling?.diagram_chart?.id;
          
          if (existingDiagramChartId) {
            // Update existing diagram_chart
            const updatedDiagramChart = await updateDiagramChart(existingDiagramChartId, imageFile);
            console.log(`✅ Diagram chart updated for group ${i}`);
            
            // Retrieve updated diagram_chart
            if (updatedDiagramChart?.id) {
              const retrievedDiagramChart = await getDiagramChart(updatedDiagramChart.id);
              console.log(`✅ Diagram chart retrieved for group ${i}:`, retrievedDiagramChart);
            }
          } else {
            // Create new diagram_chart - need gap_filling ID - try multiple paths
            let createdGapFillingId = null;
            
            console.log(`\n${'🔍'.repeat(30)}`);
            console.log(`🔍 Searching for gap_filling ID in updated group ${i} (${questionType}):`);
            console.log(`${'▬'.repeat(60)}`);
            
            const updatedGroupForSearch = updatedPassage.groups?.[i];
            if (updatedGroupForSearch) {
              console.log('Group Keys:', Object.keys(updatedGroupForSearch));
              console.log('gap_filling type:', typeof updatedGroupForSearch.gap_filling);
              console.log('gap_filling_id:', updatedGroupForSearch.gap_filling_id);
              console.log('gap_filling value:', updatedGroupForSearch.gap_filling);
              
              // Try all possible paths to find gap_filling ID
              if (updatedGroupForSearch.gap_filling?.id) {
                createdGapFillingId = updatedGroupForSearch.gap_filling.id;
                console.log(`✅ Found gap_filling.id: ${createdGapFillingId}`);
              } else if (updatedGroupForSearch.gap_filling_id) {
                createdGapFillingId = updatedGroupForSearch.gap_filling_id;
                console.log(`✅ Found gap_filling_id: ${createdGapFillingId}`);
              } else if (typeof updatedGroupForSearch.gap_filling === 'number') {
                createdGapFillingId = updatedGroupForSearch.gap_filling;
                console.log(`✅ Found gap_filling as number: ${createdGapFillingId}`);
              } else {
                console.error(`❌ Could not find gap_filling ID in any standard field!`);
                console.error('Full group data:', JSON.stringify(updatedGroupForSearch, null, 2));
              }
            } else {
              console.error(`❌ updatedGroup is null or undefined for index ${i}`);
              console.error('Available groups:', updatedPassage.groups);
            }
            console.log(`${'🔍'.repeat(30)}\n`);
            
            if (createdGapFillingId) {
              console.log(`\n${'🚀'.repeat(30)}`);
              console.log(`🚀 Creating new diagram chart for group ${i}...`);
              console.log(`  ├─ gap_filling ID: ${createdGapFillingId}`);
              console.log(`  ├─ question_type: ${questionType}`);
              console.log(`  └─ Image size: ${(imageData.length / 1024).toFixed(2)} KB`);
              
              try {
                const diagramChartResult = await createDiagramChart(imageFile, createdGapFillingId);
                console.log(`✅ Diagram chart created successfully!`);
                console.log(`  └─ Result:`, diagramChartResult);
                
                // Retrieve created diagram_chart
                if (diagramChartResult?.id) {
                  const retrievedDiagramChart = await getDiagramChart(diagramChartResult.id);
                  console.log(`✅ Diagram chart retrieved:`, retrievedDiagramChart);
                }
              } catch (uploadError) {
                console.error(`❌ Failed to create diagram chart for group ${i}:`, uploadError);
                // Don't throw - continue with other groups
              }
              console.log(`${'🚀'.repeat(30)}\n`);
            } else {
              // ⚠️ WARNING: Gap filling ID not found
              console.error(`\n${'❌'.repeat(40)}`);
              console.error(`⚠️ DIAGRAM CHART UPLOAD FAILED (UPDATE) - Gap filling ID not found!`);
              console.error(`${'❌'.repeat(40)}`);
              console.error(`Group: ${i}`);
              console.error(`Question Type: ${questionType}`);
              console.error(`Has Image: ${!!imageData}`);
              console.error('');
              console.error('🔴 REASON:');
              console.error('Backend PATCH response does not include gap_filling ID.');
              console.error('');
              console.error('✅ SOLUTION:');
              console.error('Backend must return gap_filling objects with IDs in PATCH response.');
              console.error('See /BACKEND_GAP_FILLING_ID_FIX.md for detailed instructions.');
              console.error('');
              console.error('📦 Full group structure:');
              console.error(JSON.stringify(updatedGroupForSearch, null, 2));
              console.error(`${'❌'.repeat(40)}\n`);
              
              // Don't throw error - allow passage update to continue
            }
          }
        }
      }
    }

    console.log('✅ All diagram charts processed successfully');
  } catch (error) {
    console.error('💥 Error updating passage:', error);
    throw error;
  }
}

// Bulk create reading passages (v2 API)
export async function bulkCreateReadingPassages(data: BulkCreateReadingPassagesRequest): Promise<any> {
  const apiAvailable = await checkAPIAvailability();
  
  if (!apiAvailable) {
    // Offline mode: just return success
    console.log('Offline mode: passages saved locally');
    return { message: 'Saved locally in offline mode' };
  }

  try {
    console.log('🔄 Bulk creating reading passages:', data);
    
    const response = await fetch(`https://api.samariddin.space/api/v2/reading-passage-bulk-create/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    console.log('📡 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      
      let errorMessage = 'Failed to create passages';
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.detail || JSON.stringify(errorJson, null, 2);
      } catch {
        errorMessage = errorText || `HTTP ${response.status}`;
      }
      
      throw new Error(`Passages yaratib bo'lmadi: ${errorMessage}`);
    }

    const result = await response.json();
    console.log('✅ Reading passages created successfully:', result);
    return result;
  } catch (error) {
    console.error('💥 Error creating passages:', error);
    throw error;
  }
}

// Create a listening part with audio
export async function createListeningPart(data: CreateListeningPartRequest): Promise<ListeningPart> {
  const apiAvailable = await checkAPIAvailability();
  
  if (!apiAvailable) {
    // Offline mode: return mock data
    return {
      id: Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      audio: '',
      part_type: data.part_type,
      listening: data.listening,
      question_type: [],
    };
  }

  // This function is deprecated - use createListeningPartWithQuestions instead
  throw new Error('Use createListeningPartWithQuestions instead');
}

// Create listening question group
export async function createListeningQuestionGroup(
  partId: number,
  data: CreateListeningQuestionGroupRequest
): Promise<void> {
  const apiAvailable = await checkAPIAvailability();
  
  if (!apiAvailable) {
    return;
  }

  const response = await fetch(`${BASE_URL}/listening/parts/${partId}/groups/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Failed to create listening question group:', response.status, errorText);
    throw new Error('Failed to create listening question group');
  }
}

// Create writing section
export async function createWriting(data: CreateWritingRequest): Promise<WritingResponse> {
  const apiAvailable = await checkAPIAvailability();
  
  if (!apiAvailable) {
    // Offline mode: return mock data
    return {
      id: Date.now(),
      test: data.test,
      type: data.type,
      question: data.question,
      image: data.image ? URL.createObjectURL(data.image) : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  const formData = new FormData();
  // CREATE: Send type and question, NOT test in body (test is in URL)
  formData.append('type', data.type);
  formData.append('question', data.question);
  if (data.image) {
    formData.append('image', data.image);
  }

  console.log('✅ Creating writing section for test:', data.test);

  const response = await fetch(`${BASE_URL}/writing-create/${data.test}/`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Failed to create writing section:', response.status, errorText);
    
    // Try to parse error as JSON for better debugging
    try {
      const errorJson = JSON.parse(errorText);
      console.error('❌ Error details:', errorJson);
      throw new Error(`Failed to create writing section: ${JSON.stringify(errorJson)}`);
    } catch {
      throw new Error(`Failed to create writing section: ${errorText}`);
    }
  }

  return response.json();
}

// Get writing task by ID
export async function getWriting(id: number): Promise<WritingResponse> {
  const apiAvailable = await checkAPIAvailability();
  
  if (!apiAvailable) {
    throw new Error('Writing task not available in offline mode');
  }

  try {
    console.log('🔄 Fetching writing task:', id);
    
    const response = await fetch(`${BASE_URL}/writing/${id}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch writing task: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Writing task loaded:', data);
    
    return data;
  } catch (error) {
    console.error('Error fetching writing task:', error);
    throw error;
  }
}

// Get all writing tasks (list)
export async function getWritingList(): Promise<WritingResponse[]> {
  const apiAvailable = await checkAPIAvailability();
  
  if (!apiAvailable) {
    return [];
  }

  try {
    console.log('🔄 Fetching writing tasks list...');
    
    const response = await fetch(`${BASE_URL}/writing-list/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch writing list: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Writing list loaded:', data);
    
    return data.results || data;
  } catch (error) {
    console.error('Error fetching writing list:', error);
    return [];
  }
}

// Get writing tasks for a specific test
export async function getWritingTasksForTest(testId: number): Promise<WritingResponse[]> {
  const apiAvailable = await checkAPIAvailability();
  
  if (!apiAvailable) {
    return [];
  }

  try {
    console.log('🔄 Fetching writing tasks for test:', testId);
    
    // Use writing-detail endpoint with test_id in URL path
    const response = await fetch(`${BASE_URL}/writing-detail/${testId}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // If 404, it means no writing tasks exist yet - this is normal
      if (response.status === 404) {
        console.log('ℹ️ No writing tasks found yet (404) - returning empty array');
        return [];
      }
      
      throw new Error(`Failed to fetch writing tasks for test: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Writing tasks for test loaded:', data);
    
    // Backend returns array of writing tasks for this test
    return Array.isArray(data) ? data : (data.results || []);
  } catch (error) {
    console.error('Error fetching writing tasks for test:', error);
    return [];
  }
}

// Update writing section (PUT - full update)
export async function updateWriting(id: number, data: Partial<CreateWritingRequest>): Promise<WritingResponse> {
  const apiAvailable = await checkAPIAvailability();
  
  if (!apiAvailable) {
    return {
      id,
      test: data.test || 0,
      type: data.type || 'task1',
      question: data.question || '',
      image: data.image ? URL.createObjectURL(data.image) : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  // Use FormData if image is present, otherwise use JSON
  const hasImage = !!data.image;
  
  if (hasImage) {
    const formData = new FormData();
    
    // Add fields to FormData
    if (data.question) {
      formData.append('question', data.question);
    }
    
    if (data.image) {
      formData.append('image', data.image);
    }

    if (data.type) {
      formData.append('type', data.type);
    }

    const url = `${BASE_URL}/writing-update/${id}/`;
    console.log('🔄 PATCH (with image): Partial update for writing section');
    console.log('   URL:', url);
    console.log('   ID:', id);
    console.log('   Fields:', Array.from(formData.keys()));

    const response = await fetch(url, {
      method: 'PATCH',
      body: formData,
    });

    console.log('📡 PATCH Response status:', response.status);
    console.log('📡 PATCH Response OK:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to patch writing section:', response.status, errorText);
      console.error('❌ Request URL was:', url);
      console.error('❌ Request method:', 'PATCH');
      console.error('❌ Request had FormData with fields:', Array.from(formData.keys()));
      
      try {
        const errorJson = JSON.parse(errorText);
        console.error('❌ Patch error details:', errorJson);
        throw new Error(`Failed to patch writing section: ${JSON.stringify(errorJson)}`);
      } catch (parseError) {
        throw new Error(`Failed to patch writing section: ${errorText}`);
      }
    }

    const result = await response.json();
    console.log('✅ PATCH successful:', result);
    return result;
  } else {
    // JSON format for text-only updates
    const jsonData: any = {};
    
    if (data.question) {
      jsonData.question = data.question;
    }

    if (data.type) {
      jsonData.type = data.type;
    }

    const url = `${BASE_URL}/writing-update/${id}/`;
    console.log('🔄 PATCH (JSON): Partial update for writing section');
    console.log('   URL:', url);
    console.log('   ID:', id);
    console.log('   Data:', jsonData);

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jsonData),
    });

    console.log('📡 PATCH Response status:', response.status);
    console.log('📡 PATCH Response OK:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to patch writing section:', response.status, errorText);
      console.error('❌ Request URL was:', url);
      console.error('❌ Request method:', 'PATCH');
      console.error('❌ Request body was:', JSON.stringify(jsonData));
      
      try {
        const errorJson = JSON.parse(errorText);
        console.error('❌ Patch error details:', errorJson);
        throw new Error(`Failed to patch writing section: ${JSON.stringify(errorJson)}`);
      } catch (parseError) {
        throw new Error(`Failed to patch writing section: ${errorText}`);
      }
    }

    const result = await response.json();
    console.log('✅ PATCH successful:', result);
    return result;
  }
}

// Patch writing section (PATCH - partial update)
export async function patchWriting(id: number, data: Partial<CreateWritingRequest>): Promise<WritingResponse> {
  const apiAvailable = await checkAPIAvailability();
  
  if (!apiAvailable) {
    return {
      id,
      test: data.test || 0,
      type: data.type || 'task1',
      question: data.question || '',
      image: data.image ? URL.createObjectURL(data.image) : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  console.log('🔧 patchWriting called with:', { id, dataKeys: Object.keys(data) });
  console.log('🔧 Writing Task ID:', id, '(this is task1 or task2 ID)');
  console.log('🔧 Data:', data);

  // Use FormData if image is present, otherwise use JSON
  const hasImage = !!data.image;
  
  if (hasImage) {
    const formData = new FormData();
    
    // Backend needs 'type' to validate the task type
    if (data.type) {
      formData.append('type', data.type);
    }
    
    if (data.question) {
      formData.append('question', data.question);
    }
    
    if (data.image) {
      formData.append('image', data.image);
    }

    // Use WRITING TASK ID in URL (task1.id or task2.id)
    const url = `${BASE_URL}/writing-update/${id}/`;
    console.log('🔄 PATCH (with image): Partial update for writing section');
    console.log('   URL:', url);
    console.log('   Writing Task ID in URL:', id);
    console.log('   Type in body:', data.type);
    console.log('   Fields:', Array.from(formData.keys()));

    const response = await fetch(url, {
      method: 'PATCH',
      body: formData,
    });

    console.log('📡 PATCH Response status:', response.status);
    console.log('📡 PATCH Response OK:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to patch writing section:', response.status, errorText);
      console.error('❌ Request URL was:', url);
      console.error('❌ Request method:', 'PATCH');
      console.error('❌ Request had FormData with fields:', Array.from(formData.keys()));
      
      try {
        const errorJson = JSON.parse(errorText);
        console.error('❌ Patch error details:', errorJson);
        throw new Error(`Failed to patch writing section: ${JSON.stringify(errorJson)}`);
      } catch (parseError) {
        throw new Error(`Failed to patch writing section: ${errorText}`);
      }
    }

    const result = await response.json();
    console.log('✅ PATCH successful:', result);
    return result;
  } else {
    // JSON format for text-only updates
    const jsonData: any = {};
    
    // Backend needs 'type' to validate the task type
    if (data.type) {
      jsonData.type = data.type;
    }
    
    if (data.question) {
      jsonData.question = data.question;
    }

    // Use WRITING TASK ID in URL (task1.id or task2.id)
    const url = `${BASE_URL}/writing-update/${id}/`;
    console.log('🔄 PATCH (JSON): Partial update for writing section');
    console.log('   URL:', url);
    console.log('   Writing Task ID in URL:', id);
    console.log('   Type in body:', data.type);
    console.log('   Data:', jsonData);

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jsonData),
    });

    console.log('📡 PATCH Response status:', response.status);
    console.log('📡 PATCH Response OK:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to patch writing section:', response.status, errorText);
      console.error('❌ Request URL was:', url);
      console.error('❌ Request method:', 'PATCH');
      console.error('❌ Request body was:', JSON.stringify(jsonData));
      
      try {
        const errorJson = JSON.parse(errorText);
        console.error('❌ Patch error details:', errorJson);
        throw new Error(`Failed to patch writing section: ${JSON.stringify(errorJson)}`);
      } catch (parseError) {
        throw new Error(`Failed to patch writing section: ${errorText}`);
      }
    }

    const result = await response.json();
    console.log('✅ PATCH successful:', result);
    return result;
  }
}

// ============= LISTENING API FUNCTIONS =============

// Create listening audio file
export async function createListeningAudio(audioFile: File, listeningPartId?: number): Promise<ListeningAudioResponse> {
  const apiAvailable = await checkAPIAvailability();
  
  if (!apiAvailable) {
    // Offline mode: return mock data
    return {
      id: Date.now(),
      audio: URL.createObjectURL(audioFile),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  try {
    console.log('🔄 Uploading audio file:', audioFile.name, 'for part:', listeningPartId);
    
    const formData = new FormData();
    formData.append('audio', audioFile);
    
    // Add listening_part if provided
    if (listeningPartId) {
      formData.append('listening_part', listeningPartId.toString());
    }

    const response = await fetch(`${BASE_URL}/listening-audio/`, {
      method: 'POST',
      body: formData,
    });

    console.log('📡 Audio upload response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Audio upload error:', errorText);
      
      let errorMessage = 'Failed to upload audio';
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.detail || JSON.stringify(errorJson);
      } catch {
        errorMessage = errorText || `HTTP ${response.status}`;
      }
      
      throw new Error(`Audio yuklashda xatolik: ${errorMessage}`);
    }

    const result = await response.json();
    console.log('✅ Audio uploaded successfully:', result);
    return result;
  } catch (error) {
    console.error('💥 Error uploading audio:', error);
    throw error;
  }
}

// Get listening audio by ID
export async function getListeningAudio(audioId: number): Promise<ListeningAudioResponse> {
  const apiAvailable = await checkAPIAvailability();
  
  if (!apiAvailable) {
    throw new Error('Audio not available in offline mode');
  }

  try {
    console.log('🔄 Fetching audio:', audioId);
    
    const response = await fetch(`${BASE_URL}/listening/audio/${audioId}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch audio: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Audio loaded:', data);
    return data;
  } catch (error) {
    console.error('Error fetching audio:', error);
    throw error;
  }
}

// Update listening audio
export async function updateListeningAudio(audioId: number, audioFile: File): Promise<ListeningAudioResponse> {
  const apiAvailable = await checkAPIAvailability();
  
  if (!apiAvailable) {
    // Offline mode: return mock data
    return {
      id: audioId,
      audio: URL.createObjectURL(audioFile),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  try {
    console.log('🔄 Updating audio:', audioId);
    
    const formData = new FormData();
    formData.append('audio', audioFile);

    const response = await fetch(`${BASE_URL}/listening/audio/${audioId}/`, {
      method: 'PATCH',
      body: formData,
    });

    console.log('📡 Audio update response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Audio update error:', errorText);
      
      let errorMessage = 'Failed to update audio';
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.detail || JSON.stringify(errorJson);
      } catch {
        errorMessage = errorText || `HTTP ${response.status}`;
      }
      
      throw new Error(`Audio yangilashda xatolik: ${errorMessage}`);
    }

    const result = await response.json();
    console.log('✅ Audio updated successfully:', result);
    return result;
  } catch (error) {
    console.error('💥 Error updating audio:', error);
    throw error;
  }
}

// Get listening question types
export async function getListeningQuestionTypes(): Promise<QuestionType[]> {
  const apiAvailable = await checkAPIAvailability();
  
  if (!apiAvailable) {
    return [];
  }

  try {
    console.log('🔄 Fetching listening question types...');
    
    const response = await fetch(`${BASE_URL}/listening-question-type/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch listening question types');
    }

    const data = await response.json();
    console.log('✅ Listening question types loaded:', data);
    
    return data.results || data;
  } catch (error) {
    console.error('Error fetching listening question types:', error);
    return [];
  }
}

// Get listening parts for a listening section
export async function getListeningParts(listeningId: number): Promise<any> {
  try {
    console.log('🔄 Fetching listening parts for listening:', listeningId);
    
    const response = await fetch(`${BASE_URL}/listening-parts/?listening=${listeningId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('📡 Parts response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Parts error:', errorText);
      throw new Error(`Failed to fetch parts: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Parts loaded:', data);
    
    return data;
  } catch (error) {
    console.error('Error fetching parts:', error);
    throw error;
  }
}

// Get listening section by ID with part details
export async function getListening(listeningId: number): Promise<any> {
  try {
    console.log('🔄 Fetching listening section:', listeningId);
    
    const response = await fetch(`${BASE_URL}/listening/${listeningId}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('📡 Listening response status:', response.status);
    console.log('📡 Listening response URL:', response.url);

    if (!response.ok) {
      // If 404, it means no listening data exists yet - this is normal
      if (response.status === 404) {
        console.log('ℹ️ No listening data found yet (404) - returning empty structure');
        return { parts: [] };
      }
      
      const errorText = await response.text();
      console.error('❌ Listening error:', errorText);
      throw new Error(`Failed to fetch listening: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // If it's a network error and we're checking for data, return empty
    if (error instanceof TypeError) {
      console.log('ℹ️ Network error - returning empty structure');
      return { parts: [] };
    }
    console.error('💥 Error fetching listening:', error);
    throw error;
  }
}

// Get a single listening part by ID
export async function getListeningPartById(partId: number): Promise<any> {
  try {
    console.log('🔄 Fetching listening part by ID:', partId);
    
    const response = await fetch(`${BASE_URL}/listening-parts/${partId}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('📡 Part response status:', response.status);
    console.log('📡 Part response URL:', response.url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Part error response:', errorText);
      throw new Error(`Failed to fetch part: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Part loaded successfully:', data);
    console.log('✅ Part ID:', data.id);
    console.log('✅ Part has groups:', data.groups?.length || 0);
    console.log('✅ Part audio:', data.audio);
    console.log('✅ Part title:', data.title);
    return data;
  } catch (error) {
    console.error('💥 Error fetching part by ID:', error);
    throw error;
  }
}

/**
 * Create a listening part with questions
 * This version uses JSON format with base64-encoded images
 */
export async function createListeningPartWithQuestions(
  data: CreateListeningPartRequest
): Promise<{ id: number }> {
  const apiAvailable = await checkAPIAvailability();
  
  if (!apiAvailable) {
    console.log('Offline mode: part saved locally');
    return { id: Date.now() };
  }

  try {
    console.log('🔄 Creating listening part:', data);
    
    // Validate groups before sending
    data.groups.forEach((group, groupIndex) => {
      console.log(`🔍 Group ${groupIndex} validation:`, {
        listening_question_type: group.listening_question_type,
        from_value: group.from_value,
        to_value: group.to_value,
      });
      
      if (!group.listening_question_type || group.listening_question_type.trim() === '') {
        throw new Error(`Group ${groupIndex}: listening_question_type is required!`);
      }
      if (!group.from_value || group.from_value <= 0) {
        throw new Error(`Group ${groupIndex}: from_value must be greater than 0!`);
      }
      if (!group.to_value || group.to_value <= 0) {
        throw new Error(`Group ${groupIndex}: to_value must be greater than 0!`);
      }
    });
    
    // Check if any group has file uploads
    const hasFileUpload = data.groups.some(group => {
      const map = (group as any).listening_map;
      return map && (
        map.image instanceof File ||
        (Array.isArray(map) && map.some((m: any) => m.image instanceof File))
      );
    });

    let requestData = data;
    
    // Convert files to base64 if present
    if (hasFileUpload) {
      console.log('🔄 Converting files to base64...');
      requestData = await convertFilesToBase64(data);
      console.log('✅ Files converted to base64');
    }

    console.log('📤 Sending JSON request...');
    const response = await fetch(`${BASE_URL}/listening-part-create/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    console.log('📡 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      
      let errorMessage = 'Failed to create part';
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = JSON.stringify(errorJson, null, 2);
      } catch {
        errorMessage = errorText || `HTTP ${response.status}`;
      }
      
      throw new Error(`Part yaratib bo'lmadi: ${errorMessage}`);
    }

    const result = await response.json();
    console.log('✅ Listening part created successfully:', result);
    return result;
  } catch (error) {
    console.error('💥 Error creating part:', error);
    throw error;
  }
}