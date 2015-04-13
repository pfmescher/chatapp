var $loginForm = jQuery("form[name=login]");
var data = {};

$loginForm.on("submit", function (e) {
    e.preventDefault();

    $loginForm.serializeArray().forEach(function (field) {
        data[field.name] = field.value;
    });

    jQuery.ajax("/login", {
        method: "POST",
        dataType: "json",
        data: data,
        success: sucessfulLogin,
        error: loginError
    })
});

function successfulLogin (data) {
    localStorage.setItem("token", data.token);
    location.redirect("/");
}

function loginError() {

}