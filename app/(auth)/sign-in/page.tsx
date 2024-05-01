'use client'
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useEffect, useState } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import * as z from "zod"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import axios, { AxiosError } from 'axios'
import { ApiResponse } from "@/types/ApiResponse"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { signInSchema } from "@/schemas/signInSchema"
import { signIn } from "next-auth/react"
function page() {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { toast } = useToast();
  const router = useRouter()
  const form = useForm({resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: '',
      password: '',
    }
  });


  const onSubmit : SubmitHandler<any> = async (data: z.infer<typeof signInSchema>)=>{
    console.log(data);
    setIsSubmitting(true);
    const result = await signIn("credentials", {
      identifier: data.identifier,
      password: data.password,
      redirect: false
    });
    if(result?.error){
      toast({
        title: "Login failed",
        description: "Incorrect Username or password",
        variant: 'destructive',
      })
    }
    
    if(result?.url){
      toast({
        title:"sucess",
        description:"Login Successfully",
        variant:"destructive"
      });
      router.replace('/dashboard');
    }
    setIsSubmitting(false);
  }
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-800">
    <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
          Join True Feedback
        </h1>
        <p className="mb-4">Sign up to start your anonymous adventure</p>
      </div>
      <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
          control={form.control}
          name="identifier"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email/Username</FormLabel>
              <FormControl>
                <Input placeholder="email/username" {...field}/>
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
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="password" {...field}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>{
          isSubmitting ? (<>
            <Loader2 className="mr-2 h-4 w-4 animate-spin"></Loader2> Please wait
          </>) : ("Sign in")
        }</Button>
          </form>
      </Form>
      <div className="text-center mt-4">
        <p>
          Not a member?{' '}
          <Link href="/sign-up" className="text-blue-600 hover:text-blue-800">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  </div>
  )
}

export default page