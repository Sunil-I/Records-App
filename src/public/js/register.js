$(document).ready(() => {
  $("#register-form").submit((event) => {
    if ($("form")[0].checkValidity()) {
      event.preventDefault();
      $.ajax({
        type: "POST",
        url: "/register",
        data: $("#register-form").serialize(),
        dataType: "json",
        success: (response) => {
          if (response.success) {
            window.location.href = "/";
          }
        },
        error: (error) => {
          var err = error.responseJSON;
          $("#email-label").text(`E-Mail Address`).css("color", "");
          $("#password-label").text(`Password`).css("color", "");
          $("#tos-label")
            .text(`I agree to the Terms of Service!`)
            .css("color", "");
            $("#name-label")
            .text(`Name`)
            .css("color", "");
          if (err.type == "email") {
            $("#email-label")
              .text(`Email Address - ${err.message}`)
              .css("color", "red");
          } else if (err.type == "password") {
            $("#password-label")
              .text(`Password - ${err.message}`)
              .css("color", "red");
          } else if (err.type == "tos") {
            $("#tos-label")
              .text(`I agree to the Terms of Service! - ${err.message}`)
              .css("color", "red");
          } else if (err.type == "name") {
            $("#name-label")
              .text(`Name - ${err.message}`)
              .css("color", "red");
          }
        },
      });
    } else {
      event.preventDefault();
      $("form")[0].reportValidity();
      event.stopPropagation();
    }
  });
});
