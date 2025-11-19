import mongoose from 'mongoose'

const bannerSchema = new mongoose.Schema({
    desktop : { type : String, default : '' },
    mobile : { type : String, default : '' },
    desktopSlides : { type : [String], default : [] },
    mobileSlides : { type : [String], default : [] },
    paymentQR : { type : String, default : '' },
    paymentInstructions : { type : String, default : 'Scan QR code to complete payment' },
    active : { type : Boolean, default : true }
},{ timestamps : true })

const BannerModel = mongoose.model('banner', bannerSchema)

export default BannerModel


