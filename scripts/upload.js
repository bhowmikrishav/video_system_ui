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
                        console.log(this.responseType);
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
    static form_post_request(url, fields){
        return new Promise((resolve, reject)=>{
            try{
                if( (typeof fields != 'object') || (Array.isArray(fields)) ) throw Error("Fields should be type object")
                const form = new FormData()
                for(const field in fields){
                    form.append( field, fields[field])
                }

                var xhr = new XMLHttpRequest()
                xhr.open('POST', url, true)
                //xhr.setRequestHeader('Content-Type', 'multipart/form-data')
                xhr.send(form)

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
Request.FILE_STORE_HOST_ONLY = "localhost:1755"

class User{
    static async update_user(updates){
        const result = await Request.json_post_request(
            `http://${Request.UMS_HOST}/set_file/profile_photo`,
            {
                user_token : User.local.user_token,
                name : updates.name
            }
        )
        return result
    }
}
User.local = {
    user_token:localStorage.getItem('user_token')
}

class FileStore{
    static async upload_profile_photo(blob){
        if(! (blob instanceof Blob) ) throw Error("Blob must be instance of Blob")
        const file_result = await Request.form_post_request(
            `http://${Request.FILE_STORE_HOST_ONLY}/set_file/profile_photo`,
            {user_token : User.local.user_token, file:blob}
        )
        return file_result
    }
    static async upload_video(file){
        if(!(file instanceof File)) throw Error('file should be instance of File')
        var file_manifest = {
            name : file.name,
            size : file.size,
            mime_type : file.type,
            upload_size : 0,
            upload_end : false
        };
        const reader = new FileReader();
        const file_data_buffer = (await new Promise((resolve, reject)=>{
            try{
                reader.readAsArrayBuffer(file)
                reader.onload = function (e){
                    resolve(e.target.result)
                }
                reader.onerror = reject
            }catch(e){
                reject(e)
            }
        }))
        //create ws
        const ws = new WebSocket('ws://localhost:1755/ws/video_file_upload')
        await new Promise((resolve, reject)=>{
            ws.onopen = resolve
            ws.onerror = reject
        })
        console.log(file_manifest);
        ws.send(bson.serialize(
            {
                type:'init',
                data:Object.assign(
                    {user_token:User.local.user_token},
                    file_manifest
                )
            }
        ))
        ws.onmessage = async function(message){
            const data = bson.deserialize(new buffer.Buffer(await message.data.arrayBuffer()))
            if(data.type === 'update_manifest'){
                file_manifest = Object.assign(file_manifest, data.data.file_manifest)
                console.log(file_manifest);
                if (file_manifest.upload_end) {
                    //end upload
                    ws.close(1000, "Upload Complete")
                }else{
                    //next send chunk
                    const chunk = file_data_buffer.slice(file_manifest.upload_size, file_manifest.upload_size + 102400)
                    ws.send(bson.serialize(
                        {
                            type:'chunk',
                            meta_data: {slice_start:file_manifest.upload_size, size:chunk.byteLength},
                            data: new buffer.Buffer(chunk)
                        }
                    ))
                }
            }
        }
        ws.onclose = async function(ev){
            alert('connection closed')
        }
        return {err:null, msg:"Upload In Progress, Don't close this tab"}
    }
}

export {FileStore}