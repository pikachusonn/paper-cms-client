"use client"
import { getRefreshToken } from "@/helper/token.helper"
import { apolloClient } from "@/lib/apollo/client"
import { ApolloProvider } from "@apollo/client/react"
import { usePathname } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

export const Providers = ({ children }: { children: React.ReactNode }) => {
    const [initialize, setInitialize] = useState(false);
    const pathname = usePathname();
    const refreshToken = useMemo(() => getRefreshToken(), [getRefreshToken])

    const isPublicRoute = false;
    const isAuthRoute = pathname === "/login"

    useEffect(() => {
        const initialize = () => {
            if (!isPublicRoute && !isAuthRoute && !refreshToken) {
                window.location.href = "/login";
                return;
            }

            if (!!refreshToken && (isAuthRoute || isPublicRoute)) {
                console.log("heheh");
                
                window.location.href = "/";
                return;
            }

            setInitialize(true);
        }

        initialize();

    }, [isPublicRoute, isAuthRoute, refreshToken])

    if (!initialize) return null;

    return (
        <ApolloProvider client={apolloClient}>
            {children}
        </ApolloProvider>
    )
}