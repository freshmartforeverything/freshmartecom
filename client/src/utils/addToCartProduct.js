import toast from "react-hot-toast"
import SummaryApi from "../common/SummaryApi"
import Axios from "./Axios"
import AxiosToastError from "./AxiosToastError"

export const addToCartProduct = async(productId,qty)=>{
    try {
        const accessToken = localStorage.getItem('accesstoken')
        if(!accessToken){
            // Guest cart in localStorage
            const raw = localStorage.getItem('guest_cart')
            const guestCart = raw ? JSON.parse(raw) : []
            const existingIndex = guestCart.findIndex(it => it?.productId?._id === productId?._id || it?.productId === productId)
            if(existingIndex > -1){
                guestCart[existingIndex].quantity += qty || 1
            }else{
                // Allow productId to be either id or full product object; normalize to object for UI
                const normalized = typeof productId === 'object' ? { productId : productId, quantity : qty || 1 } : { productId : { _id : productId }, quantity : qty || 1 }
                guestCart.push(normalized)
            }
            localStorage.setItem('guest_cart', JSON.stringify(guestCart))
            toast.success('Item added to cart')
            return { success : true, data : guestCart }
        }

        const response = await Axios({
            ...SummaryApi.addTocart,
            data : {
                quantity : qty,
                productId : productId?._id || productId
            }
        })

        const { data : responseData} = response

        console.log(responseData)
        if(responseData.success){
            toast.success(responseData.message)
        }
        return responseData

    } catch (error) {
        AxiosToastError(error)

        return {}
    }
}

export const getCartItems = async()=>{
    try {
        const accessToken = localStorage.getItem('accesstoken')
        if(!accessToken){
            const raw = localStorage.getItem('guest_cart')
            const guestCart = raw ? JSON.parse(raw) : []
            return { success : true, data : guestCart }
        }
        const response = await Axios({
            ...SummaryApi.getCartItem
        })

        const { data : responseData } = response

        if(responseData.success){
            return responseData 
        }
    } catch (error) {
        AxiosToastError(error)
        return error
    }
}