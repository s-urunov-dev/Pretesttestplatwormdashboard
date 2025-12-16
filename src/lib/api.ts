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
export type VariantType = 'romain' | 'alphabet' | 'numeric';
export type CriteriaType = 'ONE_WORD' | 'TWO_WORDS' | 'THREE_WORDS' | 'NO_MORE_THREE_WORDS';

// Question Types from backend
export interface QuestionType {
  id: number;
  type: string;
}

// Question Group structures
export interface GapFillingData {
  title: string;
  criteria: CriteriaType;
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

export interface TestDetail {
  id: number;
  name: string;
  is_active: boolean;
  reading: ReadingSection;
  listening: ListeningSection;
  writing: WritingSection;
}

export interface TestResponse {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
  is_active: boolean;
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
    
    // Backend expects test_id not test
    const response = await fetch(`${BASE_URL}/listening-create/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        test_id: testId  // Changed from 'test' to 'test_id'
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
    // Offline mode: return mock detailed test
    throw new Error('Test details not available in offline mode');
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
    throw error;
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