const ImageKit = require('@imagekit/nodejs');

const client = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY, 
})
const fileUpload=async(buffer) =>{
    try {
        const response= await client.files.upload({
            file: buffer.toString('base64'),
            fileName: `${Date.now()}.jpg`,
        })
        return response
    } catch (error) {
        console.log(error.message)
    }
    
}       
module.exports={fileUpload}