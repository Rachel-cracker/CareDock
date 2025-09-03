// Ensure API_BASE is defined
if (typeof window.API_BASE === 'undefined') {
  window.API_BASE = "http://localhost:8000";
}

// variables
let allTasks = [];
let currentView = 'week';
let currentDate = new Date();
let weekWrap = null;
let monthWrap = null;
let todoList = null;
let doneList = null;
let todoEmpty = null;
let doneEmpty = null;
let addTaskForm = null;

// get auth headers
function getAuthHeaders() {
  const token = localStorage.getItem('token');
  if (!token) {
    console.warn('No auth token found');
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

// get user ID
function getUserId() {
  return localStorage.getItem('user_id');
}

// Test function for debugging token - you can call this in browser console
window.testProfileToken = function() {
  var token = localStorage.getItem('token');
  console.log('Profile Token test - Token exists:', !!token);
  console.log('Profile Token test - Token length:', token ? token.length : 0);
  console.log('Profile Token test - Token preview:', token ? token.substring(0, 50) + '...' : 'null');
  
  if (!token) {
    console.log('Profile Token test - No token found');
    return;
  }
  
  console.log('Profile Token test - Making request to profile endpoint...');
  fetch(window.API_BASE + "/profile/me", {
    headers: {
      "Authorization": "Bearer " + token
    }
  })
  .then(res => {
    console.log('Profile Token test - Response status:', res.status);
    console.log('Profile Token test - Response headers:', res.headers);
    return res.text();
  })
  .then(text => {
    console.log('Profile Token test - Response body:', text);
    try {
      var json = JSON.parse(text);
      console.log('Profile Token test - Parsed JSON:', json);
    } catch (e) {
      console.log('Profile Token test - Could not parse as JSON');
    }
  })
  .catch(err => {
    console.log('Profile Token test - Fetch error:', err);
  });
};

// Main initialization
document.addEventListener('DOMContentLoaded', () => {
  console.log('Calendar: DOMContentLoaded event fired');
  
  // Initialize DOM elements
  todoList = document.getElementById('todoList');
  doneList = document.getElementById('doneList');
  todoEmpty = document.getElementById('todoEmpty');
  doneEmpty = document.getElementById('doneEmpty');
  addTaskForm = document.getElementById('addTaskForm');
  
  console.log('Calendar: DOM elements found:', {
    todoList: !!todoList,
    doneList: !!doneList,
    todoEmpty: !!todoEmpty,
    doneEmpty: !!doneEmpty,
    addTaskForm: !!addTaskForm
  });
  
  const addTaskButton = document.getElementById('addTaskButton');
  const addTaskModal = document.getElementById('addTaskModal');
  const closeAddTaskModal = document.getElementById('closeAddTaskModal');
  const cancelAddTask = document.getElementById('cancelAddTask');

  function showAddTaskModal() {
    addTaskModal.classList.remove('hidden');
    addTaskModal.classList.add('flex');
    document.getElementById('newTaskDate').valueAsDate = new Date();
  }
  function hideAddTaskModal() {
    addTaskModal.classList.add('hidden');
    addTaskModal.classList.remove('flex');
    addTaskForm.reset();
  }

  addTaskButton.addEventListener('click', showAddTaskModal);
  closeAddTaskModal.addEventListener('click', hideAddTaskModal);
  cancelAddTask.addEventListener('click', hideAddTaskModal);
  addTaskModal.addEventListener('click', function(e) {
    // hide the add task modal when the user clicks outside of the modal
     if (e.target === addTaskModal) 
        hideAddTaskModal(); 
    });

  // AI Assist integration with backend
  var aiAssistButton = document.getElementById("aiAssistButton");
  aiAssistButton.addEventListener("click", async function () {
    // get inputs
    var titleEl = document.getElementById("newTaskTitle");
    var dateEl = document.getElementById("newTaskDate");
    var timeEl = document.getElementById("newTaskTime");
    var durationEl = document.getElementById("newTaskDuration");
    var priorityEl = document.getElementById("newTaskPriority");
    var categoryEl = document.getElementById("newTaskCategory");
    var notesEl = document.getElementById("newTaskNotes");
    // read user text
    var userText = (titleEl.value || "").trim();
    if (userText.length === 0) {
      alert("Please type something like: Doctor appointment 2pm");
      return;
    }
    var payload = {
      text: userText
    };
    // make the request
    try {
      console.log('AI Assist: Making request to:', window.API_BASE + "/tasks/ai-assist");
      console.log('AI Assist: Headers:', getAuthHeaders());
      console.log('AI Assist: Payload:', payload);
      
      var res = await fetch(window.API_BASE + "/tasks/ai-assist", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      console.log('AI Assist: Response status:', res.status, res.statusText);

      if (!res.ok) {
        const errorText = await res.text();
        console.error('AI Assist API error:', res.status, res.statusText, errorText);
        alert('AI Assist is not available right now. Please fill the form manually.');
        return;
      }

      // parse response (AI response)
      var data = await res.json();
      console.log('AI Assist: Response data:', data);
    } catch (error) {
      console.error('AI Assist error:', error);
      alert('AI Assist is not available right now. Please fill the form manually.');
      return;
    }
      // defaults if AI doesn't give everything, 
      // this part is written by cursor to handle the case where the AI doesn't give all the fields
      var newTitle    = (data.title && data.title.length > 0) ? data.title : userText;
      var newDate     = (data.date && data.date.length > 0) ? data.date : "";
      var newTime     = (data.time && data.time.length > 0) ? data.time : "09:00";
      var newDuration = (typeof data.duration === "number") ? data.duration : 30;
      var newPriority = (data.priority && data.priority.length > 0) ? data.priority : "medium";
      var newNotes    = (data.notes && data.notes.length > 0) ? data.notes : "";

      // map the category
      var category = "general";
      if (data.category === "medication") {
        category = "medication";
      } else if (data.category === "appointment") {
        category = "appointment";
      } else if (data.category === "shopping") {
        category = "shopping";
      } else if (data.category === "exercise") {
        category = "exercise";
      } else if (data.category === "general") {
        category = "general";
      }
      // fill the form fields
      titleEl.value  = newTitle;
      dateEl.value = newDate;
      timeEl.value = newTime;
      durationEl.value = newDuration;
      priorityEl.value = newPriority;
      categoryEl.value = category;
      notesEl.value = newNotes;
  });

  // create task form submission
  if (addTaskForm) {
  addTaskForm.addEventListener("submit", function (e) {
    // this line of code is written by cursor to prevent reloading the page
    //because if reloading the page, the task created will fail
    e.preventDefault(); 
    // read fields
    var fd = new FormData(addTaskForm);
    var title = (fd.get("title") || "").trim();
    var date = fd.get("date") || "";
    var time = fd.get("time") || "";
    var duration = parseInt(fd.get("duration") || "30", 10);
    if (isNaN(duration)) { duration = 30; }
    var priority = fd.get("priority") || "medium";
    var category = fd.get("category") || "general";
    var notes = fd.get("notes") || "";
    // check if required fields are filled
    if (!title || !date || !time) {
      alert("Please fill Title, Date, and Time.");
      return;
    }
    // check if user is logged in
    var userId = getUserId();
    if (!userId) {
      alert("Please log in to add tasks");
      window.location.href = "login_register.html";
      return;
    }
    // build the payload
    var taskData = {
      title: title,
      date: date,
      time: time,
      duration: duration,
      priority: priority,
      category: category,
      notes: notes,
      status: "pending",
      completed: false
    };
    // communicate with endpoint to create the task
    var userIdInt = parseInt(userId, 10);
    var url = window.API_BASE + "/tasks?user_id=" + userIdInt;
    fetch(url, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(taskData)
    })
    .then(function (response) {
      return response.json();
    })
    .then(function (createdTask) {
      // keep a copy in memory
      if (typeof allTasks === "undefined") {
        window.allTasks = [];
      }
      allTasks.push(createdTask);

      // refresh the UI
      refreshAllViews();
      hideAddTaskModal();
    })
    .catch(function(error) {
      console.error('Error creating task:', error);
      alert('Failed to create task. Please try again.');
    });
  });
  }

  // Check authentication and load initial data
  var uid = getUserId();
  if (!uid) {
    window.location.href = 'login_register.html';
    return;
  }
  loadTasks();

  // Initialize view switching
  console.log('Calendar: About to initialize view switching');
  initializeViewSwitching();
  console.log('Calendar: Initialization complete');
});

// task functions
// This function is written by ChatGPT 4.1 to create task element
function addTaskToCalendar(task) {
  const el = document.createElement('div');
  const priorityColors = {
    'high': 'bg-red-100 text-red-900',
    'medium': 'bg-yellow-100 text-yellow-900', 
    'low': 'bg-green-100 text-green-900'
  };
  el.className = `event-card ${priorityColors[task.priority] || 'bg-green-100 text-green-900'}`;
  el.setAttribute('onclick', 'openTaskPanel(this)');
  el.setAttribute('data-task-id', task.id);
  el.setAttribute('data-task-status', task.status);
  el.setAttribute('data-task-notes', task.notes || '');
  el.setAttribute('data-task-data', JSON.stringify(task));

  const start = task.time;
  const end = new Date(`2000-01-01T${start}`);
  end.setMinutes(end.getMinutes() + task.duration);
  const endStr = end.toTimeString().slice(0, 5);

  // Create main content
  const titleDiv = document.createElement('div');
  titleDiv.className = 'text-sm font-medium';
  titleDiv.textContent = task.title;
  
  const timeDiv = document.createElement('div');
  timeDiv.className = 'text-xs';
  timeDiv.textContent = `${start} - ${endStr}`;
  
  // Create tooltip
  const tooltip = document.createElement('div');
  tooltip.className = 'tooltip';
  
  const tooltipTitle = document.createElement('div');
  tooltipTitle.className = 'font-medium mb-1';
  tooltipTitle.textContent = task.title;
  
  const tooltipTime = document.createElement('div');
  tooltipTime.className = 'text-xs text-gray-600 mb-1';
  tooltipTime.textContent = `${start} - ${endStr}`;
  
  const tooltipNotes = document.createElement('div');
  tooltipNotes.className = 'text-xs text-gray-500';
  tooltipNotes.textContent = task.notes || '';
  
  const tooltipPriority = document.createElement('div');
  tooltipPriority.className = 'text-xs text-gray-400 mt-1';
  tooltipPriority.textContent = `Priority: ${task.priority}`;
  
  tooltip.append(tooltipTitle, tooltipTime, tooltipNotes, tooltipPriority);
  el.append(titleDiv, timeDiv, tooltip);

  // Find appropriate time slot in day view
  const slots = document.querySelectorAll('.event-slot');
  const taskHour = parseInt(start.split(':')[0], 10);
  let placed = false;
  
  slots.forEach(function(slot, index) {
    const label = slot.previousElementSibling?.textContent || '';
    
    // Parse hour from label (handle both AM/PM format)
    let slotHour = 0;
    if (label.includes('AM')) {
      slotHour = parseInt(label.replace(':00 AM', ''), 10);
      if (slotHour === 12) slotHour = 0; // 12 AM = 0 hours (midnight)
    } else if (label.includes('PM')) {
      slotHour = parseInt(label.replace(':00 PM', ''), 10);
      if (slotHour !== 12) slotHour += 12; // Convert PM to 24-hour format
    }
    
    if (slotHour === taskHour && !placed) {
      slot.appendChild(el);
      placed = true;
    }
  });
}

// Display tasks for current day view
function displayTasksInDayView() {
  const currentDateStr = currentDate.toISOString().split('T')[0];
  
  allTasks.forEach(function(task) {
    if (task.date === currentDateStr) {
      addTaskToCalendar(task);
    }
  });
}

// This helper function is written by ChatGPT 5 to refresh all views
function refreshAllViews() {
  // clear existing tasks from all views
  document.querySelectorAll('.event-card').forEach(function(card) { card.remove(); });
  if (weekWrap) {
    weekWrap.querySelectorAll('.week-task').forEach(function(task) { task.remove(); });
  }
  if (monthWrap) {
    monthWrap.querySelectorAll('.month-task').forEach(function(task) { task.remove(); });
  }
  
  // update todo list
  updateTodaysTodoList();
  
  // refresh current view
  if (typeof currentView !== 'undefined') {
    if (currentView === 'day') {
      displayTasksInDayView();
    } else if (currentView === 'week') {
      displayTasksInWeekView();
    } else if (currentView === 'month') {
      displayTasksInMonthView();
    }
  }
}

// load tasks
function loadTasks() {
  var userId = getUserId();
  if (!userId) return;
  
  // Convert user_id to integer if it's stored as string
  var userIdInt = parseInt(userId, 10);
  if (isNaN(userIdInt)) {
    console.error('Invalid user_id:', userId);
    window.location.href = 'login_register.html';
    return;
  }
  
  var url = window.API_BASE + "/tasks?user_id=" + userIdInt;
  fetch(url, {
    method: 'GET',
    headers: getAuthHeaders()
  })
  .then(function (res) { 
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    return res.json();
  })
  .then(function (data) {
    allTasks = data || [];
    refreshAllViews();
  })
  .catch(function (error) {
    console.error('Error loading tasks:', error);
    // If it's an auth error, redirect to login
    if (error.message.includes('401') || error.message.includes('403')) {
      window.location.href = 'login_register.html';
    }
  });
}
// This function was moved to main DOMContentLoaded block

// This function is written by ChatGPT 5 to create todo list item
function createTodoListItem(task) {
  const item = document.createElement('div');
  item.className = 'flex items-center gap-3 p-3 bg-gray-50 rounded-lg';
  
  const priorityColors = {
    'high': 'bg-red-500',
    'medium': 'bg-yellow-500',
    'low': 'bg-green-500'
  };
  
  // Create priority dot
  const dot = document.createElement('span');
  dot.className = `w-3 h-3 rounded-full ${priorityColors[task.priority] || 'bg-green-500'}`;

  // Create content div
  const content = document.createElement('div');
  content.className = 'flex-1';
  
  const title = document.createElement('div');
  title.className = 'font-medium text-sm';
  title.textContent = task.title;
  
  const details = document.createElement('div');
  details.className = 'text-xs text-gray-500';
  details.textContent = `${task.time} • ${task.category}`;
  
  content.append(title, details);
  
  // Create button
  const button = document.createElement('button');
  button.className = 'text-sm text-[#E27759] hover:text-[#E27759]/80';
  button.textContent = task.completed ? 'Undo' : 'Complete';
  button.onclick = function(e) {
    e.stopPropagation();
    toggleTaskComplete(task.id, button);
  };
  
  item.append(dot, content, button);
  
  // Make item clickable to open task panel
  item.addEventListener('click', function() {
    const taskElement = document.querySelector(`[data-task-id="${task.id}"]`);
    if (taskElement) openTaskPanel(taskElement);
  });
  
  return item;
}

// update today's todo list
function updateTodaysTodoList() {
  var todayStr = new Date().toISOString().split('T')[0];
  // clear lists
  todoList.innerHTML = '';
  doneList.innerHTML = '';
  var pendingCount = 0;
  var doneCount = 0;
  for (var i = 0; i < allTasks.length; i++) {
    var t = allTasks[i];
    if (t.date === todayStr) {
      var row = createTodoListItem(t);
      if (t.completed === true || t.status === 'completed') {
        doneList.appendChild(row);
        doneCount++;
      } else {
        todoList.appendChild(row);
        pendingCount++;
      }
    }
  }
  //if there are no tasks, show the empty page
  todoEmpty.style.display = (pendingCount === 0) ? 'block' : 'none';
  doneEmpty.style.display = (doneCount === 0) ? 'block' : 'none';
}

// task panel
// This function is written by ChatGPT 5 to open the task panel
let currentTaskId = null;
function openTaskPanel(taskElement) {
  currentTaskId = taskElement.dataset.taskId;
  
  // Get task data from the element's data attribute
  let taskData = JSON.parse(taskElement.dataset.taskData || '{}');
  if (!taskData || !taskData.title) {
    taskData = allTasks.find(task => task.id == currentTaskId);
  }
  
  // Populate the panel with task data
  document.getElementById('taskTitle').textContent = taskData.title || '';
  document.getElementById('taskTime').textContent = `${taskData.time} (${taskData.duration} min)` || '';
  document.getElementById('taskStatus').value = taskData.status || 'pending';
  document.getElementById('taskNotes').value = taskData.notes || '';

  const panel = document.getElementById('taskPanel');
  panel.classList.remove('hidden');
  panel.classList.add('open');
}

function closeTaskPanel() {
  const panel = document.getElementById('taskPanel');
  panel.classList.remove('open');
  panel.classList.add('hidden');
  currentTaskId = null;
}

function getTaskIndexById(taskId) {
  for (var i = 0; i < allTasks.length; i++) {
    if (String(allTasks[i].id) === String(taskId)) return i;
  }
  return -1;
}

function getTaskElementById(taskId) {
  return document.querySelector('[data-task-id="' + taskId + '"]');
}

function removeTaskFromList(taskId) {
  var idx = getTaskIndexById(taskId);
  if (idx !== -1) {
    allTasks.splice(idx, 1);
  }
}

function updateTaskInList(updatedTask) {
  var idx = getTaskIndexById(updatedTask.id);
  if (idx !== -1) {
    allTasks[idx] = updatedTask;
  }
}
//This function is written with the facilitation of cursor to set the task element state
function setTaskElementState(taskId, taskData) {
  var el = getTaskElementById(taskId);
  if (!el) return;
  if (taskData && typeof taskData === 'object') {
    el.dataset.taskStatus = taskData.status || '';
    try {
      el.dataset.taskData = JSON.stringify(taskData);
    } catch (e) {}
    if (taskData.completed === true) {
      el.style.opacity = '0.6';
    } else {
      el.style.opacity = '1';
    }
  }
}

function saveTaskChanges() {
  var status = document.getElementById('taskStatus').value;
  var notes = document.getElementById('taskNotes').value;
  
  var url = window.API_BASE + '/tasks/' + String(currentTaskId);
  var bodyObj = { status: status, notes: notes };
  
  fetch(url, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(bodyObj)
  })
  .then(function (res) { return res.json(); })
  .then(function (updatedTask) {
    updateTaskInList(updatedTask);
    setTaskElementState(currentTaskId, updatedTask);
    refreshAllViews();
    closeTaskPanel();
  });
}

function deleteTask() {
  var url = window.API_BASE + '/tasks/' + String(currentTaskId);
  fetch(url, {
    method: 'DELETE',
    headers: getAuthHeaders()
  })
  .then(function () {
    // remove from memory
    removeTaskFromList(currentTaskId);
    // remove from DOM
    var el = getTaskElementById(currentTaskId);
    if (el) el.remove();
    // refresh UI
    refreshAllViews();
    closeTaskPanel();
  });
}

// This function is written with the facilitation of cursor to toggle task completion from todo list
function toggleTaskComplete(taskId, buttonElement) {
  // find task
  var idx = getTaskIndexById(taskId);
  if (idx === -1) return;
  var wasCompleted = allTasks[idx].completed === true;
  var newCompleted = !wasCompleted;
  var newStatus = newCompleted ? 'completed' : 'pending';

  var url = window.API_BASE + '/tasks/' + String(taskId);
  var bodyObj = { completed: newCompleted, status: newStatus };

  fetch(url, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(bodyObj)
  })
  .then(function (res) { return res.json(); })
  .then(function (updatedTask) {
    // update memory
    updateTaskInList(updatedTask);
    // update DOM for the card (if it exists)
    setTaskElementState(taskId, updatedTask);
    // update button label
    if (buttonElement) {
      buttonElement.textContent = newCompleted ? 'Undo' : 'Complete';
    }
    // refresh lists/views
    refreshAllViews();
  });
}

