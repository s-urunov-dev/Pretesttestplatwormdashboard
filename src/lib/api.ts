const BASE_URL = 'https://api.samariddin.space/api/v1';

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
}

export interface IdentifyInfoData {
  title: string;
  question: string[];
}

export interface MatchingItemData {
  title: string;
  statement: string[];
  option: string[];
  variant_type: VariantType;
  answer_count: number;
}

export interface QuestionGroup {
  question_type: string;
  from_value: number;
  to_value: number;
  gap_filling?: GapFillingData;
  identify_info?: IdentifyInfoData;
  matching_item?: MatchingItemData;
}

// Reading Passage Create Request
export interface CreateReadingPassageRequest {
  reading: number;
  passage_type: PassageType;
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

// ============= Additional API Functions =============

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
      const errorText = await response.text();
      console.error('❌ Passages error:', errorText);
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
    
    const response = await fetch(`${BASE_URL}/reading-pasage-create/`, {
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
      
      let errorMessage = 'Failed to create passage';
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = JSON.stringify(errorJson, null, 2);
      } catch {
        errorMessage = errorText || `HTTP ${response.status}`;
      }
      
      throw new Error(`Passage yaratib bo'lmadi: ${errorMessage}`);
    }

    console.log('✅ Reading passage created successfully');
  } catch (error) {
    console.error('💥 Error creating passage:', error);
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
      audio: URL.createObjectURL(data.audio),
      part_type: data.part_type,
      listening: data.listening,
      question_type: data.question_type,
    };
  }

  const formData = new FormData();
  formData.append('audio', data.audio);
  formData.append('part_type', data.part_type);
  formData.append('listening', data.listening.toString());
  data.question_type.forEach(qt => {
    formData.append('question_type', qt.toString());
  });

  const response = await fetch(`${BASE_URL}/listening-part-create/`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Failed to create listening part:', response.status, errorText);
    throw new Error('Failed to create listening part');
  }

  return response.json();
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
  audio: File;
  part_type: PartType;
  listening: number;
  question_type: number[];
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