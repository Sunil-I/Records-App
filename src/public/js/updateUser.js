$(document).ready(() => {
  $("#update-form").submit((event) => {
    if ($("#update-form")[0].checkValidity()) {
      event.preventDefault();
      $.ajax({
        type: "POST",
        url: "/update",
        data: $("#update-form").serialize(),
        dataType: "json",
        success: (response) => {
          if (response.success) {
            window.location.href = "/";
          }
        },
        error: (error) => {
          var err = error.responseJSON;
          $("#email-label").text(`Email Address`).css("color", "");
          $("#name-label").text(`Name`).css("color", "");
          if (err.type == "email") {
            $("#email-label")
              .text(`Email Address - ${err.message}`)
              .css("color", "red");
          } else if (err.type == "name") {
            $("#name-label").text(`Name - ${err.message}`).css("color", "red");
          }
        },
      });
    } else {
      event.preventDefault();
      $("#update-form")[0].reportValidity();
      event.stopPropagation();
    }
  });
});
