/*
THIS IS A GENERATED/BUNDLE FILE BY ESBUILD
*/

var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => SchedulePlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian8 = require("obsidian");

// src/types.ts
var DEFAULT_PRIORITY_COLORS = {
  high: "#e74c3c",
  medium: "#e67e22",
  low: "#3498db"
};
var DEFAULT_SETTINGS = {
  storageGranularity: "month",
  basePath: "\u65E5\u7A0B",
  completedDisplay: "strikethrough",
  weekStartsOn: 1,
  priorityColors: { ...DEFAULT_PRIORITY_COLORS },
  backgroundImage: "",
  backgroundOpacity: 0.15,
  showWeekendHighlight: true,
  showFestivalHighlight: true,
  showTaskCountBadge: true
};
var VIEW_TYPE_SCHEDULE_MAIN = "schedule-calendar-main";
var VIEW_TYPE_SCHEDULE_SIDEBAR = "schedule-calendar-sidebar";

// src/views/CalendarView.ts
var import_obsidian4 = require("obsidian");

// src/components/ViewSwitcher.ts
var ViewSwitcherComponent = class {
  constructor(currentMode, onSwitch) {
    this.currentMode = currentMode;
    this.onSwitch = onSwitch;
    this.el = this.render();
  }
  getElement() {
    return this.el;
  }
  setMode(mode) {
    this.currentMode = mode;
    this.el.querySelectorAll(".schedule-view-btn").forEach((btn) => {
      btn.removeClass("is-active");
    });
    const activeBtn = this.el.querySelector(
      `.schedule-view-btn[data-mode="${mode}"]`
    );
    if (activeBtn)
      activeBtn.addClass("is-active");
  }
  render() {
    const container = createDiv({ cls: "schedule-view-switcher" });
    const monthBtn = container.createEl("button", {
      cls: `schedule-view-btn ${this.currentMode === "month" ? "is-active" : ""}`,
      text: "\u6708",
      attr: { "data-mode": "month" }
    });
    monthBtn.addEventListener("click", () => {
      this.setMode("month");
      this.onSwitch("month");
    });
    const weekBtn = container.createEl("button", {
      cls: `schedule-view-btn ${this.currentMode === "week" ? "is-active" : ""}`,
      text: "\u5468",
      attr: { "data-mode": "week" }
    });
    weekBtn.addEventListener("click", () => {
      this.setMode("week");
      this.onSwitch("week");
    });
    return container;
  }
};

// src/constants.ts
var PRIORITY_CONFIG = {
  high: {
    label: "\u9AD8",
    color: "#e74c3c",
    colorBg: "#fde8e8",
    colorBorder: "#f5b7b1"
  },
  medium: {
    label: "\u4E2D",
    color: "#e67e22",
    colorBg: "#fef5e7",
    colorBorder: "#f8c471"
  },
  low: {
    label: "\u4F4E",
    color: "#3498db",
    colorBg: "#ebf5fb",
    colorBorder: "#a9d0f5"
  }
};
var PRIORITY_ORDER = ["high", "medium", "low"];
var DAY_HEADERS = ["\u65E5", "\u4E00", "\u4E8C", "\u4E09", "\u56DB", "\u4E94", "\u516D"];
var STORAGE_GRANULARITY_LABELS = {
  month: "\u6309\u6708",
  week: "\u6309\u5468",
  year: "\u6309\u5E74"
};
var COMPLETED_DISPLAY_LABELS = {
  strikethrough: "\u5212\u6389\u4FDD\u7559",
  "hidden-toggle": "\u9690\u85CF\uFF08\u53EF\u5207\u6362\uFF09"
};
var CONTEXT_MENU_LABELS = {
  copy: "\u590D\u5236",
  paste: "\u7C98\u8D34",
  moveNextDay: "\u79FB\u5230\u4E0B\u4E00\u5929",
  moveNextWeek: "\u79FB\u5230\u4E0B\u4E00\u5468"
};

// src/components/TodoItem.ts
var TodoItemComponent = class {
  constructor(config) {
    this.todo = config.todo;
    this.completedDisplay = config.completedDisplay;
    this.showCompleted = config.showCompleted;
    this.onToggle = config.onToggle;
    this.onClick = config.onClick;
    this.onContextMenu = config.onContextMenu;
    this.priorityColors = config.priorityColors;
    this.el = this.render();
  }
  getElement() {
    return this.el;
  }
  render() {
    var _a;
    const config = PRIORITY_CONFIG[this.todo.priority];
    const color = ((_a = this.priorityColors) == null ? void 0 : _a[this.todo.priority]) || config.color;
    const item = createDiv({
      cls: `schedule-todo-item ${this.todo.completed ? "is-completed" : ""}`
    });
    const bar = item.createDiv({ cls: "schedule-todo-priority" });
    bar.style.backgroundColor = color;
    const checkbox = item.createEl("input", {
      cls: "schedule-todo-checkbox",
      attr: { type: "checkbox" }
    });
    checkbox.checked = this.todo.completed;
    checkbox.addEventListener("change", (e) => {
      e.stopPropagation();
      this.onToggle(this.todo.id);
    });
    item.createSpan({
      cls: "schedule-todo-title",
      text: this.todo.title,
      attr: { title: this.todo.title }
    });
    item.addEventListener("click", (e) => {
      if (e.target.tagName === "INPUT")
        return;
      this.onClick(this.todo);
    });
    item.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.onContextMenu(this.todo, e);
    });
    if (this.todo.completed && !this.showCompleted) {
      item.addClass("schedule-todo-hidden");
    }
    return item;
  }
};

// src/utils/date-utils.ts
function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}
function formatDate(year, month, day) {
  const m = String(month + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}
function dateToStr(date) {
  return formatDate(date.getFullYear(), date.getMonth(), date.getDate());
}
function strToDate(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function getISOWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 864e5 + 1) / 7);
  return { year: d.getUTCFullYear(), week: weekNo };
}
function getWeekKey(date) {
  const { year, week } = getISOWeek(date);
  return `${year}-W${String(week).padStart(2, "0")}`;
}
function getMonthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}
function getYearKey(date) {
  return String(date.getFullYear());
}
function getPeriodKey(date, granularity) {
  switch (granularity) {
    case "month":
      return getMonthKey(date);
    case "week":
      return getWeekKey(date);
    case "year":
      return getYearKey(date);
  }
}
function getWeekDates(date, weekStartsOn) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
  d.setDate(d.getDate() - diff);
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const clone = new Date(d);
    clone.setDate(d.getDate() + i);
    dates.push(clone);
  }
  return dates;
}
function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function isToday(date) {
  return isSameDay(date, new Date());
}
function isInMonth(date, year, month) {
  return date.getFullYear() === year && date.getMonth() === month;
}
function getPeriodKeysBetween(startDate, endDate, granularity) {
  const keys = /* @__PURE__ */ new Set();
  const d = new Date(startDate);
  while (d <= endDate) {
    keys.add(getPeriodKey(d, granularity));
    d.setDate(d.getDate() + 1);
  }
  return Array.from(keys);
}
function formatDisplayDate(date) {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekDays = ["\u5468\u65E5", "\u5468\u4E00", "\u5468\u4E8C", "\u5468\u4E09", "\u5468\u56DB", "\u5468\u4E94", "\u5468\u516D"];
  const weekDay = weekDays[date.getDay()];
  return `${month}\u6708${day}\u65E5 ${weekDay}`;
}

// src/utils/holiday-utils.ts
var FESTIVALS_2026 = {
  "2026-01-01": "\u5143\u65E6",
  "2026-02-17": "\u9664\u5915",
  "2026-02-18": "\u6625\u8282",
  "2026-02-19": "\u521D\u4E8C",
  "2026-02-20": "\u521D\u4E09",
  "2026-04-05": "\u6E05\u660E\u8282",
  "2026-05-01": "\u52B3\u52A8\u8282",
  "2026-06-19": "\u7AEF\u5348\u8282",
  "2026-09-27": "\u4E2D\u79CB\u8282",
  "2026-10-01": "\u56FD\u5E86\u8282",
  "2026-10-02": "\u56FD\u5E86\u5047",
  "2026-10-03": "\u56FD\u5E86\u5047"
};
function getDayHolidayInfo(dateStr) {
  const date = new Date(dateStr + "T12:00:00");
  const dayOfWeek = date.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const festival = FESTIVALS_2026[dateStr] || null;
  return { festival, isWeekend };
}

