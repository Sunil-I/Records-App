$(document).ready(() => {
  $("#delete-form").submit((event) => {
    if ($("#delete-form")[0].checkValidity()) {
      event.preventDefault();
      $.ajax({
        type: "POST",
        url: "/close",
        data: $("#delete-form").serialize(),
        dataType: "json",
        success: (response) => {
          if (response.success) {
            window.location.href = "/";
          }
        },
        error: (error) => {
          var err = error.responseJSON;
          $("#password-label").text(`Password`).css("color", "");
          $("#confirm-label").text(`Close my account`).css("color", "");
          if (err.type == "password") {
            $("#password-label")
              .text(`Password - ${err.message}`)
              .css("color", "red");
          } else if (err.type == "confirm") {
            $("#confirm-label")
              .text(`Close my account - ${err.message}`)
              .css("color", "red");
          }
        },
      });
    } else {
      event.preventDefault();
      $("#delete-form")[0].reportValidity();
      event.stopPropagation();
    }
  });
});
