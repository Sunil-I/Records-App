$(document).ready(() => {
  $("#new-account").submit((event) => {
    if ($("#new-account")[0].checkValidity()) {
      event.preventDefault();
      $.ajax({
        type: "POST",
        url: "/accounts/new",
        data: $("#new-account").serialize(),
        dataType: "json",
        success: (response) => {
          if (response.success) {
            window.location.href = "/accounts";
          }
        },
        error: (error) => {
          var err = error.responseJSON;
          $("#name-label").text(`Account Name`).css("color", "");
          $("#accountno-label").text(`Account Number`).css("color", "");
          $("#sortcode-label").text(`Account Sort code`).css("color", "");
          if (err.type == "name") {
            $("#name-label")
              .text(`Account Name - ${err.message}`)
              .css("color", "red");
          } else if (err.type == "accountno") {
            $("#accountno-label")
              .text(`Account Number - ${err.message}`)
              .css("color", "red");
          } else if (err.type == "sortcode") {
            $("#sortcode-label")
              .text(`Account Sort Code - ${err.message}`)
              .css("color", "red");
          }
        },
      });
    } else {
      event.preventDefault();
      $("#new-account").reportValidity();
      event.stopPropagation();
    }
  });
});
