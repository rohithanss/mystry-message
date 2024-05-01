
export function handleError(response:any, title:string='', toast: any){
  let errMessage = 'Something went wrong';
  if(response?.data?.error?.[0]){
    errMessage = response?.data?.error?.[0];
  }else if(response?.data?.message){
    errMessage = response?.data?.message
  }
  console.log('toasting')
  toast({
    title: (title ?title : 'Request') + " failed",
    description: errMessage,
    variant: 'destructive'
  })
}