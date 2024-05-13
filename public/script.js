const wrapper = document.querySelector('.wrapper');
const loginLink = document.querySelector('.login-link');
const registerLink = document.querySelector('.register-link');
const btnLogin = document.querySelector('.btnlogin-popup');
const iconClose = document.querySelector(".icon-close");

console.log(wrapper, loginLink, registerLink);

registerLink.addEventListener("click", () => {
    wrapper.classList.add("active");            
});

loginLink.addEventListener("click", () => {
wrapper.classList.remove("active");
});

btnLogin.addEventListener("click", ()=> {
    wrapper.classList.add("active-popup");
});

iconClose.addEventListener("click", ()=> {
    wrapper.classList.remove("active-popup");
});

function alertFunction (message) {
    alert(message);
}