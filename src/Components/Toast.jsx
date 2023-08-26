import * as bulmaToast from "bulma-toast";
import { redirect } from "react-router-dom";
const Toast = ({ message }) => {
  const toastConfig = {
    message: message,
    type: "is-info",
    position: "top-center",
    duration: 6000,
    dismissible: true,
  };

  bulmaToast.toast(toastConfig);

  return null;
};

export default Toast;
