import { v2 as cloudinary } from 'cloudinary';

let cloudinaryConfigured = false

const configureCloudinaryOnce = ()=>{
    if(cloudinaryConfigured){
        return
    }

    const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || process.env.CLODINARY_CLOUD_NAME
    const API_KEY = process.env.CLOUDINARY_API_KEY || process.env.CLODINARY_API_KEY
    const API_SECRET = process.env.CLOUDINARY_API_SECRET || process.env.CLODINARY_API_SECRET_KEY

    const missing = []
    if(!CLOUD_NAME){ missing.push('CLOUDINARY_CLOUD_NAME') }
    if(!API_KEY){ missing.push('CLOUDINARY_API_KEY') }
    if(!API_SECRET){ missing.push('CLOUDINARY_API_SECRET') }

    if(missing.length){
        throw new Error(`Cloudinary env vars missing: set ${missing.join(', ')}`)
    }

    cloudinary.config({
        cloud_name : CLOUD_NAME,
        api_key : API_KEY,
        api_secret : API_SECRET
    })

    cloudinaryConfigured = true
}

const uploadImageClodinary = async(image)=>{
    configureCloudinaryOnce()
    const buffer = image?.buffer || Buffer.from(await image.arrayBuffer())

    const uploadImage = await new Promise((resolve,reject)=>{
        cloudinary.uploader.upload_stream({ folder : "binkeyit"},(error,uploadResult)=>{
            if(error){
                return reject(error)
            }
            return resolve(uploadResult)
        }).end(buffer)
    })

    return uploadImage
}

export default uploadImageClodinary
