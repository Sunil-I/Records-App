$(document).ready(() => {
  $("#login-form").submit((event) => {
    if ($("form")[0].checkValidity()) {
      event.preventDefault();
      $.ajax({
        type: "POST",
        url: "/login",
        data: $("#login-form").serialize(),
        dataType: "json",
        success: (response) => {
          if (response.success) {
            window.location.href = "/";
            $("#message").text("").css("color", "green");
            $("#message").text(response.message).css("color", "red");
          } else {
            $("#message").text(error.message);
          }
        },
        error: (error) => {
          var err = error.responseJSON;
          $("#message").text(err.message).css("color", "red");
        },
      });
    } else {
      event.preventDefault();
      $("form")[0].reportValidity();
      event.stopPropagation();
    }
  });
});