// Helper function written by cursor for week calculations
function startOfWeek(d) { 
  const x = new Date(d); 
  x.setDate(x.getDate() - x.getDay()); 
  x.setHours(0, 0, 0, 0); 
  return x; 
}

// Helper functions written by cursor for date formatting
function labelDay(d) { return d.toLocaleDateString(undefined,{month:'long',day:'numeric',year:'numeric'}); }
function labelMonth(d) { return d.toLocaleDateString(undefined,{month:'long',year:'numeric'}); }

// Function to set the date heading
function setHeading() {
  const dateHeading = document.getElementById('dateHeading');
  console.log('Calendar: setHeading called', { 
    currentView, 
    currentDate, 
    dateHeading: !!dateHeading 
  });
  
  if (!dateHeading) {
    console.error('Calendar: dateHeading element not found!');
    return;
  }
  
  let headingText = '';
  if (currentView === 'day')   headingText = labelDay(currentDate);
  if (currentView === 'week')  headingText = 'Week of ' + labelDay(startOfWeek(currentDate));
  if (currentView === 'month') headingText = labelMonth(currentDate);
  
  dateHeading.textContent = headingText;
  console.log('Calendar: dateHeading set to:', headingText);
}

// The following functions are written by ChatGPT 5
// because the code I wrote can't show the tasks properly in different views
// week view
function displayTasksInWeekView() {
  if (!weekWrap) return;
  
  // Clear existing tasks
  weekWrap.querySelectorAll('.week-task').forEach(function(task) { task.remove(); });
  
  // Get week start and end dates
  const weekStart = startOfWeek(currentDate);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  
  // Filter tasks for the current week
  allTasks.forEach(function(task) {
    const taskDate = new Date(task.date);
    
    if (taskDate >= weekStart && taskDate <= weekEnd) {
        const dayIndex = taskDate.getDay();
        const taskHour = parseInt(task.time.split(':')[0], 10);
        
        // Find the appropriate column and row
        const columns = weekWrap.querySelectorAll('.relative.border-l');
        if (columns[dayIndex]) {
          const taskEl = document.createElement('div');
          
          // Use priority-based colors
          const priorityColors = {
            'high': 'bg-red-100 text-red-900 border-red-500',
            'medium': 'bg-yellow-100 text-yellow-900 border-yellow-500',
            'low': 'bg-green-100 text-green-900 border-green-500'
          };
          const colorClass = priorityColors[task.priority] || 'bg-blue-100 text-blue-900 border-blue-500';
          
          taskEl.className = `week-task absolute ${colorClass} text-xs p-1 rounded border-l-2 cursor-pointer`;
          taskEl.style.top = `${(taskHour - 6) * 48}px`; // 48px per hour, starting from 6 AM

          taskEl.style.left = '2px';
          taskEl.style.right = '2px';
          taskEl.style.height = `${Math.max(24, (task.duration / 60) * 48)}px`;
          
          const titleEl = document.createElement('div');
          titleEl.className = 'font-medium truncate';
          titleEl.textContent = task.title;
          
          const timeEl = document.createElement('div');
          timeEl.className = 'text-xs';
          timeEl.textContent = task.time;
          
          taskEl.append(titleEl, timeEl);
          
          // Add task data attributes for the panel
          taskEl.setAttribute('data-task-id', task.id);
          taskEl.setAttribute('data-task-data', JSON.stringify(task));
          
          // Click handler to open task panel
          taskEl.addEventListener('click', function() {
            openTaskPanel(taskEl);
          });
          
          columns[dayIndex].appendChild(taskEl);
        }
      }
  });
}
//month view
function displayTasksInMonthView() {
  if (!monthWrap) return;
  
  // Clear existing tasks
  monthWrap.querySelectorAll('.month-task').forEach(function(task) { task.remove(); });
  
  // Get month boundaries
  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
  // Filter tasks for the current month
  allTasks.forEach(function(task) {
    const taskDate = new Date(task.date);
    
    if (taskDate >= monthStart && taskDate <= monthEnd) {
        // Find the correct day cell
        const cells = monthWrap.querySelectorAll('.bg-white.p-3');
        const dayOfMonth = taskDate.getDate();
        
        cells.forEach(cell => {
          const dayNumber = parseInt(cell.querySelector('.text-sm.font-medium')?.textContent);
          if (dayNumber === dayOfMonth) {
            const taskEl = document.createElement('div');
            
            // Use priority-based colors
            const priorityColors = {
              'high': 'bg-red-100 text-red-800',
              'medium': 'bg-yellow-100 text-yellow-800',
              'low': 'bg-green-100 text-green-800'
            };
            const colorClass = priorityColors[task.priority] || 'bg-blue-100 text-blue-800';
            
            taskEl.className = `month-task ${colorClass} text-xs p-1 rounded mt-1 truncate cursor-pointer`;
            taskEl.textContent = `${task.time} ${task.title}`;
            
            // Add task data attributes for the panel
            taskEl.setAttribute('data-task-id', task.id);
            taskEl.setAttribute('data-task-data', JSON.stringify(task));
            
            // Click handler to open task panel
            taskEl.addEventListener('click', function() {
              openTaskPanel(taskEl);
            });
            
            cell.appendChild(taskEl);
          }
        });
      }
  });
}

