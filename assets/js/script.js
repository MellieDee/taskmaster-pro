var tasks = {};

var createTask = function (taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);


  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function () {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function (list, arr) {
    console.log(list, arr);
    // then loop over sub-array
    arr.forEach(function (task) {
      createTask(task.text, task.date, list);
    });
  });
};


var saveTasks = function () {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

//*****   EDIT TASKS *****/
//change p El to a text input box
$(".list-group").on("click", "p", function () {
  //get current text
  var text = $(this)
    .text()
    .trim();
  console.log(text);

  var textInput = $("<textarea>")
    .addClass("form-control")
    .val(text);
  console.log(textInput);
  //auto-focus on p ele directlty with click instead of 2-step
  $(this).replaceWith(textInput);
  textInput.trigger("focus");
});

//****    EDIT DATES    ******/
//due date was clicked
$(".list-group").on("click", "span", function () {
  //get current text
  var date = $(this)
    .text()
    .trim();


  //create new date input area
  var dateInput = $("<input>")
    .attr("type", "text")
    .addClass("form-control")
    .val(date);

  //swap out elements
  $(this).replaceWith(dateInput);

  //automatically focus on new element
  dateInput.trigger("focus");
});

//***  event Listeners and CONVERT BACK on OUTSIDE CLICK */
//save the new edited "task" info 
$(".list-group").on("blur", "textarea", function () {
  //get textarea's current value ie text
  var text = $(this)
    .val()
    .trim();

  //get its parent ul's id attribute
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");

  //get tasks position in the li El
  var index = $(this)
    .closest(".list-group-item")
    .index();

  tasks[status][index].text = text;
  saveTasks();

  // tasks is an object.
  // tasks[status] returns an array (e.g., toDo).
  // tasks[status][index] returns the object at the given index in the array.
  // tasks[status][index].text returns the text property of the object at the given index.
  // Updating this tasks object was necessary for localStorage, so we call saveTasks() immediately afterwards.

  //convert the textbox input area back to a p 
  //1) Recreate pEl
  var taskP = $("<p>")
    .addClass("m-1")
    .text(text);

  // 2) replace textarea with the p element
  $(this).replaceWith(taskP);
});

//value of date was changed
$(".list-group").on("blur", "input[type='text']", function () {
  //get current text
  var date = $(this)
    .val()
    .trim();

  //get its parent's ul's id attributes
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");

  //get tasks position in the list of other li elements
  var index = $(this)
    .closest(".list-group-item")
    .index();

  //update task in array and re-save to localStorage
  tasks[status][index].date = date;
  saveTasks();

  //convert date input back to date display
  //1) Recreate span 'date' ele with bootstrap classes
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(date);

  // 2) Replace temporary input ie put back span El
  $(this).replaceWith(taskSpan);

});


// modal was triggered
$("#task-form-modal").on("show.bs.modal", function () {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function () {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// "save" button in modal was clicked
$("#task-form-modal .btn-primary").click(function () {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

// remove all tasks
$("#remove-tasks").on("click", function () {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// *** Framework to make cards sortable  
$(".card .list-group").sortable({
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  helper: "clone",
  activate: function (event) {
    console.log("activate", this);
  },

  deactivate: function (event) {
    console.log("deactivate", this);
  },


  out: function (event) {
    console.log("out", event.target);
  },

  over: function (event) {
    console.log("over", this);
  },

  update: function (event) {
    //array to store task data in (task data is name ie text and date)
    var tempArr = [];

    //loop over current set of children in sortable list
    // Because the nested $(this) refers to the task <li> element, you can use additional jQuery methods to strip out the task's description and due date. jQuery's find() method is perfect //for traversing through child DOM elements.

    $(this).children().each(function () {
      var text = $(this)
        .find("p")
        .text()
        .trim();

      var date = $(this)
        .find("span")
        .text()
        .trim();

      //add task data (aka task name/text and date) to the temporary array as an OBJ
      tempArr.push({
        text: text,
        date: date

      });

    });
    //trim down lists ID to match object property
    var arrName = $(this)
      .attr("id")
      .replace("list-", "");

    //update array on tasks object and Save
    tasks[arrName] = tempArr;
    saveTasks();

  }
});

$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  drop: function(event, ui) {
    ui.draggable.remove()

    console.log("drop");
  },
  over: function(event, ui) {
    console.log("over");
  },

  out: function(event ,ui) {
    console.log("out");
  }
});

// load tasks for the first time
loadTasks();


