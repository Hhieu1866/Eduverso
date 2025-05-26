import React from "react";
import AccountSidebar from "./component/account-sidebar";
import { auth } from "@/auth";
import { getUserByEmail } from "@/queries/users";
import { redirect } from "next/navigation";

async function Layout({ tabs }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const loggedInUser = await getUserByEmail(session?.user?.email);

  return (
    <section className="relative pb-16">
      {/*end container*/}
      <div className="container relative mt-10">
        <div className="lg:flex">
          <AccountSidebar loggedInUser={loggedInUser} />
          <div className="mt-[30px] md:px-3 lg:mt-0 lg:w-full">{tabs}</div>
        </div>
        {/*end grid*/}
      </div>
      {/*end container*/}
    </section>
  );
}

export default Layout;
