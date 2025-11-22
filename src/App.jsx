
import { useState } from "react";
import Login from "./Login";
import EnterData from "./EnterData";
import UpdateData from "./UpdateData";
import ViewData from "./ViewData";
import Dashboard from "./Dashboard";

export default function App() {
  const [role, setRole] = useState("");

  if (!role) {
    return <Login setRole={setRole} />;
  }

  if (role === "user1") {
    return <EnterData />;
  }

  if (role === "user2") {
    return <UpdateData />;
  }


  // Option B — Show new Dashboard for user3 instead:
  if (role === "user3") {
    return <Dashboard />;
  }


  if (role === "error") {
    alert("Error. Invalid User");
    window.location.reload();
    return null;
  }
}
