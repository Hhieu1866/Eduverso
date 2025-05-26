import { auth } from "@/auth";
import { getUserByEmail } from "@/queries/users";
import PersonalDetails from "../component/personal-details";
import ContactInfo from "../component/contact-info";
import ChangePassword from "../component/change-password";

async function Profile() {
  const session = await auth();
  const loggedInUser = await getUserByEmail(session?.user?.email);

  return (
    <div className="space-y-8">
      {/* Form thông tin cá nhân */}
      <PersonalDetails userInfo={loggedInUser} />
      <hr className="border-slate-200" />

      {/* Form liên hệ và đổi mật khẩu */}
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <ContactInfo userInfo={loggedInUser} />
        </div>
        <div>
          <ChangePassword email={loggedInUser?.email} />
        </div>
      </div>
    </div>
  );
}

export default Profile;
