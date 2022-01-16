$(document).ready(() => {
  $("#reset-password-form").submit((event) => {
    if ($("form")[0].checkValidity()) {
      event.preventDefault();
      $.ajax({
        type: "POST",
        url: "/forget-password",
        data: $("#reset-password-form").serialize(),
        dataType: "json",
        success: (response) => {
          if (response.success) {
            $("#email-label").text(`Email Address`).css("color", "");
            $("#email-label")
              .text(`Email Address`)
              .css("color", "green")
              .text("Sent password reset to email!");
          }
        },
        error: (error) => {
          var err = error.responseJSON;
          $("#email-label").text(`Email Address`).css("color", "");
          $("#email-label")
            .text(`Email Address - ${err.message}`)
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
