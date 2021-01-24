//import {User} from './ums.js'

class Request{
    /**
     * 
     * @param {string} url 
     * @param {string|object} body 
     * @param {"arraybuffer"|"blob"|"document"|"json"|"text"} responseType 
     */
    static json_post_request(url, body, responseType = 'json'){
        return new Promise((resolve, reject)=>{
            try{
                const body_string = JSON.stringify(body)
                var xhr = new XMLHttpRequest()
                xhr.open('POST', url, true)
                xhr.setRequestHeader("Content-Type", "application/json")
                //xhr.setRequestHeader("Cookie", "user_token="+User.local.user_token)
                xhr.responseType = responseType
                xhr.send(body_string)
                xhr.onload = function(){
                    if(this.readyState === XMLHttpRequest.DONE){
                        console.log(this.responseType);
                        resolve(xhr.response)
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
Request.DATA_SERVER_HOST = "http://localhost:9411"
Request.FILE_STORE_HOST = "http://localhost:1755"

export {Request}