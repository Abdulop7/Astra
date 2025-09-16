
import ChatWindow from "../chatWindow";

import Sidebar from "./sidebar";


export default function User() {

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />
      <ChatWindow propChatId={null}/>
    </div>
  );
}
