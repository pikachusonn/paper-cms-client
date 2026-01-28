/* eslint-disable @typescript-eslint/no-explicit-any */
import { ERROR_CODE } from "@/constant/common";
import { ApolloLink, gql, Observable } from "@apollo/client";
import { refreshClient } from "./refreshClient";
import { setAccessToken } from "@/helper/token.helper";
let isRefreshing = false;
let queue: (() => void)[] = [];
const REFRESH = gql`
    mutation RefreshToken {
        refreshToken {
            accessToken
        }
    }
`
export const errorLink = new ApolloLink((operation, forward) => {
    return new Observable(observer => {
        const sub = forward(operation).subscribe({
            next: v => observer.next(v),
            error: async error => {
                const unauthorized = error.graphQLErrors?.some(
                    (e: any) => e.extensions?.code === ERROR_CODE.UNAUTHENTICATED
                )

                if (!unauthorized) {
                    observer.error(error);
                    return;
                }

                if (!isRefreshing) {
                    isRefreshing = true;
                    try {
                        const { data } = await refreshClient.mutate({
                            mutation: REFRESH,
                        });

                        if (data) {
                            setAccessToken(data.refreshToken.accessToken);
                        }
                        queue.forEach(callback => callback());
                        queue = [];
                    } catch (e) {
                        queue = [];
                        observer.error(e);
                        return;
                    } finally {
                        isRefreshing = false;
                    }
                }

                await new Promise<void>(resolve => queue.push(resolve));
                forward(operation).subscribe(observer)
            }
        })

        return () => sub.unsubscribe();
    })
})