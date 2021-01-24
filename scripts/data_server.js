import {Request} from './request.js'
import {User} from './ums.js'

class VideoData{
    static async my_video_list(){
        const user_token = User.local.user_token
        return await Request.json_post_request(
            Request.DATA_SERVER_HOST + "/my_video_list",
            { user_token }
        )
    }
    /**
     * @param {string} video_id 
     */
    static async get_manifest(video_id){
        return await Request.json_post_request(
            Request.DATA_SERVER_HOST + "/get_manifest",
            { video_id, tokenify: true }
        )
    }
    static async get_public_object(object_token){
        return await Request.json_post_request(
            Request.FILE_STORE_HOST + "/get_public_object",
            {
                "file_token": object_token
            },
            'arraybuffer'
        )
    }
}

export {VideoData}