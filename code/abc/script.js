$(document).ready(function() {
    console.log('Hello from jQuery in abc!');
    alert('Hello from jQuery in abc!');

    // jQuery UI Datepicker initialization
    $("#datePicker").datepicker({
        dateFormat: "yy-mm-dd"
    });

    // WeUI button click event
    $("#weuiButton").on("click", function() {
        $.alert("您点击了 WeUI 按钮！", function() {
            console.log("WeUI 按钮被点击并关闭了提示。");
        });
    });
});

// Vanilla JS fallback/addition
document.addEventListener('DOMContentLoaded', () => {
    console.log('Hello from vanilla JavaScript in abc!');
});