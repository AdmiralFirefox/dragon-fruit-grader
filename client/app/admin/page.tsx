import AdminContent from "@/app/components/PageContent/AdminContent";
import { signOutUser, disableUser, deleteUser } from "./action";

export default async function Admin({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  return (
    <AdminContent
      searchParams={searchParams}
      signOutUser={signOutUser}
      disableUser={disableUser}
      deleteUser={deleteUser}
    />
  );
}
