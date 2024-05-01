'use client'
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useEffect, useState } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import * as z from "zod"
import {useDebounceCallback, useDebounceValue} from "usehooks-ts"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { signUpSchema } from "@/schemas/signUpSchema"
import axios, { AxiosError } from 'axios'
import { ApiResponse } from "@/types/ApiResponse"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
function page() {
  const [username , setUsername] = useState<string>('');
  const [usernameMessage , setUsernameMessage] = useState<string>('');
  const [isCheckingUsername, setIsCheckingUsername] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const debouncedUsername = useDebounceCallback(setUsername, 500);
  const { toast } = useToast()
  const router = useRouter()
  const form = useForm({resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      username: ''
    }
  });

  useEffect(()=>{
    const checkUsername = async ()=>{
      if(username){
        setIsCheckingUsername(true);
        setUsernameMessage('');
        try{
          let response = await axios.get(`/api/check-username-unique?username=${username}`);
          setUsernameMessage(response.data.message);

        }catch(err: any){
          let errMessage = '';
          if(err.response?.data?.error?.[0]){
            errMessage = err.response?.data?.error?.[0];
          }else if(err.response?.data?.message){
            errMessage = err.response?.data?.message
          }

          if(errMessage){
            setUsernameMessage(errMessage);
          }else{
            setUsernameMessage("Something went wrong");
            
          }
        }finally{
          setIsCheckingUsername(false);
        }
      }
    }
    checkUsername();
  }, [username]);

  const onSubmit : SubmitHandler<any> = async (data: z.infer<typeof signUpSchema>)=>{
    console.log(data);
    setIsSubmitting(true);
    try {
      let response = await axios.post<ApiResponse>(`/api/sign-up`, data);
      if(response.data?.success){
        toast({
          title: 'Success',
          description: response.data.message,
        });
        router.replace(`/verify/${username}`);

      }else{
        let errMessage = 'Something went wrong';
        if(response?.data?.error?.[0]){
          errMessage = response?.data?.error?.[0];
        }else if(response?.data?.message){
          errMessage = response?.data?.message
        }
        toast({
          title: "Sign up failed",
          description: errMessage
        })
      }
    } catch (error) {
      console.log(error);
      let axiosError = error as AxiosError<ApiResponse>;
      let errMessage = 'Something went wrong';
      if(axiosError.response?.data?.error?.[0]){
        errMessage = axiosError.response?.data?.error?.[0];
      }else if(axiosError.response?.data?.message){
        errMessage = axiosError.response?.data?.message
      }

      toast({
        title: "Sign up failed",
        description: errMessage,
        variant: 'destructive'
      })
    }finally{
      setIsSubmitting(false);
    }
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
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="username" {...field} onChange={(e)=>{field.onChange(e);debouncedUsername(e.target.value)}}/>
              </FormControl>
              {isCheckingUsername ? <Loader2 className="animate-spin"/> : <p className={`text-sm ${usernameMessage=='username is unique' ? 'text-green-500' : 'text-red-500'}`}>{usernameMessage} </p>}
              <FormDescription>
                This is your public display name.
              </FormDescription>
              {/* <FormMessage /> */}
            </FormItem>
          )}
        />
          <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="email" {...field}/>
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
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
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>{
          isSubmitting ? (<>
            <Loader2 className="mr-2 h-4 w-4 animate-spin"></Loader2> Please wait
          </>) : ("Sign up")
        }</Button>
          </form>
      </Form>
      <div className="text-center mt-4">
        <p>
          Already a member?{' '}
          <Link href="/sign-in" className="text-blue-600 hover:text-blue-800">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  </div>
  )
}

export default page