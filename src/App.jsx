import { useState } from 'react';
import { jsPDF } from 'jspdf';
import './App.css';

const statusOptions = [
  'Testing Pending',
  'In Progress',
  'Completed',
];

const categoryOptions = [
  'Frontend',
  'Backend',
  'Testing',
];

function App() {
  const [appName, setAppName] = useState('');
  const [taskName, setTaskName] = useState('');
  const [status, setStatus] = useState(statusOptions[0]);
  const [completedPercent, setCompletedPercent] = useState('');
  const [category, setCategory] = useState(categoryOptions[0]);
  const [remarks, setRemarks] = useState('');
  const [testCaseId, setTestCaseId] = useState('');
  const [bugsFound, setBugsFound] = useState('');
  const [tasks, setTasks] = useState([]);
  const [completedBugs, setCompletedBugs] = useState('');


  const handleAddTask = () => {
    if (!appName || !taskName) return;
    setTasks([
      ...tasks,
      {
        appName,
        taskName,
        status,
        completedPercent: completedPercent || '0',
        category,
        remarks,
        completedBugs,
        testCaseId: category === 'Testing' ? testCaseId : '',
        bugsFound: category === 'Testing' ? bugsFound : '',
      },
    ]);
    setAppName('');
    setTaskName('');
    setCompletedPercent('');
    setRemarks('');
    setTestCaseId('');
    setBugsFound('');
    setCompletedBugs('');
    setStatus(statusOptions[0]);
    // Do not clear category after adding a task
  };

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  const handleGeneratePDF = () => {
    if (tasks.length === 0) return;
    const doc = new jsPDF();
    doc.setFontSize(22); // Title font size increased
    doc.text('Paisavara App – Daily Status Report', 14, 18);
    doc.setFontSize(14); // Date and label font size increased
    const today = new Date();
    const pad = n => n.toString().padStart(2, '0');
    const dateStr = `${pad(today.getDate())}-${pad(today.getMonth() + 1)}-${today.getFullYear()}`;
    doc.setFont(undefined, 'bold');
    doc.text(`Date:`, 14, 30);
    doc.setFont(undefined, 'normal');
    doc.text(dateStr, 32, 30);
    let y = 38; // Start just after date, more space for bigger font
    // No horizontal line after date
    categoryOptions.forEach(cat => {
      const catTasks = tasks.filter(t => t.category === cat);
      if (catTasks.length > 0) {
        doc.setFontSize(16); // Section header font size increased
        doc.setFont(undefined, 'bold');
        doc.text(cat, 14, y);
        y += 10;
        doc.setLineWidth(0.2);
        doc.line(14, y, 195, y); // horizontal line
        y += 10;
        // Group by app name under this category
        const apps = [...new Set(catTasks.map(t => t.appName))];
        doc.setFontSize(14); // App name and task name font size increased
        apps.forEach(app => {
          doc.setFont(undefined, 'bold');
          doc.text(app, 14, y);
          y += 7; // Slightly more space for bigger font
          doc.setFont(undefined, 'normal');
          // No extra space after app name

          catTasks.filter(t => t.appName === app).forEach(task => {
            // Draw bullet
            doc.setDrawColor(0, 0, 0);
            doc.circle(17, y - 2, 1.5, 'F'); // Slightly bigger bullet for bigger font

            // Task name in black and bold (no underline)
            doc.setTextColor(0, 0, 0);
            doc.setFont(undefined, 'bold');
            doc.text(task.taskName, 22, y); // Move right for bigger bullet

            // Reset font to normal (color is already black)
            doc.setFont(undefined, 'normal');
            doc.setFontSize(13); // Details font size increased

            // Build details line
            let details = `Status: ${task.status} • Completion: ${task.completedPercent}% • Remarks: ${task.remarks || '-'}`;
            if (cat === 'Testing') {
              details += ` • Test Case ID: ${task.testCaseId || '-'}`;
              if (task.bugsFound && task.bugsFound !== '0') {
                details += ` • No. of Bugs: ${task.bugsFound}`;
              }
            }
            if (task.completedBugs && task.completedBugs !== '0') {
              details += ` • Completed Bugs: ${task.completedBugs}`;
            }
            y += 7; // More space for bigger font
            // Wrap details if too long
            const detailsLines = doc.splitTextToSize(details, 170);
            doc.text(detailsLines, 26, y);
            y += 8 * detailsLines.length + 2; // Adjust y based on number of lines, more space for bigger font
            doc.setFontSize(14); // Reset for next task/app
          });
        });
        y += 6;
      }
    });
    doc.save(`Paisavara Report-${dateStr}.pdf`);
    // After generating PDF, clear all fields and reset dropdowns and clear tasks
    setAppName('');
    setTaskName('');
    setStatus(statusOptions[0]);
    setCompletedPercent('');
    setCategory(categoryOptions[0]);
    setRemarks('');
    setTestCaseId('');
    setBugsFound('');
    setCompletedBugs('');
    setTasks([]);
  };

  const handleClearAll = () => {
    setAppName('');
    setTaskName('');
    setStatus(statusOptions[0]);
    setCompletedPercent('');
    setCategory(categoryOptions[0]);
    setRemarks('');
    setTestCaseId('');
    setBugsFound('');
    setCompletedBugs('');
    setTasks([]);
  };

  // Group tasks by category and app name for UI display
  const groupedTasks = {};
  categoryOptions.forEach(cat => {
    groupedTasks[cat] = {};
    tasks.filter(t => t.category === cat).forEach(task => {
      if (!groupedTasks[cat][task.appName]) groupedTasks[cat][task.appName] = [];
      groupedTasks[cat][task.appName].push(task);
    });
  });

  return (
    <div className="container">
      <h1>Daily Report App</h1>
      <div className="form-section">
        <input
          type="text"
          placeholder="App Name"
          value={appName}
          onChange={e => setAppName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Task Name"
          value={taskName}
          onChange={e => setTaskName(e.target.value)}
        />
        <select value={category} onChange={handleCategoryChange}>
          {categoryOptions.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <select value={status} onChange={handleStatusChange}>
          {statusOptions.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Completed Bugs"
          min="0"
          value={completedBugs}
          onChange={e => setCompletedBugs(e.target.value)}
        />
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
          Completed %
          <input
            type="number"
            placeholder="Completed %"
            min="0"
            max="100"
            value={completedPercent}
            onChange={e => setCompletedPercent(e.target.value)}
            style={{ width: '70px' }}
          />
        </label>
        {category === 'Testing' && (
          <>
            <input
              type="text"
              placeholder="Test Case ID"
              value={testCaseId}
              onChange={e => setTestCaseId(e.target.value)}
            />
            { /* Only show No. of Bugs input if category is Testing */}
            <input
              type="number"
              placeholder="No. of Bugs Found"
              min="0"
              value={bugsFound}
              onChange={e => setBugsFound(e.target.value)}
            />
          </>
        )}
        <input
          type="text"
          placeholder="Remarks"
          value={remarks}
          onChange={e => setRemarks(e.target.value)}
        />
        <button onClick={handleAddTask}>Add Task</button>
      </div>
      <div className="tasks-section">
        <h2>Tasks</h2>
        {tasks.length === 0 ? (
          <p>No tasks added yet.</p>
        ) : (
          <div>
            {categoryOptions.map(cat => (
              Object.keys(groupedTasks[cat]).length > 0 && (
                <div key={cat} style={{ marginBottom: '1.5em', textAlign: 'left' }}>
                  <h3>{cat}</h3>
                  {Object.keys(groupedTasks[cat]).map(app => (
                    <div key={app} style={{ marginLeft: '1em', marginBottom: '1em' }}>
                      <strong>{app}</strong>
                    
                      <ul>
                        {groupedTasks[cat][app].map((task, idx) => (
                          <li key={idx}>
                            <span style={{ fontWeight: 500 }}>{task.taskName}</span> — Status: {task.status}, Completed: {task.completedPercent}%, Remarks: {task.remarks || '-'}
                            {cat === 'Testing' && (
                              <>
                                , Test Case ID: {task.testCaseId || '-'}
                                {task.bugsFound && task.bugsFound !== '0' && `, No. of Bugs: ${task.bugsFound}`}
                              </>
                            )}
                              {task.completedBugs && task.completedBugs !== '0' && `, Completed Bugs: ${task.completedBugs}`}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )
            ))}
          </div>
        )}
        <button onClick={handleGeneratePDF} disabled={tasks.length === 0} style={{ marginTop: '1em', marginRight: '1em' }}>
          Generate PDF Report
        </button>
        <button onClick={handleClearAll} style={{ marginTop: '1em' }}>Clear All</button>
      </div>
    </div>
  );
}

export default App;
