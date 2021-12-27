$(document).ready(() => {
  $("#new-transaction").submit((event) => {
    if ($("#new-transaction")[0].checkValidity()) {
      event.preventDefault();
      $.ajax({
        type: "POST",
        url: "/transactions/new",
        data: $("#new-transaction").serialize(),
        dataType: "json",
        success: (response) => {
          if (response.success) {
            window.location.href = "/transactions";
          }
        },
        error: (error) => {
          var err = error.responseJSON;
          $("#id-label").text(`Account ID`).css("color", "");
          $("#type-label").text(`Transaction Type`).css("color", "");
          $("#amount-label").text(`Amount`).css("color", "");
          if (
            err.type == "id" ||
            err.type == "account" ||
            err.type == "account id"
          ) {
            $("#id-label")
              .text(`Account ID - ${err.message}`)
              .css("color", "red");
          } else if (err.type == "type") {
            $("#type-label")
              .text(`Transaction Type - ${err.message}`)
              .css("color", "red");
          } else if (err.type == "amount") {
            $("#amount-label")
              .text(`Amount - ${err.message}`)
              .css("color", "red");
          }
        },
      });
    } else {
      event.preventDefault();
      $("#new-transaction").reportValidity();
      event.stopPropagation();
    }
  });
});
