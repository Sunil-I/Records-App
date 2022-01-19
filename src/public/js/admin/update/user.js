$(document).ready(() => {
  $("#admin-update-user").submit((event) => {
    if ($("#admin-update-user")[0].checkValidity()) {
      event.preventDefault();
      $.ajax({
        type: "POST",
        url: "/admin/users/edit",
        data: $("#admin-update-user").serialize(),
        dataType: "json",
        success: (response) => {
          if (response.success) {
            window.location.href = "/admin/users";
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
          } else {
            $("#name-label").text(`Name - ${err.message}`).css("color", "red");
          }
        },
      });
    } else {
      event.preventDefault();
      $("#admin-update-user")[0].reportValidity();
      event.stopPropagation();
    }
  });
});
