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

  //check due date
  auditTask(taskLi);

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

// enable draggable/sortable feature on list-group elements
$(".card .list-group").sortable({
  // enable dragging across lists
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  helper: "clone",
  activate: function (event, ui) {
    $(this).addClass("dropover");
    $(".bottom-trash").addClass("bottom-trash-drag");
    console.log(ui);
  },
  deactivate: function (event, ui) {
    $(this).removeClass("dropover");
    $(".bottom-trash").removeClass("bottom-trash-drag");
    console.log(ui);
  },
  over: function (event) {
    $("evt.target").addClass("dropover-active");
    console.log(event);
  },
  out: function (event) {
    $("evt.target").removeClass("dropover-active");
    console.log(event);
  },
  update: function () {
    var tempArr = [];

    // loop over current set of children in sortable list
    $(this)
      .children()
      .each(function () {
        // save values in temp array
        tempArr.push({
          text: $(this)
            .find("p")
            .text()
            .trim(),
          date: $(this)
            .find("span")
            .text()
            .trim()
        });
      });

    // trim down list's ID to match object property
    var arrName = $(this)
      .attr("id")
      .replace("list-", "");

    // update array on tasks object and save
    tasks[arrName] = tempArr;
    saveTasks();
  },
  stop: function (event) {
    $(this).removeClass("dropover");
  }
});

// trash icon can be dropped onto
$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  drop: function (event, ui) {
    // remove dragged element from the dom
    ui.draggable.remove();
    $(".bottom-trash").removeClass("bottom-trash-active");

  },
  over: function (event, ui) {
    $(".bottom-trash").addClass("bottom-trash-active");
    console.log(ui);
  },
  out: function (event, ui) {
    $(".bottom-trash").removeClass("bottom-trash-active");
    console.log(ui);
  }
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

// save button in modal was clicked
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

// task text was clicked
$(".list-group").on("click", "p", function () {
  // get current text of p element
  var text = $(this)
    .text()
    .trim();

  // replace p element with a new textarea
  var textInput = $("<textarea>").addClass("form-control").val(text);
  $(this).replaceWith(textInput);

  // auto focus new element
  textInput.trigger("focus");
});

// editable field was un-focused
$(".list-group").on("blur", "textarea", function () {
  // get current value of textarea
  var text = $(this).val().trim();

  // get status type and position in the list
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");
  var index = $(this)
    .closest(".list-group-item")
    .index();

  // update task in array and re-save to localstorage
  tasks[status][index].text = text;
  saveTasks();

  // recreate p element
  var taskP = $("<p>")
    .addClass("m-1")
    .text(text);

  // replace textarea with new content
  $(this).replaceWith(taskP);
});

// due date was clicked
$(".list-group").on("click", "span", function () {
  // get current text
  var date = $(this).text().trim();

  // create new input element
  var dateInput = $("<input>")
    .attr("type", "text")
    .addClass("form-control")
    .val(date);
  $(this).replaceWith(dateInput);

  // enable jquery ui datepicker
  dateInput.datepicker({
    minDate: 1,
    onClose: function () {
      $(this).trigger("change");

    }
  });

  // automatically bring up the calendar
  dateInput.trigger("focus");
});

// value of due date was changed
$(".list-group").on("change", "input[type='text']", function () {
  var date = $(this).val();

  var status = $(this).closest(".list-group").attr("id").replace("list-", "");
  var index = $(this).closest(".list-group-item").index();

  tasks[status][index].date = date;
  saveTasks();

  var taskSpan = $("<span>").addClass("badge badge-primary badge-pill").text(date);
  $(this).replaceWith(taskSpan);

  // Pass task's <li> element into auditTask() to check new due date
  auditTask($(taskSpan).closest(".list-group-item"));
});



// remove all tasks
$("#remove-tasks").on("click", function () {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  console.log(tasks);
  saveTasks();
});


$("#modalDueDate").datepicker({
  minDate: 1
});

//Once we get that date information and store it in the date variable, we have to pass that value into the moment() function to turn it into a Moment object. The nice thing about using JavaScript methods is that we can make sense of what's happening one step at a time.

// First, we use the date variable we created from taskEl to make a new Moment object, configured for the user's local time using moment(date, "L"). Because the date variable does not specify a time of day (for example, "11/23/2019"), the Moment object will default to 12:00am. Because work usually doesn't end at 12:00am, we convert it to 5:00pm of that day instead, using the .set("hour", 17) method. In this case, the value 17 is in 24-hour time, so it's 5:00pm.

var auditTask = function (taskEl) {
  // get date from task element
  var date = $(taskEl).find("span").text().trim();
  //ensure it worked


  //convert to a moment obj @5pm
  var time = moment(date, "L").set("hour", 17);
  // this should print out an object for the value of the date variable, but at 5:00pm of that date

  //  //remove old classes
  $(taskEl).removeClass("list-group-item-warning list-group-item-danger");

  //  // apply new class if task is near/over due date 5.4.6
  if (moment().isAfter(time)) {
    $(taskEl).addClass("list-group-item-danger");
  }
  else if (Math.abs(moment().diff(time, "days")) <= 2) {
    $(taskEl).addClass("list-group-item-warning");
  }
  console.log(taskEl);
};

//5.5.4
setInterval(function () {
  $(".card .list-group-item").each(function (index, el) {
    auditTask(el);
  });
}, 5000);

// load tasks for the first time
loadTasks();



