var $loginForm = jQuery("form[name=login]");
var formData = {};

$loginForm.on("submit", function (e) {
    e.preventDefault();

    $loginForm.serializeArray().forEach(function (field) {
        formData[field.name] = field.value;
    });

    jQuery.ajax("/login", {
        method: "POST",
        dataType: "json",
        data: formData,
        success: successfulLogin,
        error: loginError
    })
});

function successfulLogin (responseData) {
    sessionStorage.setItem("nickname", responseData.nickname);
    sessionStorage.setItem("token", responseData.token);
    location.pathname = "/";
}

function loginError() {

}