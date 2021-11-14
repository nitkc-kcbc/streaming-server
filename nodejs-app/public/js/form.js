let is_visible = document.querySelector("input[name=is_visible]");
let input_pass = document.querySelector("input[name=password]");

is_visible.addEventListener('change', function() {
  if (this.checked) {
    input_pass.type = 'text';
  } else {
    input_pass.type = 'password';
  }
});