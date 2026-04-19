"use client";
import { getAccessToken } from "@/helper/token.helper";
import { apolloClient } from "@/lib/apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  const [initialize, setInitialize] = useState(false);
  const pathname = usePathname();
  const accessToken = useMemo(() => getAccessToken(), []);
  const isPublicRoute = pathname?.startsWith("/public-import");
  const isAuthRoute = pathname === "/login";

  useEffect(() => {
    const init = () => {
      if (!isPublicRoute && !isAuthRoute && !accessToken) {
        window.location.href = "/login";
        return;
      }
      if (!!accessToken && isAuthRoute) {
        window.location.href = "/";
        return;
      }

      setInitialize(true);
    };

    init();
  }, [isPublicRoute, isAuthRoute, accessToken]);

  if (!initialize) return null;

  return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>;
};
