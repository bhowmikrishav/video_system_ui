class Request{
    static json_post_request(url, body){
        return new Promise((resolve, reject)=>{
            try{
                const body_string = JSON.stringify(body)
                var xhr = new XMLHttpRequest()
                xhr.open('POST', url, true)
                xhr.setRequestHeader("Content-Type", "application/json")
                xhr.send(body_string)
                xhr.onload = function(){
                    if(this.readyState === XMLHttpRequest.DONE){
                        resolve(JSON.parse(this.responseText))
                    }
                }
                xhr.onerror = function(){
                    reject(Error("failed"))
                }
                xhr.onabort = function(){
                    reject(Error("abort"))
                }
            }catch(e){
                reject(e)
            }
        })
    }
}
Request.UMS_HOST = "http://localhost:1812"

class User{
    static async register(name, username, password, repass){
        if(password !== repass) throw Error("Confirm password don't match")
        
        const result = await Request.json_post_request(
            Request.UMS_HOST+"/signup",
            {
                name,
                username,
                password
            }
        )
        return result
    }
    static async login(username, password){
        const result = await Request.json_post_request(
            Request.UMS_HOST+"/login",
            {
                username,
                password
            }
        )
        User.local.user_token = result?result.user_token:null
        localStorage.setItem('user_token', User.local.user_token)
        return result
    }
    static async whoami(user_token = User.local.user_token){
        const result = await Request.json_post_request(
            Request.UMS_HOST+"/whoami",
            {
                user_token
            }
        )
        return result
    }
    static async update_user(updates, user_token = User.local.user_token){
        const result = await Request.json_post_request(
            Request.UMS_HOST+"/update_profile",
            Object.assign(
                {user_token},
                updates.name? {name:updates.name}: null
            )
        )
        return result
    }
}
User.local = {
    user_token:localStorage.getItem('user_token')
}

export {User}