// view switching
function initializeViewSwitching() {
  const dayView   = document.querySelector('.calendar-grid');

  const monthTab  = document.getElementById('monthTab');
  const weekTab   = document.getElementById('weekTab');
  const dayTab    = document.getElementById('dayTab');

  const prevBtn   = document.getElementById('prevBtn');
  const nextBtn   = document.getElementById('nextBtn');
  const todayBtn  = document.getElementById('todayBtn');
  const dateHeading = document.getElementById('dateHeading');


  function createWeekView() {
    const wrap = document.createElement('div');
    const container = document.createElement('div');
    container.className = 'relative bg-gray-50 p-1';
    
    // Header row
    const header = document.createElement('div');
    header.className = 'grid grid-cols-[60px_repeat(7,1fr)] border-b';
    header.appendChild(document.createElement('div')).className = 'p-4';
    
    // Add day headers
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek(currentDate));
      d.setDate(d.getDate() + i);
      const dayHeader = document.createElement('div');
      dayHeader.className = 'p-4 text-center border-l';
      
      const dayName = document.createElement('div');
      dayName.className = 'text-sm font-medium text-gray-900';
      dayName.textContent = d.toLocaleDateString(undefined, {weekday: 'short'});
      
      const dayDate = document.createElement('div');
      dayDate.className = 'text-xs text-gray-500';
      dayDate.textContent = d.toLocaleDateString(undefined, {month: 'short', day: 'numeric'});
      
      dayHeader.append(dayName, dayDate);
      header.appendChild(dayHeader);
    }
    
    // Time grid
    const grid = document.createElement('div');
    grid.className = 'relative grid grid-cols-[60px_repeat(7,1fr)] h-[800px]';
    
    // Time labels
    const timeColumn = document.createElement('div');
    timeColumn.className = 'grid grid-rows-16 text-xs text-gray-500';
    for (let i = 0; i < 17; i++) {
      const hour = i + 6;
      const am = hour < 12;
      const h = hour > 12 ? hour - 12 : hour;
      const timeLabel = document.createElement('div');
      timeLabel.className = 'h-12 -mt-2';
      timeLabel.textContent = `${h}:00 ${am ? 'AM' : 'PM'}`;
      timeColumn.appendChild(timeLabel);
    }
    grid.appendChild(timeColumn);
    
    // Day columns
    for (let i = 0; i < 7; i++) {
      const dayColumn = document.createElement('div');
      dayColumn.className = 'relative border-l';
      grid.appendChild(dayColumn);
    }
    
    container.append(header, grid);
    wrap.appendChild(container);
    return wrap;
  }

  function createMonthView() {
    const wrap = document.createElement('div');
    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-7 gap-1 bg-gray-50 p-1';
    
    const first = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const start = new Date(first);
    start.setDate(1 - first.getDay());
    
    // Create 42 day cells (6 weeks)
    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const faded = d.getMonth() !== currentDate.getMonth();
      
      const cell = document.createElement('div');
      cell.className = `bg-white p-3 min-h-[100px] ${faded ? 'text-gray-400' : ''}`;
      
      const dayNumber = document.createElement('div');
      dayNumber.className = 'text-sm font-medium mb-1';
      dayNumber.textContent = d.getDate();
      
      cell.appendChild(dayNumber);
      grid.appendChild(cell);
    }
    
    wrap.appendChild(grid);
    return wrap;
  }

  function switchView(v) {
    currentView = v;
    
    // Hide all views first
    dayView.style.display = 'none';
    if (weekWrap) { weekWrap.style.display = 'none'; }
    if (monthWrap) { monthWrap.style.display = 'none'; }

    // Show the selected view
    if (v === 'day') {
      dayView.style.display = 'grid';
    } else if (v === 'week') {
      if (!weekWrap) { weekWrap = createWeekView(); dayView.parentNode.appendChild(weekWrap); }
      weekWrap.style.display = 'block';
    } else if (v === 'month') {
      if (!monthWrap) { monthWrap = createMonthView(); dayView.parentNode.appendChild(monthWrap); }
      monthWrap.style.display = 'block';
    }

    setHeading();
    refreshAllViews();
  }

  // tab clicks
  monthTab.addEventListener('click', function() {
    monthTab.classList.add('bg-white','shadow'); 
    weekTab.classList.remove('bg-white','shadow'); 
    dayTab.classList.remove('bg-white','shadow'); 
    switchView('month'); 
  });
  weekTab.addEventListener('click', function() {
    weekTab.classList.add('bg-white','shadow'); 
    monthTab.classList.remove('bg-white','shadow'); 
    dayTab.classList.remove('bg-white','shadow'); 
    switchView('week');  
  });
  dayTab.addEventListener('click', function() {
    dayTab.classList.add('bg-white','shadow'); 
    weekTab.classList.remove('bg-white','shadow'); 
    monthTab.classList.remove('bg-white','shadow'); 
    switchView('day');   
  });

  // navigation buttons
  prevBtn.addEventListener('click', function() {
    if (currentView === 'day') currentDate.setDate(currentDate.getDate() - 1);
    if (currentView === 'week') currentDate.setDate(currentDate.getDate() - 7);
    if (currentView === 'month') currentDate.setMonth(currentDate.getMonth() - 1);
    if (weekWrap && currentView === 'week') { 
      weekWrap.remove(); 
      weekWrap = null; 
    }
    if (monthWrap && currentView === 'month') { 
      monthWrap.remove(); 
      monthWrap = null; 
    }
    switchView(currentView);
    updateTodaysTodoList();
  });
  
  nextBtn.addEventListener('click', function() {
    if (currentView === 'day') currentDate.setDate(currentDate.getDate() + 1);
    if (currentView === 'week') currentDate.setDate(currentDate.getDate() + 7);
    if (currentView === 'month') currentDate.setMonth(currentDate.getMonth() + 1);
    if (weekWrap && currentView === 'week') { 
      weekWrap.remove(); 
      weekWrap = null; 
    }
    if (monthWrap && currentView === 'month') { 
      monthWrap.remove(); 
      monthWrap = null; 
    }
    switchView(currentView);
    updateTodaysTodoList();
  });
  
  todayBtn.addEventListener('click', function() {
    currentDate = new Date();
    if (weekWrap && currentView === 'week') { 
      weekWrap.remove(); 
      weekWrap = null; 
    }
    if (monthWrap && currentView === 'month') { 
      monthWrap.remove(); 
      monthWrap = null; 
    }
    switchView(currentView);
    updateTodaysTodoList();
  });

  // initialize
  setHeading();
  switchView('week');
}
