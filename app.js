const SUPABASE_URL = "https://cvuojbxbuzlnwpmujfcu.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2dW9qYnhidXpsbndwbXVqZmN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2ODg5OTUsImV4cCI6MjA4ODI2NDk5NX0.JUJTE0vLsR8tcb04p1fcnUyuFbxaPfNdBFYVgGVwlnk";

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const gradeForm = document.getElementById("grade-form");
const averageDisplay = document.getElementById("average-display");
const statusMessage = document.getElementById("status-message");
const submitButton = document.getElementById("submit-button");
const saveSubjectsButton = document.getElementById("save-subjects-button");

const phase1Subjects = document.getElementById("phase1-subjects");
const phase2Grades = document.getElementById("phase2-grades");

const historyTable = document.getElementById("student-history");

let savedSubjectNames = [];


/* SAVE SUBJECT NAMES */

saveSubjectsButton.addEventListener("click", (e)=>{

e.preventDefault();

const subjectIds = [
"subject1-name",
"subject2-name",
"subject3-name",
"subject4-name",
"subject5-name"
];

savedSubjectNames = subjectIds.map((id,i)=>{

const val = document.getElementById(id).value.trim();
return val || `Subject ${i+1}`;

});


/* UPDATE TABLE HEADERS */

document.getElementById("th-sub1").innerText = savedSubjectNames[0];
document.getElementById("th-sub2").innerText = savedSubjectNames[1];
document.getElementById("th-sub3").innerText = savedSubjectNames[2];
document.getElementById("th-sub4").innerText = savedSubjectNames[3];
document.getElementById("th-sub5").innerText = savedSubjectNames[4];


/* UPDATE GRADE PLACEHOLDERS */

document.getElementById("grade1").placeholder = savedSubjectNames[0] + " (1.00-5.00)";
document.getElementById("grade2").placeholder = savedSubjectNames[1] + " (1.00-5.00)";
document.getElementById("grade3").placeholder = savedSubjectNames[2] + " (1.00-5.00)";
document.getElementById("grade4").placeholder = savedSubjectNames[3] + " (1.00-5.00)";
document.getElementById("grade5").placeholder = savedSubjectNames[4] + " (1.00-5.00)";


phase1Subjects.classList.add("hidden");
phase2Grades.classList.remove("hidden");


/* REMOVE SAVE BUTTON AFTER CLICK */

saveSubjectsButton.remove();
submitButton.classList.remove("hidden");

});


/* CALCULATE AVERAGE AND SAVE */

gradeForm.addEventListener("submit", async (e)=>{

e.preventDefault();

const studentName = document.getElementById("student-name").value;

const grades = [

parseFloat(document.getElementById("grade1").value),
parseFloat(document.getElementById("grade2").value),
parseFloat(document.getElementById("grade3").value),
parseFloat(document.getElementById("grade4").value),
parseFloat(document.getElementById("grade5").value)

];

if(grades.some(g=>isNaN(g) || g<1 || g>5)){

statusMessage.innerText = "Grades must be between 1.00 and 5.00";
return;

}

const average = (grades.reduce((a,b)=>a+b,0)/5).toFixed(2);

averageDisplay.innerText = `Average: ${average}`;
averageDisplay.classList.remove("hidden");


/* DATA TO SAVE */

const record = {

student_name:studentName,

subject_1_name:savedSubjectNames[0],
subject_2_name:savedSubjectNames[1],
subject_3_name:savedSubjectNames[2],
subject_4_name:savedSubjectNames[3],
subject_5_name:savedSubjectNames[4],

subject_1:grades[0],
subject_2:grades[1],
subject_3:grades[2],
subject_4:grades[3],
subject_5:grades[4],

average:average

};

statusMessage.innerText = "Saving to database...";

try{

await db.from("grades").insert([record]);

statusMessage.innerText = "Saved to database";

}catch(err){

console.error(err);
statusMessage.innerText = "Database save failed";

}


/* ADD NEW RECORD TO TABLE */

const row = `

<tr>

<td class="border p-2">${studentName}</td>

<td class="border p-2">${grades[0]}</td>
<td class="border p-2">${grades[1]}</td>
<td class="border p-2">${grades[2]}</td>
<td class="border p-2">${grades[3]}</td>
<td class="border p-2">${grades[4]}</td>

<td class="border p-2 font-bold">${average}</td>

</tr>

`;

if(historyTable.innerText.includes("No records"))
historyTable.innerHTML="";

historyTable.innerHTML += row;

});


/* LOAD SAVED RECORDS FROM DATABASE */

async function loadRecords(){

const { data, error } = await db
.from("grades")
.select("*")
.order("id", { ascending: false });

if(error){

console.log(error);
return;

}

historyTable.innerHTML="";

data.forEach(record => {

const row = `

<tr>

<td class="border p-2">${record.student_name}</td>

<td class="border p-2">${record.subject_1}</td>
<td class="border p-2">${record.subject_2}</td>
<td class="border p-2">${record.subject_3}</td>
<td class="border p-2">${record.subject_4}</td>
<td class="border p-2">${record.subject_5}</td>

<td class="border p-2 font-bold">${record.average}</td>

</tr>

`;

historyTable.innerHTML += row;

});

}

loadRecords();