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
  const [bugsId, setBugsId] = useState('');
  const [bugsFound, setBugsFound] = useState('');
  const [tasks, setTasks] = useState([]);
  const [completedBugsId, setCompletedBugsId] = useState('');

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
        completedBugsId,
        bugsId: category === 'Testing' ? bugsId : '',
        bugsFound: category === 'Testing' ? bugsFound : '',
      },
    ]);
    setAppName('');
    setTaskName('');
    setCompletedPercent('');
    setRemarks('');
    setBugsId('');
    setBugsFound('');
    setCompletedBugsId('');
    setStatus(statusOptions[0]);
  };

  const handleStatusChange = (e) => setStatus(e.target.value);
  const handleCategoryChange = (e) => setCategory(e.target.value);

  const handleGeneratePDF = () => {
    if (tasks.length === 0) return;
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text('Paisavara App – Daily Status Report', 14, 18);
    doc.setFontSize(14);
    const today = new Date();
    const pad = n => n.toString().padStart(2, '0');
    const dateStr = `${pad(today.getDate())}-${pad(today.getMonth() + 1)}-${today.getFullYear()}`;
    doc.setFont(undefined, 'bold');
    doc.text(`Date:`, 14, 30);
    doc.setFont(undefined, 'normal');
    doc.text(dateStr, 32, 30);
    let y = 38;

    categoryOptions.forEach(cat => {
      const catTasks = tasks.filter(t => t.category === cat);
      if (catTasks.length > 0) {
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text(cat, 14, y);
        y += 10;
        doc.setLineWidth(0.2);
        doc.line(14, y, 195, y);
        y += 10;
        const apps = [...new Set(catTasks.map(t => t.appName))];
        doc.setFontSize(14);
        apps.forEach(app => {
          doc.setFont(undefined, 'bold');
          doc.text(app, 14, y);
          y += 7;
          doc.setFont(undefined, 'normal');
          catTasks.filter(t => t.appName === app).forEach(task => {
            doc.setDrawColor(0, 0, 0);
            doc.circle(17, y - 2, 1.5, 'F');
            doc.setTextColor(0, 0, 0);
            doc.setFont(undefined, 'bold');
            doc.text(task.taskName, 22, y);
            doc.setFont(undefined, 'normal');
            doc.setFontSize(13);
            let details = `Status: ${task.status} • Completion: ${task.completedPercent}% • Remarks: ${task.remarks || '-'}`;
            if (cat === 'Testing') {
              details += ` • Bugs ID: ${task.bugsId || '-'}`;
              if (task.bugsFound && task.bugsFound !== '0') {
                details += ` • No. of Bugs: ${task.bugsFound}`;
              }
            }
            if (task.completedBugsId && task.completedBugsId !== '0') {
              details += ` • Completed Bugs ID: ${task.completedBugsId}`;
            }
            y += 7;
            const detailsLines = doc.splitTextToSize(details, 170);
            doc.text(detailsLines, 26, y);
            y += 8 * detailsLines.length + 2;
            doc.setFontSize(14);
          });
        });
        y += 6;
      }
    });

    doc.save(`Paisavara Report-${dateStr}.pdf`);
    setAppName('');
    setTaskName('');
    setStatus(statusOptions[0]);
    setCompletedPercent('');
    setCategory(categoryOptions[0]);
    setRemarks('');
    setBugsId('');
    setBugsFound('');
    setCompletedBugsId('');
    setTasks([]);
  };

  const handleClearAll = () => {
    setAppName('');
    setTaskName('');
    setStatus(statusOptions[0]);
    setCompletedPercent('');
    setCategory(categoryOptions[0]);
    setRemarks('');
    setBugsId('');
    setBugsFound('');
    setCompletedBugsId('');
    setTasks([]);
  };

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
          placeholder="Completed Bugs ID"
          min="0"
          value={completedBugsId}
          onChange={e => setCompletedBugsId(e.target.value)}
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
              placeholder="Bugs ID"
              value={bugsId}
              onChange={e => setBugsId(e.target.value)}
            />
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
                                , Bugs ID: {task.bugsId || '-'}
                                {task.bugsFound && task.bugsFound !== '0' && `, No. of Bugs: ${task.bugsFound}`}
                              </>
                            )}
                            {task.completedBugsId && task.completedBugsId !== '0' && `, Completed Bugs ID: ${task.completedBugsId}`}
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
