import React from 'react';
import { TableCompletionDemo } from '../components/TableCompletionDemo';

/**
 * Demo Page for Table Completion Component
 * 
 * This page demonstrates how table_details JSON maps to cell indexes
 * in IELTS listening test table completion questions.
 */

export default function TableCompletionDemoPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-5xl mx-auto px-4">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="text-gray-900 mb-2">
            Table Completion – Index-based Structure
          </h1>
          <p className="text-gray-600">
            IELTS Listening Test • Admin Panel Design Reference
          </p>
        </div>

        {/* Main Demo */}
        <TableCompletionDemo
          instruction="Complete the table using ONE WORD only."
          principle="ONE_WORD"
          rowCount={4}
          columnHeaders={['Name', 'Time', 'Place']}
          highlightIndex={0}
        />

        {/* Documentation Section */}
        <div className="mt-12 p-6 bg-white rounded-lg shadow-sm">
          <h2 className="text-gray-800 mb-4">📚 How It Works</h2>
          
          <div className="space-y-4 text-gray-700">
            <div>
              <h3 className="text-gray-800 mb-2">1. Index System</h3>
              <p className="text-sm">
                Each cell in the table is assigned a unique index number, starting from 0.
                Indexes flow from left to right, top to bottom.
              </p>
              <div className="mt-2 p-3 bg-gray-50 rounded border border-gray-200">
                <code className="text-xs">
                  Row 1: [0, 1, 2] → Row 2: [3, 4, 5] → Row 3: [6, 7, 8] → Row 4: [9, 10, 11]
                </code>
              </div>
            </div>

            <div>
              <h3 className="text-gray-800 mb-2">2. JSON Structure</h3>
              <p className="text-sm">
                The <code className="px-1 py-0.5 bg-gray-100 rounded">table_details</code> JSON
                object uses these index numbers as keys to store cell values.
              </p>
            </div>

            <div>
              <h3 className="text-gray-800 mb-2">3. Student Interaction</h3>
              <p className="text-sm">
                Students fill in the dashed input fields. Their answers are mapped to the
                corresponding index in the backend for grading.
              </p>
            </div>

            <div>
              <h3 className="text-gray-800 mb-2">4. Principle Types</h3>
              <p className="text-sm mb-2">
                Common completion principles for IELTS listening:
              </p>
              <ul className="text-sm space-y-1 ml-4">
                <li>• <code className="px-1 py-0.5 bg-gray-100 rounded text-xs">ONE_WORD</code> - One word only</li>
                <li>• <code className="px-1 py-0.5 bg-gray-100 rounded text-xs">ONE_WORD_OR_NUMBER</code> - One word and/or a number</li>
                <li>• <code className="px-1 py-0.5 bg-gray-100 rounded text-xs">NMT_TWO</code> - No more than two words</li>
                <li>• <code className="px-1 py-0.5 bg-gray-100 rounded text-xs">NMT_THREE</code> - No more than three words</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Additional Examples */}
        <div className="mt-8 grid gap-8">
          {/* Example 2: Different size */}
          <div>
            <h2 className="text-gray-800 mb-4">Example 2: 3x2 Table</h2>
            <TableCompletionDemo
              instruction="Complete the table using NO MORE THAN TWO WORDS."
              principle="NMT_TWO"
              rowCount={3}
              columnHeaders={['Country', 'Population']}
              highlightIndex={2}
            />
          </div>

          {/* Example 3: Larger table */}
          <div>
            <h2 className="text-gray-800 mb-4">Example 3: 5x4 Table</h2>
            <TableCompletionDemo
              instruction="Complete the table using NO MORE THAN THREE WORDS AND/OR A NUMBER."
              principle="NMT_THREE_NUM"
              rowCount={5}
              columnHeaders={['Subject', 'Teacher', 'Room', 'Time']}
              highlightIndex={5}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