// src/utils/todo-clipboard.ts
var _clipboard = null;
function copyTask(title, priority) {
  _clipboard = { title, priority };
}
function pasteTask() {
  return _clipboard ? { ..._clipboard } : null;
}
function hasCopiedTask() {
  return _clipboard !== null;
}

// src/components/DayCell.ts
var DayCellComponent = class {
  constructor(config) {
    this.date = config.date;
    this.year = config.year;
    this.month = config.month;
    this.todos = config.todos;
    this.completedDisplay = config.completedDisplay;
    this.showCompleted = config.showCompleted;
    this.isSelected = config.isSelected;
    this.onToggle = config.onToggle;
    this.onTodoClick = config.onTodoClick;
    this.onTodoContextMenu = config.onTodoContextMenu;
    this.onDateClick = config.onDateClick;
    this.onDateRightClick = config.onDateRightClick;
    this.priorityColors = config.priorityColors;
    this.showBadge = config.showBadge !== false;
    this.el = this.render();
  }
  getElement() {
    return this.el;
  }
  sortByPriority(todos) {
    return [...todos].sort((a, b) => {
      return PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority);
    });
  }
  render() {
    const dayNum = this.date.getDate();
    const dateStr = formatDate(this.date.getFullYear(), this.date.getMonth(), dayNum);
    const today = isToday(this.date);
    const inMonth = isInMonth(this.date, this.year, this.month);
    const { festival, isWeekend } = getDayHolidayInfo(dateStr);
    let visibleTodos = this.todos.filter((t) => t.date === dateStr);
    const actualCount = visibleTodos.length;
    if (!this.showCompleted) {
      visibleTodos = visibleTodos.filter((t) => !t.completed);
    }
    visibleTodos = this.sortByPriority(visibleTodos);
    const cell = createDiv({
      cls: `schedule-day-cell ${today ? "is-today" : ""} ${!inMonth ? "is-other-month" : ""} ${this.isSelected ? "is-selected" : ""} ${isWeekend ? "is-weekend" : ""} ${festival ? "is-festival" : ""}`
    });
    const header = cell.createDiv({ cls: "schedule-day-header" });
    header.createSpan({ cls: "schedule-day-number", text: String(dayNum) });
    if (festival)
      header.createSpan({ cls: "schedule-day-festival", text: festival });
    if (actualCount > 0 && this.showBadge) {
      header.createSpan({ cls: "schedule-day-badge", text: String(actualCount) });
    }
    const list = cell.createDiv({ cls: "schedule-todo-list" });
    visibleTodos.slice(0, 5).forEach((todo) => {
      const comp = new TodoItemComponent({
        todo,
        completedDisplay: this.completedDisplay,
        showCompleted: this.showCompleted,
        onToggle: this.onToggle,
        onClick: this.onTodoClick,
        onContextMenu: this.onTodoContextMenu,
        priorityColors: this.priorityColors
      });
      list.appendChild(comp.getElement());
    });
    const remaining = actualCount - visibleTodos.length;
    if (remaining > 0) {
      list.createDiv({ cls: "schedule-todo-more", text: `\u8FD8\u6709 ${remaining} \u9879...` });
    }
    cell.addEventListener("click", (e) => {
      if (e.target.closest(".schedule-todo-item"))
        return;
      this.onDateClick(dateStr);
    });
    cell.addEventListener("contextmenu", (e) => {
      if (e.target.closest(".schedule-todo-item"))
        return;
      if (hasCopiedTask()) {
        e.preventDefault();
        this.onDateRightClick(dateStr, e);
      }
    });
    return cell;
  }
};

// src/components/CalendarGrid.ts
var CalendarGridComponent = class {
  constructor(config) {
    this.year = config.year;
    this.month = config.month;
    this.weekStartsOn = config.weekStartsOn;
    this.todos = config.todos;
    this.completedDisplay = config.completedDisplay;
    this.showCompleted = config.showCompleted;
    this.selectedDate = config.selectedDate;
    this.onToggle = config.onToggle;
    this.onTodoClick = config.onTodoClick;
    this.onTodoContextMenu = config.onTodoContextMenu;
    this.onDateClick = config.onDateClick;
    this.onDateRightClick = config.onDateRightClick;
    this.priorityColors = config.priorityColors;
    this.showBadge = config.showBadge !== false;
    this.el = this.render();
  }
  getElement() {
    return this.el;
  }
  refresh() {
    const newEl = this.render();
    this.el.replaceWith(newEl);
    this.el = newEl;
  }
  render() {
    const container = createDiv({ cls: "schedule-calendar-grid" });
    const headerRow = container.createDiv({ cls: "schedule-grid-row schedule-grid-header" });
    this.buildDayHeaders().forEach((day) => {
      headerRow.createDiv({ cls: "schedule-grid-cell schedule-header-cell", text: day });
    });
    const daysInMonth = getDaysInMonth(this.year, this.month);
    const firstDay = getFirstDayOfMonth(this.year, this.month);
    let startOffset = firstDay - this.weekStartsOn;
    if (startOffset < 0)
      startOffset += 7;
    const prevMonth = this.month === 0 ? 11 : this.month - 1;
    const prevYear = this.month === 0 ? this.year - 1 : this.year;
    const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);
    const totalCells = startOffset + daysInMonth;
    const totalRows = Math.ceil(totalCells / 7);
    let dayCounter = 1, nextMonthDay = 1;
    for (let row = 0; row < totalRows; row++) {
      const rowEl = container.createDiv({ cls: "schedule-grid-row" });
      for (let col = 0; col < 7; col++) {
        const idx = row * 7 + col;
        let cellDate;
        if (idx < startOffset) {
          cellDate = new Date(prevYear, prevMonth, daysInPrevMonth - startOffset + idx + 1);
        } else if (idx < startOffset + daysInMonth) {
          cellDate = new Date(this.year, this.month, dayCounter++);
        } else {
          const nm = this.month === 11 ? 0 : this.month + 1;
          const ny = this.month === 11 ? this.year + 1 : this.year;
          cellDate = new Date(ny, nm, nextMonthDay++);
        }
        const ds = formatDate(cellDate.getFullYear(), cellDate.getMonth(), cellDate.getDate());
        const cell = new DayCellComponent({
          date: cellDate,
          year: this.year,
          month: this.month,
          todos: this.todos,
          completedDisplay: this.completedDisplay,
          showCompleted: this.showCompleted,
          isSelected: this.selectedDate === ds,
          onToggle: this.onToggle,
          onTodoClick: this.onTodoClick,
          onTodoContextMenu: this.onTodoContextMenu,
          onDateClick: this.onDateClick,
          onDateRightClick: this.onDateRightClick,
          priorityColors: this.priorityColors,
          showBadge: this.showBadge
        });
        rowEl.appendChild(cell.getElement());
      }
    }
    return container;
  }
  buildDayHeaders() {
    const h = [];
    for (let i = 0; i < 7; i++)
      h.push(DAY_HEADERS[(this.weekStartsOn + i) % 7]);
    return h;
  }
};

