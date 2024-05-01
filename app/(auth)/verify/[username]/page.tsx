'use client'

import { Button } from '@/components/ui/button';
import {Form, FormControl, FormField, FormItem, FormLabel, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useToast } from '@/components/ui/use-toast';
import { handleError } from '@/lib/handleApiError';
import { verifySchema } from '@/schemas/verifySchema';
import { ApiResponse } from '@/types/ApiResponse';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { Link, Loader2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form';
import * as z  from 'zod';

function VerifyAccount() {
  const router = useRouter();
  const param = useParams<{username: string}>();
  const {toast} = useToast();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      code: '',
      username: param.username,
    }
  });

  const onSubmit = async (data: z.infer<typeof verifySchema>) => {
    try {
      setIsSubmitting(true);
      const response = await axios.post(`/api/verify-code`, data);

      if(response.data.success){
        toast({
          title: "Success",
          description: response.data.message
        });
        router.replace('sign-in');
      }else{
        handleError(response, 'Verification', toast);
      }
    } catch (error) {
      console.log(error);
      let axiosError = error as AxiosError<ApiResponse>
      handleError(axiosError.response, 'Verification', toast);
    }finally{
      setIsSubmitting(false);
    }
  }
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-800">
    <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
        Verify Your Account
        </h1>
        <p className="mb-4">Enter the verification code sent to your email</p>
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
                <Input placeholder="username" {...field} disabled/>
              </FormControl>
              <FormDescription>
                This is your username.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
          <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Code</FormLabel>
              <FormControl>
              <InputOTP maxLength={6} {...field} pattern={REGEXP_ONLY_DIGITS}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormDescription>
                This is your verification code.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>{
          isSubmitting ? (<>
            <Loader2 className="mr-2 h-4 w-4 animate-spin"></Loader2> Please wait
          </>) : ("Verify")
        }</Button>
          </form>
      </Form>
      {/* <div className="text-center mt-4">
        <p>
          Already a member?{' '}
          <Link href="/sign-in" className="text-blue-600 hover:text-blue-800">
            Sign in
          </Link>
        </p>
      </div> */}
    </div>
  </div>
  )
}

export default VerifyAccount