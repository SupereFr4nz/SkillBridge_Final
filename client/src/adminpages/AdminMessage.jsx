import { PageHead, LogoutButton } from "../admincomponents/UI.jsx";
import ChatPanel from "../admincomponents/ChatPanel.jsx";

export default function AdminMessage() {
  return (
    <>
      <PageHead icon="💬" title="Messages" sub="Chat with students in the internship program" action={<LogoutButton />} />
      <ChatPanel />
    </>
  );
}
