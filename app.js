const SUPABASE_URL = 'https://ogbnpsxepwmmhreqrksp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nYm5wc3hlcHdtbWhyZXFya3NwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMDQxODQsImV4cCI6MjA4ODg4MDE4NH0.dWIpa7mwSHHPDtDxyM8ATM5MYb_jmSCFiEjyHUtbr9M';
const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const gradeForm = document.getElementById('grade-form');
const averageDisplay = document.getElementById('average-display');
const statusMessage = document.getElementById('status-message');
const submitButton = document.getElementById('submit-button');
const saveSubjectsButton = document.getElementById('save-subjects-button');
const phase1Subjects = document.getElementById('phase1-subjects');
const phase2Grades = document.getElementById('phase2-grades');

let savedSubjectNames = [];

function setStatus(message, type = 'info') {
  statusMessage.textContent = message;

  const baseClasses = 'text-center text-sm';
  statusMessage.className = baseClasses;

  if (type === 'success') {
    statusMessage.classList.add('text-emerald-300');
  } else if (type === 'error') {
    statusMessage.classList.add('text-rose-400');
  } else {
    statusMessage.classList.add('text-slate-300');
  }
}

function parseGradeInput(id) {
  const input = document.getElementById(id);
  const value = parseFloat(input.value);

  if (isNaN(value) || value < 1 || value > 5) return { value: null, input };
  return { value, input };
}

async function saveGrades(record) {
  const { data, error } = await db.from('grades').insert([record]);

  if (error) throw error;
  return data;
}

saveSubjectsButton.addEventListener('click', (event) => {
  event.preventDefault();
  setStatus('', 'info');

  const nameInput = document.getElementById('student-name');
  const studentName = nameInput.value.trim();

  if (!studentName) {
    setStatus('Please enter a student name.', 'error');
    nameInput.focus();
    return;
  }

  const subjectNameIds = ['subject1-name', 'subject2-name', 'subject3-name', 'subject4-name', 'subject5-name'];
  savedSubjectNames = subjectNameIds.map((id, index) => {
    const el = document.getElementById(id);
    const value = el?.value.trim();
    return value || `Subject ${index + 1}`;
  });

  for (let i = 0; i < 5; i++) {
    document.getElementById(`subject${i + 1}-display`).textContent = savedSubjectNames[i];
  }

  phase1Subjects.classList.add('hidden');
  phase2Grades.classList.remove('hidden');
  saveSubjectsButton.classList.add('hidden');
  submitButton.classList.remove('hidden');

  setStatus('Subjects saved. Now enter grades.', 'success');
});

gradeForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  setStatus('', 'info');

  const nameInput = document.getElementById('student-name');
  const studentName = nameInput.value.trim();

  const gradeIds = ['grade1', 'grade2', 'grade3', 'grade4', 'grade5'];
  const grades = [];
  let hasError = false;

  for (const id of gradeIds) {
    const { value, input } = parseGradeInput(id);

    if (value === null) {
      setStatus('Please enter a valid number for all grades.', 'error');
      input.focus();
      hasError = true;
      break;
    }
    grades.push(value);
  }

  if (hasError) return;

  const sum = grades.reduce((acc, g) => acc + g, 0);
  const average = sum / grades.length;

  averageDisplay.textContent = `GWA: ${average.toFixed(2)}`;
  averageDisplay.classList.remove('hidden');

  const record = {
    student_name: studentName,
    subject_1_name: savedSubjectNames[0],
    subject_2_name: savedSubjectNames[1],
    subject_3_name: savedSubjectNames[2],
    subject_4_name: savedSubjectNames[3],
    subject_5_name: savedSubjectNames[4],
    subject_1: grades[0],
    subject_2: grades[1],
    subject_3: grades[2], 
    subject_4: grades[3],
    subject_5: grades[4],
    average: average,
  };

  submitButton.disabled = true;
  setStatus('Saving to database...', 'info');

  try {
    await saveGrades(record);
    setStatus('Grades saved successfully to Supabase.', 'success');
  } catch (error) {
    console.error('Supabase insert error:', error);
    setStatus('Failed to save to Supabase. Please check your credentials and try again.', 'error');
    alert('Error saving data. See console for details.');
  } finally {
    submitButton.disabled = false;
  }
});

