import React, { useState, useEffect } from 'react'
import { useGlobalContext } from '../provider/GlobalProvider'
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees'
import AddAddress from '../components/AddAddress'
import { useSelector } from 'react-redux'
import AxiosToastError from '../utils/AxiosToastError'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
// Removed Stripe import

const CheckoutPage = () => {
  const { notDiscountTotalPrice, totalPrice, totalQty, fetchCartItem,fetchOrder } = useGlobalContext()
  const [openAddress, setOpenAddress] = useState(false)
  const [guestName,setGuestName] = useState("")
  const [guestAddress,setGuestAddress] = useState({ address_line : "", city : "", state : "", country : "", pincode : "", mobile : "" })
  const addressList = useSelector(state => state.addresses.addressList)
  const [selectAddress, setSelectAddress] = useState(0)
  const cartItemsList = useSelector(state => state.cartItem.cart)
  const user = useSelector(state => state.user)
  const navigate = useNavigate()
  const isGuest = !user?._id && !localStorage.getItem('accesstoken')
  const [showQRPayment, setShowQRPayment] = useState(false)
  const [bannerData, setBannerData] = useState({ paymentQR: '', paymentInstructions: '' })

  // Fetch banner data for QR payment
  useEffect(() => {
    const fetchBannerData = async () => {
      try {
        console.log('Fetching banner data...')
        const response = await Axios({ ...SummaryApi.getBanner })
        console.log('Banner response:', response)
        const { data: responseData } = response
        console.log('Banner data:', responseData)
        if (responseData.success) {
          setBannerData({
            paymentQR: responseData?.data?.paymentQR || '',
            paymentInstructions: responseData?.data?.paymentInstructions || 'Scan QR code to complete payment'
          })
          console.log('Banner data set:', {
            paymentQR: responseData?.data?.paymentQR || '',
            paymentInstructions: responseData?.data?.paymentInstructions || 'Scan QR code to complete payment'
          })
        }
      } catch (err) {
        console.log('Error fetching banner data:', err)
        // Set default values if fetch fails
        setBannerData({
          paymentQR: '',
          paymentInstructions: 'Scan QR code to complete payment'
        })
      }
    }
    
    fetchBannerData()
  }, [])

  const handleCashOnDelivery = async() => {
      try {
          if (!cartItemsList || cartItemsList.length === 0) {
            toast.error('Cart is empty')
            return
          }
          
          const accessToken = localStorage.getItem('accesstoken')
          const apiConfig = accessToken ? SummaryApi.CashOnDeliveryOrder : SummaryApi.guestCashOnDeliveryOrder
          const payload = accessToken ? {
            list_items : cartItemsList,
            addressId : addressList[selectAddress]?._id,
            subTotalAmt : totalPrice,
            totalAmt :  totalPrice,
          } : {
            list_items : cartItemsList,
            subTotalAmt : totalPrice,
            totalAmt : totalPrice,
            guest : true,
            name : guestName,
            guest_address : guestAddress
          }
          const response = await Axios({
            ...apiConfig,
            data : payload
          })

          const { data : responseData } = response

          if(responseData.success){
              toast.success(responseData.message)
              // clear guest cart if present
              if(!localStorage.getItem('accesstoken')){
                localStorage.removeItem('guest_cart')
              }
              if(fetchCartItem){ fetchCartItem() }
              if(fetchOrder && !isGuest){
                fetchOrder()
              }
              navigate('/success',{
                state : {
                  text : "Order"
                }
              })
          }

      } catch (error) {
        AxiosToastError(error)
      }
  }

  const handleQRPayment = () => {
    if (!bannerData.paymentQR) {
      toast.error('Payment QR code not available')
      return
    }
    setShowQRPayment(true)
  }

  const handleQRPaymentComplete = async () => {
    try {
      if (!cartItemsList || cartItemsList.length === 0) {
        toast.error('Cart is empty')
        return
      }
      
      // Process the order after QR payment
      const accessToken = localStorage.getItem('accesstoken')
      const apiConfig = accessToken ? SummaryApi.CashOnDeliveryOrder : SummaryApi.guestCashOnDeliveryOrder
      const payload = accessToken ? {
        list_items : cartItemsList,
        addressId : addressList[selectAddress]?._id,
        subTotalAmt : totalPrice,
        totalAmt :  totalPrice,
      } : {
        list_items : cartItemsList,
        subTotalAmt : totalPrice,
        totalAmt : totalPrice,
        guest : true,
        name : guestName,
        guest_address : guestAddress
      }
      
      const response = await Axios({
        ...apiConfig,
        data : payload
      })

      const { data : responseData } = response

      if(responseData.success){
          toast.success('Payment completed! Order placed successfully')
          setShowQRPayment(false)
          // clear guest cart if present
          if(!localStorage.getItem('accesstoken')){
            localStorage.removeItem('guest_cart')
          }
          if(fetchCartItem){ fetchCartItem() }
          if(fetchOrder && !isGuest){
            fetchOrder()
          }
          navigate('/success',{
            state : {
              text : "Order"
            }
          })
      }
    } catch (error) {
      AxiosToastError(error)
    }
  }
  return (
    <section className='bg-blue-50 min-h-screen'>
      <div className='container mx-auto p-4 flex flex-col lg:flex-row w-full gap-5 justify-between'>
        {!isGuest && (
          <div className='w-full'>
            {/***address***/}
            <h3 className='text-lg font-semibold'>Choose your address</h3>
            <div className='bg-white p-2 grid gap-4'>
              {
                addressList.map((address, index) => {
                  return (
                    <label htmlFor={"address" + index} className={!address.status && "hidden"}>
                      <div className='border rounded p-3 flex gap-3 hover:bg-blue-50'>
                        <div>
                          <input id={"address" + index} type='radio' value={index} onChange={(e) => setSelectAddress(e.target.value)} name='address' />
                        </div>
                        <div>
                          <p>{address.address_line}</p>
                          <p>{address.city}</p>
                          <p>{address.state}</p>
                          <p>{address.country} - {address.pincode}</p>
                          <p>{address.mobile}</p>
                        </div>
                      </div>
                    </label>
                  )
                })
              }
              <div onClick={() => setOpenAddress(true)} className='h-16 bg-blue-50 border-2 border-dashed flex justify-center items-center cursor-pointer'>
                Add address
              </div>
            </div>
          </div>
        )}

        <div className='w-full max-w-md bg-white py-4 px-2 rounded shadow'>
          {/**summary**/}
          <h3 className='text-lg font-semibold mb-4'>Order Summary</h3>
          { isGuest && (
            <div className='bg-white p-4 grid gap-3'>
              <div>
                <label className='font-medium text-sm' htmlFor='guest_name'>Your name</label>
                <input id='guest_name' value={guestName} onChange={(e)=>setGuestName(e.target.value)} placeholder='Enter your name' className='mt-1 bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded w-full'/>
              </div>
              <div>
                <label className='font-medium text-sm' htmlFor='ga1'>Address line</label>
                <input id='ga1' value={guestAddress.address_line} onChange={(e)=>setGuestAddress(v=>({...v,address_line:e.target.value}))} placeholder='Street, area' className='mt-1 bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded w-full'/>
              </div>
              <div className='grid grid-cols-2 gap-3'>
                <div>
                  <label className='font-medium text-sm' htmlFor='gcity'>City</label>
                  <input id='gcity' value={guestAddress.city} onChange={(e)=>setGuestAddress(v=>({...v,city:e.target.value}))} className='mt-1 bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded w-full'/>
                </div>
                <div>
                  <label className='font-medium text-sm' htmlFor='gstate'>State</label>
                  <input id='gstate' value={guestAddress.state} onChange={(e)=>setGuestAddress(v=>({...v,state:e.target.value}))} className='mt-1 bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded w-full'/>
                </div>
              </div>
              <div className='grid grid-cols-2 gap-3'>
                <div>
                  <label className='font-medium text-sm' htmlFor='gcountry'>Country</label>
                  <input id='gcountry' value={guestAddress.country} onChange={(e)=>setGuestAddress(v=>({...v,country:e.target.value}))} className='mt-1 bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded w-full'/>
                </div>
                <div>
                  <label className='font-medium text-sm' htmlFor='gpin'>Pincode</label>
                  <input id='gpin' value={guestAddress.pincode} onChange={(e)=>setGuestAddress(v=>({...v,pincode:e.target.value}))} className='mt-1 bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded w-full'/>
                </div>
              </div>
              <div>
                <label className='font-medium text-sm' htmlFor='gmobile'>Mobile</label>
                <input id='gmobile' value={guestAddress.mobile} onChange={(e)=>setGuestAddress(v=>({...v,mobile:e.target.value}))} className='mt-1 bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded w-full'/>
              </div>
            </div>
          ) }
          <div className='bg-white p-4'>
            <h3 className='font-semibold'>Bill details</h3>
            <div className='flex gap-4 justify-between ml-1'>
              <p>Items total</p>
              <p className='flex items-center gap-2'><span className='line-through text-neutral-400'>{DisplayPriceInRupees(notDiscountTotalPrice)}</span><span>{DisplayPriceInRupees(totalPrice)}</span></p>
            </div>
            <div className='flex gap-4 justify-between ml-1'>
              <p>Quntity total</p>
              <p className='flex items-center gap-2'>{totalQty} item</p>
            </div>
            <div className='flex gap-4 justify-between ml-1'>
              <p>Delivery Charge</p>
              <p className='flex items-center gap-2'>Free</p>
            </div>
            <div className='font-semibold flex items-center justify-between gap-4'>
              <p >Grand total</p>
              <p>{DisplayPriceInRupees(totalPrice)}</p>
            </div>
          </div>
          <div className='w-full flex flex-col gap-4 mt-6'>
            <h3 className='text-lg font-semibold text-gray-800'>Payment Method</h3>
            {/* Debug info - remove this later */}
            <div className='text-xs text-gray-500 p-2 bg-gray-100 rounded'>
              Debug: paymentQR = "{bannerData.paymentQR}" | paymentInstructions = "{bannerData.paymentInstructions}"
            </div>
            <div className='space-y-3'>
              { (bannerData.paymentQR || true) && (
                <button className='w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold transition-colors' onClick={handleQRPayment}>
                  📱 QR Code Payment
                </button>
              )}
              <button className='w-full py-3 px-4 border-2 border-green-600 font-semibold text-green-600 hover:bg-green-600 hover:text-white rounded transition-colors' onClick={handleCashOnDelivery}>
                💰 Cash on Delivery
              </button>
            </div>
          </div>
        </div>
      </div>


      { (!isGuest && openAddress) && (
          <AddAddress close={() => setOpenAddress(false)} />
        ) }

      {/* QR Payment Modal */}
      { showQRPayment && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white p-6 rounded-lg max-w-md w-full mx-4'>
            <h3 className='text-xl font-semibold mb-4 text-center'>Complete Payment</h3>
            <div className='text-center'>
              <p className='mb-4 text-gray-600'>{bannerData.paymentInstructions || 'Scan QR code to complete payment'}</p>
              {bannerData.paymentQR ? (
                <img 
                  src={bannerData.paymentQR} 
                  alt='Payment QR Code' 
                  className='mx-auto border rounded-lg mb-4 max-w-64 max-h-64'
                />
              ) : (
                <div className='mx-auto border rounded-lg mb-4 max-w-64 max-h-64 bg-gray-100 flex items-center justify-center p-8'>
                  <p className='text-gray-500 text-sm'>No QR code uploaded yet.<br/>Please contact admin.</p>
                </div>
              )}
              <p className='text-sm text-gray-500 mb-4'>Amount: {DisplayPriceInRupees(totalPrice)}</p>
              <div className='flex gap-3'>
                <button 
                  onClick={handleQRPaymentComplete}
                  className='flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded font-semibold'
                >
                  Payment Done
                </button>
                <button 
                  onClick={() => setShowQRPayment(false)}
                  className='flex-1 py-2 px-4 bg-gray-500 hover:bg-gray-600 text-white rounded font-semibold'
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default CheckoutPage
