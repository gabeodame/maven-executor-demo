import React from "react";
import { Toaster, toast } from "sonner";

export default function CustomToast({ message }: { message: string }) {
  return (
    <div>
      <Toaster />
      <button onClick={() => toast("My first toast")}>{message}</button>
    </div>
  );
}
