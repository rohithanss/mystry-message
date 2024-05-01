function response(success:boolean, message: string, data: any = {}){

  if(!success && typeof data == 'object' && !Array.isArray(data) && data.data){
    let newData : string[] = [];
    if(data._errors.length){
      // do something
    }
    for(let key in data.data){
      if(key!='_errors'){
        newData = [...newData, ...(data.data[key]._errors)]
      }
    }
    data = newData;
  }
  return {
    success,
    message,
    [success? 'data': 'error'] : data
  }
}

export default response;