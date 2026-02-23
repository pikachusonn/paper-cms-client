/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "../ui/sidebar";
import { SiRiotgames } from "react-icons/si";
import { BsThreeDots } from "react-icons/bs";
import styles from "./styles.module.css";
import { usePathname, useRouter } from "next/navigation";
interface SidebarItem {
  title: string;
  url: string;
  icon: React.ReactNode;
}

const AppSidebar = ({ items }: { items: SidebarItem[] }) => {
  const { open } = useSidebar();
  const pathname = usePathname();
  return (
    <Sidebar collapsible="icon">
      {" "}
      <SidebarHeader
        className={`${!open && styles.collapsedSidebarHeader} border-b`}
      >
        {open ? (
          <div className="flex gap-[8px] items-center p-2 rounded-md">
            <SiRiotgames size={30} className="text-red-600" />
            <div className="flex-1 flex flex-col">
              <p className="text-base/4 font-medium">PREMIER</p>
              <p className="text-sm/4">A league of its own</p>
            </div>
            {/* <CorporationMenu /> */}
          </div>
        ) : (
          <SiRiotgames size={20} className="text-red-600" />
        )}
      </SidebarHeader>
      <SidebarContent className="mt-2">
        <SidebarGroup className="border-y py-4">
          {/* <SidebarGroupLabel>Application</SidebarGroupLabel> */}
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = pathname === item.url;
                console.log(pathname, item.url);

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      className={isActive ? "bg-neutral-200" : ""}
                    >
                      <a href={item.url}>
                        {item.icon}
                        <span className="font-semibold">{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t">
        <div
          className={`${
            open
              ? "flex items-center justify-between p-2 hover:bg-neutral-200/50 cursor-pointer rounded-md"
              : "flex items-center justify-center"
          }`}
        >
          {open ? (
            <>
              <div className="flex items-center gap-2">
                <img
                  src="https://ui.shadcn.com/avatars/shadcn.jpg"
                  alt="avatar"
                  className="rounded-md object-cover object-center w-[35px] h-[35px]"
                />
                <div>
                  <p className="text-sm font-medium leading-4">Priscilla</p>
                  <p className="text-sm font-light leading-4">
                    prisci@gmail.com
                  </p>
                </div>
              </div>
              {/* <BsExclamationLg size={25} /> */}
            </>
          ) : (
            <img
              src="https://ui.shadcn.com/avatars/shadcn.jpg"
              alt="avatar"
              className="rounded-md object-cover object-center w-[35px] h-[35px]"
            />
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
