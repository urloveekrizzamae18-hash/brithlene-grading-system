const SUPABASE_URL =
'https://ajpaltznurpwenetnqdr.supabase.co';

const SUPABASE_ANON_KEY =
'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqcGFsdHpudXJwd2VuZXRucWRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNDE3NzksImV4cCI6MjA4ODYxNzc3OX0.KNZjt2sSgGd-d6NOGLLOjKbJbgbmsiwyHNbsLFMmMAs';

const { createClient } = supabase;

const db =
createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

const form =
document.getElementById('grade-form');

const tableBody =
document.getElementById('final-body');

let totalStudents = 0;
let passedStudents = 0;
let failedStudents = 0;

// ======================
// ADD FIELD
// ======================

function addField(containerId, type){

  const container =
  document.getElementById(containerId);

  const count =
  container.children.length + 1;

  const wrapper =
  document.createElement('div');

  wrapper.className =
  'flex gap-2';

  const input =
  document.createElement('input');

  input.type = 'number';

  input.min = 0;
  input.max = 100;

  input.placeholder =
  `${type} ${count}`;

  input.className =
  `${type}-input w-full p-3 rounded-xl bg-white/30`;

  const removeBtn =
  document.createElement('button');

  removeBtn.type = 'button';

  removeBtn.innerText = '✖';

  removeBtn.className =
  'bg-red-500 text-white px-4 rounded-xl';

  removeBtn.onclick = () => {

    wrapper.remove();

  };

  wrapper.appendChild(input);

  wrapper.appendChild(removeBtn);

  container.appendChild(wrapper);

}

// ======================
// GET AVERAGE
// ======================

function getAverage(className){

  const inputs =
  document.querySelectorAll(`.${className}`);

  let total = 0;
  let count = 0;

  inputs.forEach(input => {

    const value =
    parseFloat(input.value);

    if(!isNaN(value)){

      if(value < 0 || value > 100){

        alert(
          "Grades must be between 0 and 100."
        );

        throw new Error(
          "Invalid grade"
        );

      }

      total += value;

      count++;

    }

  });

  return count > 0
    ? total / count
    : 0;

}

// ======================
// ADD HISTORY
// ======================

function addToHistory(
  id,
  name,
  quiz,
  lab,
  assignment,
  attendance,
  exam,
  final,
  remarks
){

  const row =
  document.createElement('tr');

  row.className =
  'border-b border-pink-200';

  row.innerHTML = `

    <td class="p-4 font-semibold">
      ${name}
    </td>

    <td>
      ${quiz.toFixed(2)}
    </td>

    <td>
      ${lab.toFixed(2)}
    </td>

    <td>
      ${assignment.toFixed(2)}
    </td>

    <td>
      ${attendance.toFixed(2)}
    </td>

    <td>
      ${exam.toFixed(2)}
    </td>

    <td class="font-bold">
      ${final.toFixed(2)}
    </td>

    <td>

      <span class="
        px-3 py-1 rounded-full text-white
        ${final >= 75
          ? 'bg-green-500'
          : 'bg-red-500'}
      ">

        ${remarks}

      </span>

    </td>

    <td class="p-2">

      <button
        class="
        bg-red-500 hover:bg-red-600
        text-white px-4 py-2
        rounded-xl remove-btn
        "
      >

        Remove

      </button>

    </td>

  `;

  // ======================
  // REMOVE ROW
  // ======================

  row.querySelector('.remove-btn')
  .addEventListener('click',

  async () => {

    const confirmDelete =
    confirm(
      "Remove this student record?"
    );

    if(!confirmDelete) return;

    // DELETE FROM SUPABASE
    const { error } =
    await db
    .from('grades')
    .delete()
    .eq('id', id);

    if(error){

      alert(error.message);

      return;

    }

    // REMOVE ROW
    row.remove();

    // UPDATE COUNTERS
    totalStudents--;

    if(final >= 75){

      passedStudents--;

    }else{

      failedStudents--;

    }

    document.getElementById(
      'totalStudents'
    ).innerText =
    totalStudents;

    document.getElementById(
      'passedStudents'
    ).innerText =
    passedStudents;

    document.getElementById(
      'failedStudents'
    ).innerText =
    failedStudents;

    alert(
      "Student removed successfully."
    );

  });

  tableBody.appendChild(row);

}

// ======================
// FORM SUBMIT
// ======================

form.addEventListener(
'submit',

async (e) => {

  e.preventDefault();

  try{

    const name =
    document.getElementById('student-name')
    .value.trim();

    if(!name){

      alert(
        "Please enter student name."
      );

      return;

    }

    // DUPLICATE CHECK
    const {
      data: existing,
      error: checkError
    } =
    await db
    .from('grades')
    .select('student_name')
    .ilike('student_name', name);

    if(checkError){

      alert(checkError.message);

      return;

    }

    if(existing &&
      existing.length > 0){

      alert(
        "Student already exists."
      );

      return;

    }

    // AVERAGES
    const quiz =
    getAverage('quiz-input');

    const lab =
    getAverage('lab-input');

    const assignment =
    getAverage('assignment-input');

    const attendance =
    getAverage('attendance-input');

    const exam =
    getAverage('exam-input');

    // FINAL GRADE
    const final =

      (quiz * 0.20) +
      (lab * 0.30) +
      (assignment * 0.10) +
      (attendance * 0.10) +
      (exam * 0.30);

    const remarks =
    final >= 75
      ? 'PASSED'
      : 'FAILED';

    // SAVE TO SUPABASE
    const {
      data,
      error
    } =
    await db
    .from('grades')
    .insert([{

      student_name: name,

      quiz,
      lab,
      assignment,
      attendance,
      exam,

      final_grade: final

    }])

    .select();

    if(error){

      alert(error.message);

      return;

    }

    // UPDATE COUNTERS
    totalStudents++;

    if(final >= 75){

      passedStudents++;

    }else{

      failedStudents++;

    }

    document.getElementById(
      'totalStudents'
    ).innerText =
    totalStudents;

    document.getElementById(
      'passedStudents'
    ).innerText =
    passedStudents;

    document.getElementById(
      'failedStudents'
    ).innerText =
    failedStudents;

    // SHOW HISTORY
    addToHistory(

      data[0].id,

      name,
      quiz,
      lab,
      assignment,
      attendance,
      exam,
      final,
      remarks

    );

    alert(
      "Student saved successfully!"
    );

    form.reset();

  }catch(err){

    console.log(err);

  }

});

// ======================
// CLEAR TABLE
// ======================

function clearTable(){

  if(confirm(
    "Clear all history?"
  )){

    tableBody.innerHTML = "";

    totalStudents = 0;
    passedStudents = 0;
    failedStudents = 0;

    document.getElementById(
      'totalStudents'
    ).innerText = 0;

    document.getElementById(
      'passedStudents'
    ).innerText = 0;

    document.getElementById(
      'failedStudents'
    ).innerText = 0;

  }

}

// ======================
// GLOBAL FUNCTIONS
// ======================

window.addField = addField;

window.clearTable = clearTable;