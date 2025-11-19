import BannerModel from "../models/banner.model.js"

export const getBannerController = async(request,response)=>{
    try {
        const banner = await BannerModel.findOne({}).sort({ createdAt : -1 })
        return response.json({
            message : "banner",
            data : banner,
            error : false,
            success : true
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export const upsertBannerController = async(request,response)=>{
    try {
        const { desktop, mobile, active, desktopSlides, mobileSlides, paymentQR, paymentInstructions } = request.body
        const existing = await BannerModel.findOne({})
        if(existing){
            existing.desktop = desktop ?? existing.desktop
            existing.mobile = mobile ?? existing.mobile
            if(typeof active === 'boolean'){ existing.active = active }
            if(Array.isArray(desktopSlides)){ existing.desktopSlides = desktopSlides }
            if(Array.isArray(mobileSlides)){ existing.mobileSlides = mobileSlides }
            if(paymentQR !== undefined){ existing.paymentQR = paymentQR }
            if(paymentInstructions !== undefined){ existing.paymentInstructions = paymentInstructions }
            await existing.save()
            return response.json({ message : 'Banner updated', data : existing, error : false, success : true })
        }
        const created = await BannerModel.create({ desktop, mobile, active, desktopSlides, mobileSlides, paymentQR, paymentInstructions })
        return response.json({ message : 'Banner created', data : created, error : false, success : true })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}


