$(document).ready(function() {
   $(".orfon-edlab-upvote-button").on("click", function(event) {
      var $this = $(this);
      $this.prop("disabled", true);

      $.ajax($this.data("upvote")).done(function(data) {
         $this.fadeOut();
      }).error(function(data) {
         alert("Sie haben bereits für diese Frage abgestimmt!");
      });
   });
});