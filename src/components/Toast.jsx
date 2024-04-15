import * as bulmaToast from "bulma-toast";

// Toast component for displaying informative messages on the cart page.

const Toast = ({ message, type }) => {
  const toastConfig = {
    message: message,
    type: type,
    position: "top-center",
    duration: 4000, // Duration to display the toast (in milliseconds)
    dismissible: true, // Allows the user to dismiss the toast
  };

  bulmaToast.toast(toastConfig);

  return null;
};

export default Toast;
