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
          }
        },
        error: (error) => {
          var err = error.responseJSON;
          $("#email").text(`E-Mail Address`).css("color", "");
          $("#password").text(`E-Mail Address`).css("color", "");
          if (err.type == "email") {
            $("#email")
              .text(`E-Mail Address - ${err.message}`)
              .css("color", "red");
          } else if (err.type == "password") {
            $("#password")
              .text(`Password - ${err.message}`)
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
