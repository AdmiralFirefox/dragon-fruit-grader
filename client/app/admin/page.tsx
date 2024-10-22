import AdminContent from "@/app/components/PageContent/AdminContent";
import { signOutUser, disableUser, deleteUser } from "./action";

export default async function Admin() {
  return (
    <AdminContent
      signOutUser={signOutUser}
      disableUser={disableUser}
      deleteUser={deleteUser}
    />
  );
}
