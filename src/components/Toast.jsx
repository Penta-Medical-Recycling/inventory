import * as bulmaToast from "bulma-toast";

// Toast component for displaying informative messages on the cart page.

const Toast = ({ message, type }) => {
  const toastConfig = {
    message: message,
    type: type,
    position: "top-center",
    duration: 4000, 
    dismissible: true, 
  };

  bulmaToast.toast(toastConfig);

  return null;
};

export default Toast;