// src/views/WeekView.ts
var WeekViewComponent = class {
  constructor(config) {
    this.focusDate = config.focusDate;
    this.weekStartsOn = config.weekStartsOn;
    this.allTodos = config.todos;
    this.completedDisplay = config.completedDisplay;
    this.showCompleted = config.showCompleted;
    this.onToggle = config.onToggle;
    this.onTodoClick = config.onTodoClick;
    this.onTodoContextMenu = config.onTodoContextMenu;
    this.onNavigate = config.onNavigate;
    this.el = this.render();
  }
  getElement() {
    return this.el;
  }
  refresh(config) {
    this.focusDate = config.focusDate;
    this.allTodos = config.todos;
    this.completedDisplay = config.completedDisplay;
    this.showCompleted = config.showCompleted;
    const newEl = this.render();
    this.el.replaceWith(newEl);
    this.el = newEl;
  }
  render() {
    const container = createDiv({ cls: "schedule-week-view" });
    const nav = container.createDiv({ cls: "schedule-week-nav" });
    const prevBtn = nav.createEl("button", { cls: "schedule-nav-btn", text: "\u25C0" });
    prevBtn.addEventListener("click", () => this.onNavigate("prev"));
    const weekDates = getWeekDates(this.focusDate, this.weekStartsOn);
    const sd = weekDates[0], ed = weekDates[6];
    nav.createSpan({ cls: "schedule-week-title", text: `${sd.getMonth() + 1}\u6708${sd.getDate()}\u65E5 - ${ed.getMonth() + 1}\u6708${ed.getDate()}\u65E5` });
    const nextBtn = nav.createEl("button", { cls: "schedule-nav-btn", text: "\u25B6" });
    nextBtn.addEventListener("click", () => this.onNavigate("next"));
    const daysContainer = container.createDiv({ cls: "schedule-week-days" });
    const todayStr = dateToStr(new Date());
    weekDates.forEach((date) => {
      const dateStr = formatDate(date.getFullYear(), date.getMonth(), date.getDate());
      const isToday2 = dateStr === todayStr;
      const dayCol = daysContainer.createDiv({ cls: `schedule-week-day ${isToday2 ? "is-today" : ""}` });
      const dayHeader = dayCol.createDiv({ cls: "schedule-week-day-header" });
      dayHeader.createSpan({ cls: "schedule-week-day-name", text: formatDisplayDate(date) });
      let dayTodos = this.allTodos.filter((t) => t.date === dateStr);
      if (!this.showCompleted)
        dayTodos = dayTodos.filter((t) => !t.completed);
      const todoList = dayCol.createDiv({ cls: "schedule-week-todo-list" });
      if (dayTodos.length === 0) {
        todoList.createSpan({ cls: "schedule-week-empty", text: "\u6682\u65E0\u5F85\u529E" });
      } else {
        dayTodos.forEach((todo) => {
          const comp = new TodoItemComponent({
            todo,
            completedDisplay: this.completedDisplay,
            showCompleted: this.showCompleted,
            onToggle: this.onToggle,
            onClick: this.onTodoClick,
            onContextMenu: this.onTodoContextMenu
          });
          todoList.appendChild(comp.getElement());
        });
      }
    });
    return container;
  }
};

// src/modals/AddTodoModal.ts
var import_obsidian = require("obsidian");
var AddTodoModal = class extends import_obsidian.Modal {
  constructor(app, defaultDate, onSubmit) {
    super(app);
    this.titleInput = "";
    this.selectedPriority = "medium";
    this.dateInput = defaultDate;
    this.onSubmit = onSubmit;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.addClass("schedule-modal");
    contentEl.empty();
    contentEl.createEl("h3", { text: "\u6DFB\u52A0\u5F85\u529E" });
    new import_obsidian.Setting(contentEl).setName("\u5F85\u529E\u5185\u5BB9").addText((text) => {
      text.setPlaceholder("\u8F93\u5165\u5F85\u529E\u4E8B\u9879...").setValue(this.titleInput).onChange((value) => {
        this.titleInput = value;
      });
      setTimeout(() => {
        var _a;
        return (_a = text.inputEl) == null ? void 0 : _a.focus();
      }, 100);
    });
    new import_obsidian.Setting(contentEl).setName("\u65E5\u671F").addText((text) => {
      text.setValue(this.dateInput);
      text.inputEl.type = "date";
      text.onChange((value) => {
        this.dateInput = value;
      });
    });
    const prioritySetting = new import_obsidian.Setting(contentEl).setName("\u4F18\u5148\u7EA7").setDesc("\u9009\u62E9\u4EFB\u52A1\u7684\u4F18\u5148\u7EA7");
    const priorityContainer = prioritySetting.controlEl.createDiv({
      cls: "schedule-priority-selector"
    });
    PRIORITY_ORDER.forEach((priority) => {
      const config = PRIORITY_CONFIG[priority];
      const btn = priorityContainer.createEl("button", {
        cls: `schedule-priority-btn ${priority === this.selectedPriority ? "is-active" : ""}`,
        text: config.label
      });
      btn.style.setProperty("--priority-color", config.color);
      btn.style.setProperty("--priority-bg", config.colorBg);
      btn.style.setProperty("--priority-border", config.colorBorder);
      btn.addEventListener("click", () => {
        this.selectedPriority = priority;
        priorityContainer.querySelectorAll(".schedule-priority-btn").forEach((b) => {
          b.removeClass("is-active");
        });
        btn.addClass("is-active");
      });
    });
    const buttonContainer = contentEl.createDiv({
      cls: "schedule-modal-buttons"
    });
    const cancelBtn = buttonContainer.createEl("button", {
      text: "\u53D6\u6D88",
      cls: "schedule-btn schedule-btn-cancel"
    });
    cancelBtn.addEventListener("click", () => this.close());
    const confirmBtn = buttonContainer.createEl("button", {
      text: "\u6DFB\u52A0",
      cls: "schedule-btn schedule-btn-primary"
    });
    confirmBtn.addEventListener("click", () => {
      if (!this.titleInput.trim()) {
        return;
      }
      this.onSubmit({
        title: this.titleInput.trim(),
        date: this.dateInput,
        priority: this.selectedPriority
      });
      this.close();
    });
    contentEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && this.titleInput.trim()) {
        confirmBtn.click();
      }
    });
  }
  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
};

// src/modals/EditTodoModal.ts
var import_obsidian2 = require("obsidian");
var EditTodoModal = class extends import_obsidian2.Modal {
  constructor(app, todo, onSave) {
    super(app);
    this.titleInput = todo.title;
    this.dateInput = todo.date;
    this.selectedPriority = todo.priority;
    this.onSave = onSave;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.addClass("schedule-modal");
    contentEl.empty();
    contentEl.createEl("h3", { text: "\u7F16\u8F91\u5F85\u529E" });
    new import_obsidian2.Setting(contentEl).setName("\u5F85\u529E\u5185\u5BB9").addText((text) => {
      text.setValue(this.titleInput).onChange((value) => {
        this.titleInput = value;
      });
      setTimeout(() => {
        var _a;
        return (_a = text.inputEl) == null ? void 0 : _a.focus();
      }, 100);
    });
    new import_obsidian2.Setting(contentEl).setName("\u65E5\u671F").addText((text) => {
      text.setValue(this.dateInput);
      text.inputEl.type = "date";
      text.onChange((value) => {
        this.dateInput = value;
      });
    });
    const prioritySetting = new import_obsidian2.Setting(contentEl).setName("\u4F18\u5148\u7EA7");
    const priorityContainer = prioritySetting.controlEl.createDiv({ cls: "schedule-priority-selector" });
    PRIORITY_ORDER.forEach((priority) => {
      const config = PRIORITY_CONFIG[priority];
      const btn = priorityContainer.createEl("button", {
        cls: `schedule-priority-btn ${priority === this.selectedPriority ? "is-active" : ""}`,
        text: config.label
      });
      btn.style.setProperty("--priority-color", config.color);
      btn.style.setProperty("--priority-bg", config.colorBg);
      btn.style.setProperty("--priority-border", config.colorBorder);
      btn.addEventListener("click", () => {
        this.selectedPriority = priority;
        priorityContainer.querySelectorAll(".schedule-priority-btn").forEach((b) => b.removeClass("is-active"));
        btn.addClass("is-active");
      });
    });
    const buttonContainer = contentEl.createDiv({ cls: "schedule-modal-buttons" });
    const cancelBtn = buttonContainer.createEl("button", { text: "\u53D6\u6D88", cls: "schedule-btn schedule-btn-cancel" });
    cancelBtn.addEventListener("click", () => this.close());
    const saveBtn = buttonContainer.createEl("button", { text: "\u4FDD\u5B58", cls: "schedule-btn schedule-btn-primary" });
    saveBtn.addEventListener("click", () => {
      if (!this.titleInput.trim())
        return;
      this.onSave({
        title: this.titleInput.trim(),
        date: this.dateInput,
        priority: this.selectedPriority
      });
      this.close();
    });
  }
  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
};

// src/services/TodoService.ts
var import_obsidian3 = require("obsidian");

// src/utils/id-utils.ts
var counter = 0;
function generateId() {
  counter = (counter + 1) % 1e4;
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 6);
  return `${ts}-${rand}-${counter}`;
}

