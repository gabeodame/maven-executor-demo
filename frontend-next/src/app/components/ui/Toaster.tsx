import React from "react";
import { Toaster, toast } from "sonner";

interface CustomToastProps {
  message: string;

  type: "success" | "error";
}

export default function CustomToast({ message }: CustomToastProps) {
  return (
    <div>
      <Toaster />
      <button onClick={() => toast("My first toast")}>{message}</button>
    </div>
  );
}
