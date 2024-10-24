import { User } from "firebase/auth";

export interface AdminContentProps {
  signOutUser: (token: string, uid: string) => Promise<void>;
  disableUser: (token: string, uid: string, disabled: boolean) => Promise<void>;
  deleteUser: (token: string, uid: string) => Promise<void>;
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}

export interface UserInfo extends User {
  disabled?: boolean;
}

export interface LoadingAdminFunctions {
  [key: string]: boolean;
}