// src/services/TodoService.ts
var SCHEDULE_EVENT_TODOS_CHANGED = "schedule:todos-changed";
var TodoService = class {
  constructor(app, settings) {
    this.app = app;
    this.settings = settings;
  }
  /**
   * 触发数据变更事件（用于同步主标签页和侧边栏）
   */
  notifyChanged() {
    this.app.workspace.trigger(SCHEDULE_EVENT_TODOS_CHANGED);
  }
  /**
   * 获取时间段对应的笔记文件路径
   */
  getNotePath(periodKey) {
    const { basePath } = this.settings();
    return (0, import_obsidian3.normalizePath)(`${basePath}/${periodKey}.md`);
  }
  /**
   * 构建 Markdown 笔记内容（可读格式）
   */
  buildNoteContent(periodKey, todos) {
    const lines = [
      "---",
      "type: schedule",
      `period: ${periodKey}`,
      "generated: true",
      "---",
      ""
    ];
    if (todos.length === 0) {
      lines.push("_\u6682\u65E0\u5F85\u529E_", "");
      return lines.join("\n");
    }
    const byDate = /* @__PURE__ */ new Map();
    for (const t of todos) {
      if (!byDate.has(t.date))
        byDate.set(t.date, []);
      byDate.get(t.date).push(t);
    }
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const sortedDates = Array.from(byDate.keys()).sort();
    for (const date of sortedDates) {
      lines.push(`## ${date}`, "");
      const items = byDate.get(date).sort((a, b) => {
        var _a, _b;
        return ((_a = priorityOrder[a.priority]) != null ? _a : 2) - ((_b = priorityOrder[b.priority]) != null ? _b : 2);
      });
      for (const t of items) {
        const check = t.completed ? "x" : " ";
        lines.push(`- [${check}] ${t.title} <!-- ${t.id} ${t.priority} ${t.createdAt} ${t.updatedAt} -->`);
      }
      lines.push("");
    }
    return lines.join("\n") + "\n";
  }
  /**
   * 从 Markdown 内容中解析待办数据
   */
  parseTodosFromContent(content) {
    var _a;
    const todos = [];
    const lines = content.split("\n");
    let currentDate = "";
    let inCodeBlock = false;
    for (const rawLine of lines) {
      const line = rawLine.trimEnd();
      if (line.startsWith("```")) {
        inCodeBlock = !inCodeBlock;
        continue;
      }
      if (inCodeBlock)
        continue;
      if (line.startsWith("---") && currentDate === "")
        continue;
      const dateMatch = line.match(/^## (\d{4}-\d{2}-\d{2})/);
      if (dateMatch) {
        currentDate = dateMatch[1];
        continue;
      }
      const taskMatch = line.match(/^- \[([ x])\] (.+?)\s*<!--\s*(.+?)\s*-->$/);
      if (taskMatch && currentDate) {
        const completed = taskMatch[1] === "x";
        const title = taskMatch[2].trim();
        const metaStr = taskMatch[3].trim();
        const parts = metaStr.split(/\s+/);
        const id = parts[0] || generateId();
        const priority = ["high", "medium", "low"].includes(parts[1]) ? parts[1] : "medium";
        const createdAt = parts[2] || new Date().toISOString();
        const updatedAt = parts[3] || createdAt;
        todos.push({ id, title, date: currentDate, priority, completed, createdAt, updatedAt });
      }
    }
    if (todos.length === 0) {
      const jsonMatch = content.match(/```json\n([\s\S]*?)```/);
      if (jsonMatch) {
        try {
          const data = JSON.parse(jsonMatch[1]);
          if ((_a = data == null ? void 0 : data.todos) == null ? void 0 : _a.length)
            return data.todos;
        } catch (e) {
        }
      }
    }
    return todos;
  }
  async ensureDirectory(path) {
    const dir = path.substring(0, path.lastIndexOf("/"));
    if (!dir)
      return;
    const exists = await this.app.vault.adapter.exists(dir);
    if (!exists)
      await this.app.vault.adapter.mkdir(dir);
  }
  async loadTodosByPeriod(periodKey) {
    const path = this.getNotePath(periodKey);
    try {
      const exists = await this.app.vault.adapter.exists(path);
      if (!exists)
        return [];
      const content = await this.app.vault.adapter.read(path);
      return this.parseTodosFromContent(content);
    } catch (err) {
      console.warn(`\u8BFB\u53D6\u65E5\u7A0B\u7B14\u8BB0\u5931\u8D25 (${path}):`, err);
      return [];
    }
  }
  async saveTodosByPeriod(periodKey, todos) {
    const path = this.getNotePath(periodKey);
    const content = this.buildNoteContent(periodKey, todos);
    await this.ensureDirectory(path);
    try {
      await this.app.vault.adapter.write(path, content);
    } catch (err) {
      console.error(`\u4FDD\u5B58\u65E5\u7A0B\u7B14\u8BB0\u5931\u8D25 (${path}):`, err);
    }
  }
  getPeriodKeyForDate(dateStr) {
    const { storageGranularity } = this.settings();
    return getPeriodKey(strToDate(dateStr), storageGranularity);
  }
  async loadTodosForDateRange(startDate, endDate) {
    const { storageGranularity } = this.settings();
    const periodKeys = getPeriodKeysBetween(strToDate(startDate), strToDate(endDate), storageGranularity);
    const allTodos = [];
    for (const key of periodKeys) {
      const todos = await this.loadTodosByPeriod(key);
      allTodos.push(...todos);
    }
    return allTodos.filter((t) => t.date >= startDate && t.date <= endDate);
  }
  async loadTodosForMonth(year, month) {
    const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const endDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(daysInMonth).padStart(2, "0")}`;
    return this.loadTodosForDateRange(startDate, endDate);
  }
  async addTodo(data) {
    const now = new Date().toISOString();
    const todo = {
      id: generateId(),
      title: data.title.trim(),
      date: data.date,
      priority: data.priority,
      completed: false,
      createdAt: now,
      updatedAt: now
    };
    const periodKey = this.getPeriodKeyForDate(data.date);
    const todos = await this.loadTodosByPeriod(periodKey);
    todos.push(todo);
    await this.saveTodosByPeriod(periodKey, todos);
    this.notifyChanged();
    return todo;
  }
  async findTodoById(id) {
    const now = new Date();
    for (let offset = -6; offset <= 6; offset++) {
      const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
      const key = getPeriodKey(d, this.settings().storageGranularity);
      const todos = await this.loadTodosByPeriod(key);
      const idx = todos.findIndex((t) => t.id === id);
      if (idx !== -1)
        return { todos, idx, periodKey: key };
    }
    return null;
  }
  async toggleTodo(id) {
    const found = await this.findTodoById(id);
    if (!found)
      return null;
    found.todos[found.idx].completed = !found.todos[found.idx].completed;
    found.todos[found.idx].updatedAt = new Date().toISOString();
    await this.saveTodosByPeriod(found.periodKey, found.todos);
    this.notifyChanged();
    return found.todos[found.idx];
  }
  async updateTodo(id, changes) {
    const found = await this.findTodoById(id);
    if (!found)
      return null;
    const oldDate = found.todos[found.idx].date;
    Object.assign(found.todos[found.idx], changes, { updatedAt: new Date().toISOString() });
    if (changes.date && changes.date !== oldDate) {
      const [moved] = found.todos.splice(found.idx, 1);
      await this.saveTodosByPeriod(found.periodKey, found.todos);
      const newKey = this.getPeriodKeyForDate(changes.date);
      const newTodos = await this.loadTodosByPeriod(newKey);
      newTodos.push(moved);
      await this.saveTodosByPeriod(newKey, newTodos);
      this.notifyChanged();
      return moved;
    }
    await this.saveTodosByPeriod(found.periodKey, found.todos);
    this.notifyChanged();
    return found.todos[found.idx];
  }
  async deleteTodo(id) {
    const found = await this.findTodoById(id);
    if (!found)
      return false;
    found.todos.splice(found.idx, 1);
    await this.saveTodosByPeriod(found.periodKey, found.todos);
    this.notifyChanged();
    return true;
  }
  async loadDateSummary(year, month) {
    const todos = await this.loadTodosForMonth(year, month);
    const summary = /* @__PURE__ */ new Map();
    for (const t of todos)
      summary.set(t.date, (summary.get(t.date) || 0) + 1);
    return summary;
  }
};

// src/views/CalendarView.ts
var CalendarView = class extends import_obsidian4.ItemView {
  constructor(leaf, todoService, getSettings) {
    super(leaf);
    this.viewMode = "month";
    this.todos = [];
    this.showAll = true;
    this.gridComp = null;
    this.weekComp = null;
    this.scheduleContentEl = null;
    this.todoService = todoService;
    this.getSettings = getSettings;
    const now = new Date();
    this.currentYear = now.getFullYear();
    this.currentMonth = now.getMonth();
    this.selectedDate = dateToStr(now);
    this.showAll = this.getSettings().completedDisplay === "strikethrough";
  }
  getViewType() {
    return VIEW_TYPE_SCHEDULE_MAIN;
  }
  getDisplayText() {
    return "Planboard";
  }
  getIcon() {
    return "calendar";
  }
  async onOpen() {
    this.registerEvent(
      this.app.workspace.on(SCHEDULE_EVENT_TODOS_CHANGED, () => this.loadTodos())
    );
    this.renderView();
    await this.loadTodos();
  }
  async onClose() {
  }
  renderView() {
    const c = this.containerEl;
    c.empty();
    c.addClass("schedule-container");
    this.applyBackground(c);
    const topBar = c.createDiv({ cls: "schedule-top-bar" });
    topBar.createSpan({ cls: "schedule-brand", text: "Planboard" });
    const toggleBtn = topBar.createEl("button", {
      cls: "schedule-toggle-completed",
      text: this.showAll ? "\u9690\u85CF\u5DF2\u5B8C\u6210" : "\u663E\u793A\u5DF2\u5B8C\u6210"
    });
    toggleBtn.addEventListener("click", () => {
      this.showAll = !this.showAll;
      toggleBtn.textContent = this.showAll ? "\u9690\u85CF\u5DF2\u5B8C\u6210" : "\u663E\u793A\u5DF2\u5B8C\u6210";
      this.refreshContent();
    });
    const navRow = c.createDiv({ cls: "schedule-nav-row" });
    const navGroup = navRow.createDiv({ cls: "schedule-nav-group" });
    const prevBtn = navGroup.createEl("button", { cls: "schedule-nav-btn", text: "\u25C0" });
    prevBtn.addEventListener("click", () => this.navigateMonth(-1));
    navGroup.createSpan({ cls: "schedule-header-title", text: `${this.currentYear}\u5E74 ${this.currentMonth + 1}\u6708` });
    const nextBtn = navGroup.createEl("button", { cls: "schedule-nav-btn", text: "\u25B6" });
    nextBtn.addEventListener("click", () => this.navigateMonth(1));
    const actionGroup = navRow.createDiv({ cls: "schedule-action-group" });
    const addBtn = actionGroup.createEl("button", { cls: "schedule-add-btn", text: "+" });
    addBtn.addEventListener("click", () => this.openAddModal());
    const switcher = new ViewSwitcherComponent(this.viewMode, (mode) => {
      this.viewMode = mode;
      this.refreshContent();
    });
    actionGroup.appendChild(switcher.getElement());
    const todayBtn = actionGroup.createEl("button", { cls: "schedule-today-btn", text: "\u4ECA\u65E5" });
    todayBtn.addEventListener("click", () => this.goToToday());
    this.scheduleContentEl = c.createDiv({ cls: "schedule-content" });
    this.renderContent();
  }
  applyBackground(c) {
    const bg = this.getSettings().backgroundImage;
    if (bg) {
      c.style.backgroundImage = `url(${bg})`;
      c.style.backgroundSize = "cover";
      c.style.backgroundPosition = "center";
      c.style.backgroundRepeat = "no-repeat";
    } else {
      c.style.backgroundImage = "";
    }
  }
  /* ---- 右键菜单 ---- */
  showTodoContextMenu(todo, event) {
    const menu = new import_obsidian4.Menu();
    menu.addItem(
      (item) => item.setTitle(CONTEXT_MENU_LABELS.copy).setIcon("copy").onClick(() => copyTask(todo.title, todo.priority))
    );
    menu.addItem(
      (item) => item.setTitle(CONTEXT_MENU_LABELS.moveNextDay).setIcon("arrow-right").onClick(async () => {
        const d = new Date(
          parseInt(todo.date.substring(0, 4)),
          parseInt(todo.date.substring(5, 7)) - 1,
          parseInt(todo.date.substring(8, 10))
        );
        d.setDate(d.getDate() + 1);
        await this.todoService.updateTodo(todo.id, { date: dateToStr(d) });
        await this.loadTodos();
      })
    );
    menu.addItem(
      (item) => item.setTitle(CONTEXT_MENU_LABELS.moveNextWeek).setIcon("arrow-right").onClick(async () => {
        const d = new Date(
          parseInt(todo.date.substring(0, 4)),
          parseInt(todo.date.substring(5, 7)) - 1,
          parseInt(todo.date.substring(8, 10))
        );
        d.setDate(d.getDate() + 7);
        await this.todoService.updateTodo(todo.id, { date: dateToStr(d) });
        await this.loadTodos();
      })
    );
    menu.addItem(
      (item) => item.setTitle("\u5220\u9664").setIcon("trash").onClick(async () => {
        const confirmModal = new ConfirmDeleteModal(this.app, todo.title, async () => {
          await this.todoService.deleteTodo(todo.id);
          await this.loadTodos();
        });
        confirmModal.open();
      })
    );
    menu.showAtMouseEvent(event);
  }
  showDateRightClickMenu(date, event) {
    const menu = new import_obsidian4.Menu();
    menu.addItem(
      (item) => item.setTitle(CONTEXT_MENU_LABELS.paste).setIcon("paste").onClick(async () => {
        const data = pasteTask();
        if (!data)
          return;
        await this.todoService.addTodo({
          title: data.title,
          date,
          priority: data.priority
        });
        await this.loadTodos();
      })
    );
    menu.showAtMouseEvent(event);
  }
  /* ---- 操作 ---- */
  openAddModal(date) {
    new AddTodoModal(this.app, date || this.selectedDate, async (result) => {
      await this.todoService.addTodo(result);
      await this.loadTodos();
    }).open();
  }
  renderContent() {
    if (!this.scheduleContentEl)
      return;
    this.scheduleContentEl.empty();
    const s = this.getSettings();
    if (this.viewMode === "month") {
      this.gridComp = new CalendarGridComponent({
        year: this.currentYear,
        month: this.currentMonth,
        weekStartsOn: s.weekStartsOn,
        todos: this.todos,
        completedDisplay: s.completedDisplay,
        showCompleted: this.showAll,
        selectedDate: this.selectedDate,
        onToggle: async (id) => {
          await this.todoService.toggleTodo(id);
          await this.loadTodos();
        },
        onTodoClick: (todo) => this.openEditModal(todo),
        onTodoContextMenu: (todo, e) => this.showTodoContextMenu(todo, e),
        onDateClick: (date) => {
          this.selectedDate = date;
          this.openAddModal(date);
        },
        onDateRightClick: (date, e) => this.showDateRightClickMenu(date, e),
        priorityColors: s.priorityColors,
        showBadge: s.showTaskCountBadge
      });
      this.scheduleContentEl.appendChild(this.gridComp.getElement());
    } else {
      const wd = new Date(
        parseInt(this.selectedDate.substring(0, 4)),
        parseInt(this.selectedDate.substring(5, 7)) - 1,
        parseInt(this.selectedDate.substring(8, 10))
      );
      this.weekComp = new WeekViewComponent({
        focusDate: wd,
        weekStartsOn: s.weekStartsOn,
        todos: this.todos,
        completedDisplay: s.completedDisplay,
        showCompleted: this.showAll,
        onToggle: async (id) => {
          await this.todoService.toggleTodo(id);
          await this.loadTodos();
        },
        onTodoClick: (todo) => this.openEditModal(todo),
        onTodoContextMenu: (todo, e) => this.showTodoContextMenu(todo, e),
        onNavigate: (dir) => {
          const nd = new Date(wd);
          nd.setDate(nd.getDate() + (dir === "next" ? 7 : -7));
          this.selectedDate = dateToStr(nd);
          this.loadTodos();
        }
      });
      this.scheduleContentEl.appendChild(this.weekComp.getElement());
    }
  }
  refreshContent() {
    this.renderContent();
  }
  navigateMonth(delta) {
    this.currentMonth += delta;
    if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    }
    this.updateTitle();
    this.loadTodos();
  }
  goToToday() {
    const now = new Date();
    this.currentYear = now.getFullYear();
    this.currentMonth = now.getMonth();
    this.selectedDate = dateToStr(now);
    this.updateTitle();
    this.loadTodos();
  }
  updateTitle() {
    const el = this.containerEl.querySelector(".schedule-header-title");
    if (el)
      el.textContent = `${this.currentYear}\u5E74 ${this.currentMonth + 1}\u6708`;
  }
  async loadTodos() {
    if (this.viewMode === "month") {
      this.todos = await this.todoService.loadTodosForMonth(this.currentYear, this.currentMonth);
    } else {
      const wd = new Date(
        parseInt(this.selectedDate.substring(0, 4)),
        parseInt(this.selectedDate.substring(5, 7)) - 1,
        parseInt(this.selectedDate.substring(8, 10))
      );
      const wds = getWeekDates(wd, this.getSettings().weekStartsOn);
      this.todos = await this.todoService.loadTodosForDateRange(dateToStr(wds[0]), dateToStr(wds[6]));
    }
    this.refreshContent();
  }
  openEditModal(todo) {
    new EditTodoModal(
      this.app,
      todo,
      async (ch) => {
        await this.todoService.updateTodo(todo.id, ch);
        await this.loadTodos();
      }
    ).open();
  }
};
var ConfirmDeleteModal = class extends import_obsidian4.Modal {
  constructor(app, title, onConfirm) {
    super(app);
    this.title = title;
    this.onConfirm = onConfirm;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.addClass("schedule-modal");
    contentEl.empty();
    contentEl.createEl("h3", { text: "\u786E\u8BA4\u5220\u9664" });
    contentEl.createEl("p", { text: `\u786E\u5B9A\u8981\u5220\u9664\u5F85\u529E\u300C${this.title}\u300D\u5417\uFF1F` });
    const btnContainer = contentEl.createDiv({ cls: "schedule-modal-buttons" });
    const cancelBtn = btnContainer.createEl("button", { text: "\u53D6\u6D88", cls: "schedule-btn schedule-btn-cancel" });
    cancelBtn.addEventListener("click", () => this.close());
    const deleteBtn = btnContainer.createEl("button", { text: "\u5220\u9664", cls: "schedule-btn schedule-btn-danger" });
    deleteBtn.addEventListener("click", () => {
      this.onConfirm();
      this.close();
    });
  }
  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
};

// src/views/SidebarView.ts
var import_obsidian5 = require("obsidian");
var SidebarView = class extends import_obsidian5.ItemView {
  constructor(leaf, todoService, getSettings) {
    super(leaf);
    this.dateSummary = /* @__PURE__ */ new Map();
    this.selectedDayTasks = [];
    this.showAll = true;
    this.todoService = todoService;
    this.getSettings = getSettings;
    const now = new Date();
    this.currentYear = now.getFullYear();
    this.currentMonth = now.getMonth();
    this.selectedDate = dateToStr(now);
    this.showAll = this.getSettings().completedDisplay === "strikethrough";
  }
  getViewType() {
    return VIEW_TYPE_SCHEDULE_SIDEBAR;
  }
  getDisplayText() {
    return "Planboard";
  }
  getIcon() {
    return "calendar";
  }
  async onOpen() {
    this.registerEvent(
      this.app.workspace.on(SCHEDULE_EVENT_TODOS_CHANGED, () => this.refreshData())
    );
    this.renderView();
    await this.refreshData();
  }
  async onClose() {
  }
  renderView() {
    const container = this.containerEl;
    container.empty();
    container.addClass("schedule-sidebar-container");
    const nav = container.createDiv({ cls: "schedule-sidebar-nav" });
    const prevBtn = nav.createEl("button", { cls: "schedule-s-nav-btn", text: "\u25C0" });
    prevBtn.addEventListener("click", () => this.navigateMonth(-1));
    this.headerTitleEl = nav.createSpan({
      cls: "schedule-s-header-title",
      text: `${this.currentYear}\u5E74${this.currentMonth + 1}\u6708`
    });
    const nextBtn = nav.createEl("button", { cls: "schedule-s-nav-btn", text: "\u25B6" });
    nextBtn.addEventListener("click", () => this.navigateMonth(1));
    const todayBtn = nav.createEl("button", { cls: "schedule-s-today-btn", text: "\u4ECA" });
    todayBtn.addEventListener("click", () => this.goToToday());
    const weekRow = container.createDiv({ cls: "schedule-s-week-row" });
    this.buildDayHeaders().forEach((day) => {
      weekRow.createSpan({ cls: "schedule-s-week-header", text: day });
    });
    this.calendarGridEl = container.createDiv({ cls: "schedule-s-grid" });
    container.createDiv({ cls: "schedule-s-divider" });
    this.taskListTitleEl = container.createDiv({ cls: "schedule-s-task-title" });
    this.taskListEl = container.createDiv({ cls: "schedule-s-task-list" });
  }
  async refreshData() {
    this.dateSummary = await this.todoService.loadDateSummary(this.currentYear, this.currentMonth);
    this.renderCalendarGrid();
    await this.refreshSelectedDayTasks();
  }
  async refreshSelectedDayTasks() {
    const allTodos = await this.todoService.loadTodosForMonth(this.currentYear, this.currentMonth);
    this.selectedDayTasks = allTodos.filter((t) => t.date === this.selectedDate);
    const d = new Date(
      parseInt(this.selectedDate.substring(0, 4)),
      parseInt(this.selectedDate.substring(5, 7)) - 1,
      parseInt(this.selectedDate.substring(8, 10))
    );
    const weekDays = ["\u5468\u65E5", "\u5468\u4E00", "\u5468\u4E8C", "\u5468\u4E09", "\u5468\u56DB", "\u5468\u4E94", "\u5468\u516D"];
    const { festival } = getDayHolidayInfo(this.selectedDate);
    this.taskListTitleEl.textContent = `${parseInt(this.selectedDate.substring(5, 7))}\u6708${parseInt(this.selectedDate.substring(8, 10))}\u65E5 ${weekDays[d.getDay()]}${festival ? ` \u{1F389}${festival}` : ""}`;
    this.renderTaskList();
  }
  renderTaskList() {
    this.taskListEl.empty();
    let visibleTasks = this.selectedDayTasks;
    if (!this.showAll) {
      visibleTasks = visibleTasks.filter((t) => !t.completed);
    }
    if (visibleTasks.length === 0) {
      this.taskListEl.createSpan({ cls: "schedule-s-empty", text: "\u2713 \u6682\u65E0\u5F85\u529E" });
      return;
    }
    visibleTasks.forEach((todo) => {
      const comp = new TodoItemComponent({
        todo,
        completedDisplay: this.getSettings().completedDisplay,
        showCompleted: this.showAll,
        onToggle: async (id) => {
          await this.todoService.toggleTodo(id);
          await this.refreshData();
        },
        onClick: () => {
        },
        onContextMenu: () => {
        }
      });
      this.taskListEl.appendChild(comp.getElement());
    });
  }
  renderCalendarGrid() {
    var _a;
    this.calendarGridEl.empty();
    const daysInMonth = getDaysInMonth(this.currentYear, this.currentMonth);
    const firstDay = getFirstDayOfMonth(this.currentYear, this.currentMonth);
    const weekStartsOn = this.getSettings().weekStartsOn;
    let startOffset = firstDay - weekStartsOn;
    if (startOffset < 0)
      startOffset += 7;
    const totalCells = startOffset + daysInMonth;
    const totalRows = Math.ceil(totalCells / 7);
    const prevMonth = this.currentMonth === 0 ? 11 : this.currentMonth - 1;
    const prevYear = this.currentMonth === 0 ? this.currentYear - 1 : this.currentYear;
    const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);
    let dayCounter = 1;
    let nextMonthDay = 1;
    const todayStr = dateToStr(new Date());
    for (let row = 0; row < totalRows && row < 6; row++) {
      const rowEl = this.calendarGridEl.createDiv({ cls: "schedule-s-row" });
      for (let col = 0; col < 7; col++) {
        const cellIndex = row * 7 + col;
        let cellDate, isOtherMonth = false, dayNum;
        if (cellIndex < startOffset) {
          dayNum = daysInPrevMonth - startOffset + cellIndex + 1;
          cellDate = new Date(prevYear, prevMonth, dayNum);
          isOtherMonth = true;
        } else if (cellIndex < startOffset + daysInMonth) {
          dayNum = dayCounter;
          cellDate = new Date(this.currentYear, this.currentMonth, dayCounter);
          dayCounter++;
        } else {
          dayNum = nextMonthDay;
          const nextM = this.currentMonth === 11 ? 0 : this.currentMonth + 1;
          const nextY = this.currentMonth === 11 ? this.currentYear + 1 : this.currentYear;
          cellDate = new Date(nextY, nextM, nextMonthDay);
          nextMonthDay++;
          isOtherMonth = true;
        }
        const dateStr = formatDate(cellDate.getFullYear(), cellDate.getMonth(), cellDate.getDate());
        const isToday2 = dateStr === todayStr;
        const isSelected = dateStr === this.selectedDate;
        const hasTasks = ((_a = this.dateSummary.get(dateStr)) != null ? _a : 0) > 0;
        const { festival, isWeekend } = getDayHolidayInfo(dateStr);
        const cell = rowEl.createDiv({
          cls: `schedule-s-cell ${isOtherMonth ? "is-other" : ""} ${isToday2 ? "is-today" : ""} ${isSelected ? "is-selected" : ""} ${isWeekend ? "is-weekend" : ""} ${festival ? "is-festival" : ""}`
        });
        cell.createSpan({ cls: "schedule-s-day-num", text: String(dayNum) });
        if (hasTasks) {
          cell.createSpan({ cls: "schedule-s-dot" });
        }
        if (festival) {
          cell.setAttr("aria-label", festival);
          cell.createSpan({ cls: "schedule-s-festival-name", text: festival.length <= 2 ? festival : "" });
        }
        cell.addEventListener("click", () => {
          this.selectedDate = dateStr;
          this.renderCalendarGrid();
          this.refreshSelectedDayTasks();
        });
      }
    }
  }
  buildDayHeaders() {
    const headers = [];
    const ws = this.getSettings().weekStartsOn;
    for (let i = 0; i < 7; i++)
      headers.push(DAY_HEADERS[(ws + i) % 7]);
    return headers;
  }
  navigateMonth(delta) {
    this.currentMonth += delta;
    if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    }
    this.headerTitleEl.textContent = `${this.currentYear}\u5E74${this.currentMonth + 1}\u6708`;
    this.refreshData();
  }
  goToToday() {
    const now = new Date();
    this.currentYear = now.getFullYear();
    this.currentMonth = now.getMonth();
    this.selectedDate = dateToStr(now);
    this.headerTitleEl.textContent = `${this.currentYear}\u5E74${this.currentMonth + 1}\u6708`;
    this.refreshData();
  }
};

// src/settings.ts
var import_obsidian7 = require("obsidian");

// src/modals/FolderSuggestModal.ts
var import_obsidian6 = require("obsidian");
var FolderSuggestModal = class extends import_obsidian6.FuzzySuggestModal {
  constructor(app, onSelect) {
    super(app);
    this.onSelect = onSelect;
    this.setPlaceholder("\u641C\u7D22\u6587\u4EF6\u5939...");
    this.setInstructions([{ command: "\u2191\u2193", purpose: "\u9009\u62E9" }, { command: "\u21B5", purpose: "\u786E\u8BA4" }]);
  }
  getItems() {
    const folders = this.app.vault.getAllLoadedFiles().filter((f) => f instanceof import_obsidian6.TFolder).map((f) => f.path).sort();
    return ["", ...folders];
  }
  getItemText(item) {
    return item || "/ (Vault \u6839\u76EE\u5F55)";
  }
  onChooseItem(item) {
    this.onSelect(item);
  }
};

// src/settings.ts
var ScheduleSettingTab = class extends import_obsidian7.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Planboard \u8BBE\u7F6E" });
    containerEl.createEl("h3", { text: "\u6570\u636E\u8BBE\u7F6E" });
    new import_obsidian7.Setting(containerEl).setName("\u5B58\u50A8\u7C92\u5EA6").setDesc("\u9009\u62E9\u5F85\u529E\u6570\u636E\u7684\u5B58\u50A8\u65B9\u5F0F\uFF0C\u6309\u5468/\u6708/\u5E74\u521B\u5EFA\u7B14\u8BB0\u6587\u4EF6").addDropdown((dropdown) => {
      Object.entries(STORAGE_GRANULARITY_LABELS).forEach(([key, label]) => {
        dropdown.addOption(key, label);
      });
      dropdown.setValue(this.plugin.settings.storageGranularity);
      dropdown.onChange(async (value) => {
        this.plugin.settings.storageGranularity = value;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian7.Setting(containerEl).setName("\u5B58\u50A8\u8DEF\u5F84").setDesc("\u7B14\u8BB0\u6587\u4EF6\u7684\u5B58\u653E\u76EE\u5F55\uFF0C\u53EF\u8F93\u5165\u5173\u952E\u5B57\u641C\u7D22\u6216\u{1F4C1}\u6309\u94AE\u6D4F\u89C8\u9009\u62E9").addSearch((search) => {
      search.setPlaceholder("\u65E5\u7A0B").setValue(this.plugin.settings.basePath).onChange(async (value) => {
        this.plugin.settings.basePath = value || "\u65E5\u7A0B";
        await this.plugin.saveSettings();
      });
    }).addExtraButton((btn) => {
      btn.setIcon("folder").setTooltip("\u6D4F\u89C8\u5E76\u9009\u62E9\u6587\u4EF6\u5939").onClick(() => {
        const modal = new FolderSuggestModal(this.app, (path) => {
          this.plugin.settings.basePath = path || "\u65E5\u7A0B";
          this.plugin.saveSettings();
          this.display();
        });
        modal.open();
      });
    });
    new import_obsidian7.Setting(containerEl).setName("\u5DF2\u5B8C\u6210\u663E\u793A").setDesc("\u300C\u5212\u6389\u4FDD\u7559\u300D\u59CB\u7EC8\u663E\u793A\u5DF2\u5B8C\u6210\uFF0C\u53EF\u624B\u52A8\u9690\u85CF\uFF1B\u300C\u9690\u85CF\u300D\u9ED8\u8BA4\u9690\u85CF\u5DF2\u5B8C\u6210").addDropdown((dropdown) => {
      Object.entries(COMPLETED_DISPLAY_LABELS).forEach(([key, label]) => {
        dropdown.addOption(key, label);
      });
      dropdown.setValue(this.plugin.settings.completedDisplay);
      dropdown.onChange(async (value) => {
        this.plugin.settings.completedDisplay = value;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian7.Setting(containerEl).setName("\u5468\u8D77\u59CB\u65E5").setDesc("\u9009\u62E9\u6BCF\u5468\u4ECE\u54EA\u4E00\u5929\u5F00\u59CB").addDropdown((dropdown) => {
      dropdown.addOption("1", "\u5468\u4E00");
      dropdown.addOption("0", "\u5468\u65E5");
      dropdown.setValue(String(this.plugin.settings.weekStartsOn));
      dropdown.onChange(async (value) => {
        this.plugin.settings.weekStartsOn = Number(value);
        await this.plugin.saveSettings();
      });
    });
    containerEl.createEl("h3", { text: "\u5916\u89C2\u8BBE\u7F6E" });
    containerEl.createEl("p", {
      text: "\u81EA\u5B9A\u4E49\u5404\u4F18\u5148\u7EA7\u7684\u7AD6\u6761\u989C\u8272",
      cls: "schedule-settings-desc"
    });
    const priorityKeys = [
      { key: "high", label: "\u9AD8\u4F18\u5148\u7EA7\u989C\u8272" },
      { key: "medium", label: "\u4E2D\u4F18\u5148\u7EA7\u989C\u8272" },
      { key: "low", label: "\u4F4E\u4F18\u5148\u7EA7\u989C\u8272" }
    ];
    priorityKeys.forEach(({ key, label }) => {
      const setting = new import_obsidian7.Setting(containerEl).setName(label).setDesc(PRIORITY_CONFIG[key].label).addColorPicker((color) => {
        color.setValue(this.plugin.settings.priorityColors[key]);
        color.onChange(async (value) => {
          this.plugin.settings.priorityColors[key] = value;
          await this.plugin.saveSettings();
        });
      }).addExtraButton((btn) => {
        const defaultColor = this.plugin.settings.priorityColors[key];
        btn.setIcon("reset").setTooltip("\u91CD\u7F6E\u4E3A\u9ED8\u8BA4\u989C\u8272").onClick(async () => {
          const defaults = {
            high: "#e74c3c",
            medium: "#e67e22",
            low: "#3498db"
          };
          this.plugin.settings.priorityColors[key] = defaults[key];
          await this.plugin.saveSettings();
          this.display();
        });
      });
    });
    new import_obsidian7.Setting(containerEl).setName("\u80CC\u666F\u56FE\u7247 URL").setDesc("\u8BBE\u7F6E\u4E3B\u9875\u65E5\u5386\u7684\u80CC\u666F\u56FE\uFF08\u5EFA\u8BAE\u4F7F\u7528\u6D45\u8272/\u67D4\u548C\u56FE\u7247\uFF09\uFF0C\u7559\u7A7A\u5219\u4E0D\u4F7F\u7528\u80CC\u666F").addText((text) => {
      text.setPlaceholder("https://example.com/bg.png \u6216 local://path").setValue(this.plugin.settings.backgroundImage).onChange(async (value) => {
        this.plugin.settings.backgroundImage = value;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian7.Setting(containerEl).setName("\u80CC\u666F\u56FE\u900F\u660E\u5EA6").setDesc("\u80CC\u666F\u56FE\u7684\u663E\u793A\u5F3A\u5EA6\uFF080 = \u4E0D\u53EF\u89C1, 1 = \u5B8C\u5168\u663E\u793A\uFF09").addSlider((slider) => {
      slider.setLimits(0, 1, 0.05).setValue(this.plugin.settings.backgroundOpacity).setDynamicTooltip().onChange(async (value) => {
        this.plugin.settings.backgroundOpacity = value;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian7.Setting(containerEl).setName("\u663E\u793A\u5468\u672B\u9AD8\u4EAE").setDesc("\u5468\u516D/\u5468\u65E5\u65E5\u671F\u4F7F\u7528\u4E0D\u540C\u989C\u8272\u6807\u8BC6").addToggle((toggle) => {
      toggle.setValue(this.plugin.settings.showWeekendHighlight);
      toggle.onChange(async (value) => {
        this.plugin.settings.showWeekendHighlight = value;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian7.Setting(containerEl).setName("\u663E\u793A\u8282\u5047\u65E5\u6807\u8BC6").setDesc("\u8282\u5047\u65E5\u65E5\u671F\u663E\u793A\u8282\u65E5\u540D\u79F0\u548C\u7279\u6B8A\u80CC\u666F").addToggle((toggle) => {
      toggle.setValue(this.plugin.settings.showFestivalHighlight);
      toggle.onChange(async (value) => {
        this.plugin.settings.showFestivalHighlight = value;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian7.Setting(containerEl).setName("\u663E\u793A\u4EFB\u52A1\u6570\u91CF\u89D2\u6807").setDesc("\u5728\u65E5\u671F\u683C\u5B50\u4E0A\u663E\u793A\u8BE5\u65E5\u5F85\u529E\u6570\u91CF").addToggle((toggle) => {
      toggle.setValue(this.plugin.settings.showTaskCountBadge);
      toggle.onChange(async (value) => {
        this.plugin.settings.showTaskCountBadge = value;
        await this.plugin.saveSettings();
      });
    });
    containerEl.createEl("hr");
    containerEl.createEl("h3", { text: "\u6570\u636E\u8BF4\u660E" });
    const info = containerEl.createEl("div", { cls: "schedule-settings-info" });
    const { storageGranularity, basePath } = this.plugin.settings;
    const examples = {
      month: `${basePath}/2026-06.md\uFF08\u6BCF\u6708\u4E00\u7BC7\uFF09`,
      week: `${basePath}/2026-W23.md\uFF08\u6BCF\u5468\u4E00\u7BC7\uFF09`,
      year: `${basePath}/2026.md\uFF08\u6BCF\u5E74\u4E00\u7BC7\uFF09`
    };
    info.createEl("p", {
      text: `\u5F53\u524D\u8BBE\u7F6E\uFF1A${STORAGE_GRANULARITY_LABELS[storageGranularity]}\u5B58\u50A8\uFF0C\u8DEF\u5F84\u4E3A "${basePath}/"`
    });
    info.createEl("p", { text: `\u793A\u4F8B\uFF1A${examples[storageGranularity]}` });
    info.createEl("p", {
      text: "\u63D0\u793A\uFF1A\u7B14\u8BB0\u7531\u63D2\u4EF6\u81EA\u52A8\u7BA1\u7406\uFF0C\u53EF\u76F4\u63A5\u5728 Obsidian \u4E2D\u9605\u8BFB\u548C\u7F16\u8F91\u3002\u8BF7\u52FF\u5220\u9664\u6216\u4FEE\u6539 HTML \u6CE8\u91CA\u683C\u5F0F\u7684\u5143\u6570\u636E\u3002",
      cls: "schedule-settings-tip"
    });
  }
};

// src/main.ts
var SchedulePlugin = class extends import_obsidian8.Plugin {
  async onload() {
    await this.loadSettings();
    this.todoService = new TodoService(this.app, () => this.settings);
    this.registerView(
      VIEW_TYPE_SCHEDULE_MAIN,
      (leaf) => new CalendarView(leaf, this.todoService, () => ({
        completedDisplay: this.settings.completedDisplay,
        weekStartsOn: this.settings.weekStartsOn,
        priorityColors: this.settings.priorityColors,
        backgroundImage: this.settings.backgroundImage,
        backgroundOpacity: this.settings.backgroundOpacity,
        showFestivalHighlight: this.settings.showFestivalHighlight,
        showWeekendHighlight: this.settings.showWeekendHighlight,
        showTaskCountBadge: this.settings.showTaskCountBadge
      }))
    );
    this.registerView(
      VIEW_TYPE_SCHEDULE_SIDEBAR,
      (leaf) => new SidebarView(leaf, this.todoService, () => ({
        completedDisplay: this.settings.completedDisplay,
        weekStartsOn: this.settings.weekStartsOn
      }))
    );
    this.addRibbonIcon("calendar", "\u65E5\u7A0B", async () => {
      await this.activateViews();
    });
    this.addSettingTab(new ScheduleSettingTab(this.app, this));
    this.app.workspace.onLayoutReady(async () => {
      const mainLeaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_SCHEDULE_MAIN);
      if (mainLeaves.length === 0) {
        await this.activateViews();
      }
    });
  }
  async onunload() {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_SCHEDULE_MAIN);
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_SCHEDULE_SIDEBAR);
  }
  async activateViews() {
    const { workspace } = this.app;
    const mainExisting = workspace.getLeavesOfType(VIEW_TYPE_SCHEDULE_MAIN);
    if (mainExisting.length > 0) {
      workspace.revealLeaf(mainExisting[0]);
    } else {
      const mainLeaf = workspace.getLeaf(true);
      if (mainLeaf) {
        await mainLeaf.setViewState({ type: VIEW_TYPE_SCHEDULE_MAIN, active: true });
      }
    }
    const sideExisting = workspace.getLeavesOfType(VIEW_TYPE_SCHEDULE_SIDEBAR);
    if (sideExisting.length === 0) {
      const sideLeaf = workspace.getRightLeaf(false);
      if (sideLeaf) {
        await sideLeaf.setViewState({ type: VIEW_TYPE_SCHEDULE_SIDEBAR, active: false });
      }
    }
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
    [
      ...this.app.workspace.getLeavesOfType(VIEW_TYPE_SCHEDULE_MAIN),
      ...this.app.workspace.getLeavesOfType(VIEW_TYPE_SCHEDULE_SIDEBAR)
    ].forEach((leaf) => {
      if (leaf.view instanceof CalendarView || leaf.view instanceof SidebarView) {
        leaf.view.onOpen();
      }
    });
  }
};
