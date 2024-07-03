// import backendAxios from "."


// export const login = async (email: string, password: string):Promise<[null, string]|[string, null]> => { 
//    try {
//       const resp =await backendAxios.post<{message:string, data: string}>('/auth/login', {email, password})
//       const {data} =resp.data
//       return [null, data]
//    } catch (error) {
//      const  msg = 'Error'
//       return [msg, null]   
//    }


// }

// const [err, data] = await login('email', 'password')
// if(err) toast.err(err)
//    if(data)