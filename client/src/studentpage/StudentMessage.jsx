import { PageHead, LogoutButton } from "../admincomponents/UI.jsx";
import ChatPanel from "../admincomponents/ChatPanel.jsx";

export default function StudentMessage() {
  return (
    <>
      <PageHead icon="💬" title="Messages" sub="Chat with your supervisor and coordinators" action={<LogoutButton />} />
      <ChatPanel />
    </>
  );
}
