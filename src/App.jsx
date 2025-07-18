import { useState } from "react";
import { jsPDF } from "jspdf";
import "./App.css";

const statusOptions = ["Testing Pending", "In Progress", "Completed"];

const categoryOptions = ["Frontend", "Backend", "Testing"];

function App() {
  const [appName, setAppName] = useState("");
  const [taskName, setTaskName] = useState("");
  const [status, setStatus] = useState(statusOptions[0]);
  const [completedPercent, setCompletedPercent] = useState("");
  const [category, setCategory] = useState(categoryOptions[0]);
  const [remarks, setRemarks] = useState("");
  const [tasks, setTasks] = useState([]);
  const [completedBugsId, setCompletedBugsId] = useState("");
  const [editIndex, setEditIndex] = useState(-1);

  const handleAddTask = () => {
    if (!appName || !taskName) return;
    if (editIndex > -1) {
      // Update existing task
      const updatedTasks = [...tasks];
      updatedTasks[editIndex] = {
        appName,
        taskName,
        status,
        completedPercent: completedPercent || "0",
        category,
        remarks,
        completedBugsId,
      };
      setTasks(updatedTasks);
      setEditIndex(-1);
    } else {
      // Add new task
      setTasks([
        ...tasks,
        {
          appName,
          taskName,
          status,
          completedPercent: completedPercent || "0",
          category,
          remarks,
          completedBugsId,
        },
      ]);
    }
    setAppName("");
    setTaskName("");
    setCompletedPercent("");
    setRemarks("");
    setCompletedBugsId("");
    setStatus(statusOptions[0]);
  };

  const handleStatusChange = (e) => setStatus(e.target.value);
  const handleCategoryChange = (e) => setCategory(e.target.value);

  const handleGeneratePDF = () => {
    if (tasks.length === 0) return;
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text("Paisavara App – Daily Status Report", 14, 18);
    doc.setFontSize(14);
    const today = new Date();
    const pad = (n) => n.toString().padStart(2, "0");
    const dateStr = `${pad(today.getDate())}-${pad(
      today.getMonth() + 1
    )}-${today.getFullYear()}`;
    doc.setFont(undefined, "bold");
    doc.text(`Date:`, 14, 30);
    doc.setFont(undefined, "normal");
    doc.text(dateStr, 32, 30);
    let y = 38;

    categoryOptions.forEach((cat) => {
      const catTasks = tasks.filter((t) => t.category === cat);
      if (catTasks.length > 0) {
        doc.setFontSize(16);
        doc.setFont(undefined, "bold");
        doc.text(cat, 14, y);
        y += 10;
        doc.setLineWidth(0.2);
        doc.line(14, y, 195, y);
        y += 10;
        const apps = [...new Set(catTasks.map((t) => t.appName))];
        doc.setFontSize(14);
        apps.forEach((app) => {
          doc.setFont(undefined, "bold");
          doc.text(app, 14, y);
          y += 7;
          doc.setFont(undefined, "normal");
          catTasks
            .filter((t) => t.appName === app)
            .forEach((task) => {
              doc.setDrawColor(0, 0, 0);
              doc.circle(17, y - 2, 1.5, "F");
              doc.setTextColor(0, 0, 0);
              doc.setFont(undefined, "bold");
              doc.text(task.taskName, 22, y);
              doc.setFont(undefined, "normal");
              doc.setFontSize(13);
              let details = `Status: ${task.status} • Completion: ${
                task.completedPercent
              }% • Remarks: ${task.remarks || "-"}`;
              if (task.completedBugsId && task.completedBugsId !== "0") {
                details += ` • Completed Bugs : ${task.completedBugsId}`;
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
    setAppName("");
    setTaskName("");
    setStatus(statusOptions[0]);
    setCompletedPercent("");
    setCategory(categoryOptions[0]);
    setRemarks("");
    setCompletedBugsId("");
    setTasks([]);
  };

  const handleClearAll = () => {
    setAppName("");
    setTaskName("");
    setStatus(statusOptions[0]);
    setCompletedPercent("");
    setCategory(categoryOptions[0]);
    setRemarks("");
    setCompletedBugsId("");
    setTasks([]);
    setEditIndex(-1);
  };

  const handleEditTask = (index) => {
    const task = tasks[index];
    setAppName(task.appName);
    setTaskName(task.taskName);
    setStatus(task.status);
    setCompletedPercent(task.completedPercent);
    setCategory(task.category);
    setRemarks(task.remarks);
    setCompletedBugsId(task.completedBugsId);
    setEditIndex(index);
  };

  const handleDeleteTask = (index) => {
    const updatedTasks = tasks.filter((_, i) => i !== index);
    setTasks(updatedTasks);
    if (editIndex === index) {
      handleClearAll();
    } else if (editIndex > index) {
      setEditIndex(editIndex - 1);
    }
  };

  const handleCancelEdit = () => {
    handleClearAll();
  };

  const handleRemoveCompletedBugsId = () => {
    const updatedTasks = tasks.map(task => {
      if (task.status === 'Completed') {
        return { ...task, completedBugsId: '' };
      }
      return task;
    });
    setTasks(updatedTasks);
  };

  const groupedTasks = {};
  categoryOptions.forEach((cat) => {
    groupedTasks[cat] = {};
    tasks
      .filter((t) => t.category === cat)
      .forEach((task) => {
        if (!groupedTasks[cat][task.appName])
          groupedTasks[cat][task.appName] = [];
        groupedTasks[cat][task.appName].push(task);
      });
  });

  return (
    <div className="container">
      <h1>Daily Report App</h1>
      <div className="form-section">
        <div className="floating-label">
          <input
            id="appNameInput"
            type="text"
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
            placeholder=" "
          />
          <label htmlFor="appNameInput">App Name</label>
        </div>
        <div className="floating-label">
          <input
            id="taskNameInput"
            type="text"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            placeholder=" "
          />
          <label htmlFor="taskNameInput">Task Name</label>
        </div>
        <div className="floating-label">
          <select
            id="categorySelect"
            value={category}
            onChange={handleCategoryChange}
            placeholder=" "
          >
            {categoryOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <label htmlFor="categorySelect">Category</label>
        </div>
        <div className="floating-label">
          <select
            id="statusSelect"
            value={status}
            onChange={handleStatusChange}
            placeholder=" "
          >
            {statusOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <label htmlFor="statusSelect">Status</label>
        </div>
        <div className="floating-label">
          <input
            id="completedBugInput"
            type="text"
            min="0"
            value={completedBugsId}
            onChange={(e) => setCompletedBugsId(e.target.value)}
            placeholder=" "
          />
          <label htmlFor="completedBugInput">Completed Bug</label>
        </div>
        <div className="floating-label">
          <input
            id="completedPercentInput"
            type="number"
            min="0"
            max="100"
            value={completedPercent}
            onChange={(e) => setCompletedPercent(e.target.value)}
            placeholder=" "
            style={{ width: '70px' }}
          />
          <label htmlFor="completedPercentInput">Completed %</label>
        </div>
        <div className="floating-label">
          <input
            id="remarksInput"
            type="text"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder=" "
          />
          <label htmlFor="remarksInput">Remarks</label>
        </div>
        <button onClick={handleAddTask}>
          {editIndex > -1 ? "Save Task" : "Add Task"}
        </button>
        {editIndex > -1 && (
          <button onClick={handleCancelEdit} style={{ marginLeft: "10px" }}>
            Cancel Edit
          </button>
        )}
      </div>
      <div className="tasks-section">
        <h2>Tasks</h2>
        {tasks.length === 0 ? (
          <p>No tasks added yet.</p>
        ) : (
          <div>
            {categoryOptions.map(
              (cat) =>
                Object.keys(groupedTasks[cat]).length > 0 && (
                  <div
                    key={cat}
                    style={{ marginBottom: "1.5em", textAlign: "left" }}
                  >
                    <h3>{cat}</h3>
                    {Object.keys(groupedTasks[cat]).map((app) => (
                      <div
                        key={app}
                        style={{ marginLeft: "1em", marginBottom: "1em" }}
                      >
                        <strong>{app}</strong>
                        <ul>
                          {groupedTasks[cat][app].map((task, idx) => (
                            <li key={idx}>
                              <span style={{ fontWeight: 500 }}>
                                {task.taskName}
                              </span>{" "}
                              — Status: {task.status}, Completed:{" "}
                              {task.completedPercent}%, Remarks:{" "}
                              {task.remarks || "-"}
                              {task.completedBugsId &&
                                task.completedBugsId !== "0" &&
                                `, Completed Bugs: ${task.completedBugsId}`}{" "}
                              <button
                                onClick={() =>
                                  handleEditTask(
                                    tasks.findIndex((t) => t === task)
                                  )
                                }
                                style={{ marginLeft: "10px" }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteTask(
                                    tasks.findIndex((t) => t === task)
                                  )
                                }
                                style={{ marginLeft: "5px" }}
                              >
                                Delete
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )
            )}
          </div>
        )}
        <button
          onClick={handleGeneratePDF}
          disabled={tasks.length === 0}
          style={{ marginTop: "1em", marginRight: "1em" }}
        >
          Generate PDF Report
        </button>

        <button onClick={handleClearAll} style={{ marginTop: "1em" }}>
          Clear All
        </button>
      </div>
    </div>
  );
}

export default App;
