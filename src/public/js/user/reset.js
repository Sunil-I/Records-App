$(document).ready(() => {
  $("#reset-password-form").submit((event) => {
    if ($("form")[0].checkValidity()) {
      event.preventDefault();
      $.ajax({
        type: "POST",
        url: "/reset-password",
        data: $("#reset-password-form").serialize(),
        dataType: "json",
        success: (response) => {
          if (response.success) {
            $("#password-label").text(`Password`).css("color", "");
            $("#password-label")
              .text(`Password`)
              .css("color", "green")
              .text("Password was reset!");
            window.location.href = "/";
          }
        },
        error: (error) => {
          var err = error.responseJSON;
          $("#password-label").text(`Password`).css("color", "");
          $("#password-label")
            .text(`Password - ${err.message}`)
            .css("color", "red");
        },
      });
    } else {
      event.preventDefault();
      $("form")[0].reportValidity();
      event.stopPropagation();
    }
  });
});
