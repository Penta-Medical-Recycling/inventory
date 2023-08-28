import * as bulmaToast from "bulma-toast";
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
