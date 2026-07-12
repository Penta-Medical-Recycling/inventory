import { toast } from "sonner";

// Displays informative toast messages via sonner. Accepts the legacy
// bulma-style `type` values ("is-success" | "is-info" | "is-danger" | "is-warning")
// so existing call sites keep working unchanged.
const Toast = ({ message, type }) => {
  const options = { duration: 4000 };

  switch (type) {
    case "is-success":
      toast.success(message, options);
      break;
    case "is-danger":
      toast.error(message, options);
      break;
    case "is-warning":
      toast.warning(message, options);
      break;
    case "is-info":
    default:
      toast.info(message, options);
      break;
  }

  return null;
};

export default Toast;
