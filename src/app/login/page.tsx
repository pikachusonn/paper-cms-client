"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { setAccessToken, setRefreshToken } from "@/helper/token.helper";
import { LoginResponse, LoginVariables } from "@/interface/auth";
import { LOGIN_MUTATION } from "@/lib/graphql/mutations/auth";
import { useMutation } from "@apollo/client/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { PiSpinnerGap } from "react-icons/pi";
import z from "zod";

const LoginPage = () => {
  const router = useRouter();
  const [login, { loading }] = useMutation<LoginResponse, LoginVariables>(
    LOGIN_MUTATION,
  );

  const loginSchema = z.object({
    email: z.string().min(1, "Email is required"),
    password: z.string().min(1, "Password is required"),
  });

  type LoginSchemaType = z.infer<typeof loginSchema>;
  const form = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Cập nhật hàm handleLogin để nhận data từ form
  const handleLogin = async (values: LoginSchemaType) => {
    try {
      const res = await login({
        variables: {
          loginRequest: {
            email: values.email,
            password: values.password,
          },
        },
      });

      if (res.data) {
        setAccessToken(res.data.login.accessToken);
        setRefreshToken(res.data.login.refreshToken);
        router.replace("/");
      }
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-sky-300/10 flex-col gap-4">
      <h4 className="text-2xl font-medium">
        CMS - Hệ thống quản lý giấy tờ tống đạt
      </h4>
      <Form {...form}>
        <form
          className="flex flex-col gap-4 p-4 rounded-md border w-[320px]"
          // Cách viết sạch gọn hơn cho onSubmit
          onSubmit={form.handleSubmit(handleLogin)}
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input {...field} placeholder="Email" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input type="password" placeholder="Password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            disabled={!form.formState.isValid || loading}
            className="flex items-center gap-2"
          >
            {loading && <PiSpinnerGap className="w-4 h-4 animate-spin" />}
            Login
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default LoginPage;
