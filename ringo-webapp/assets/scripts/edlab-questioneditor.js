$(document).ready(function() {
   var $textarea = $("#orfon-edlab-questionfield");
   var $details = $("#orfon-edlab-question-details");
   var $submit = $("#orfon-edlab-question-submit");

   $submit.prop("disabled", true).addClass("disabled");

   $textarea.on("keyup", function(event) {
      $details.toggleClass("visible", ($textarea.val().length > 10));
      $submit.prop("disabled", ($textarea.val().length <= 10));
      $submit.toggleClass("disabled", ($textarea.val().length <= 10));
   });
});