import React, { useEffect, useState } from 'react'
import SummaryApi from '../common/SummaryApi'
import AxiosToastError from '../utils/AxiosToastError'
import Axios from '../utils/Axios'
import Loading from '../components/Loading'
import ProductCardAdmin from '../components/ProductCardAdmin'
import uploadImage from '../utils/UploadImage'
import toast from 'react-hot-toast'
import { IoSearchOutline } from "react-icons/io5";
import EditProductAdmin from '../components/EditProductAdmin'

const ProductAdmin = () => {
  const [productData,setProductData] = useState([])
  const [page,setPage] = useState(1)
  const [loading,setLoading] = useState(false)
  const [totalPageCount,setTotalPageCount] = useState(1)
  const [search,setSearch] = useState("")
  const [bannerDesktop,setBannerDesktop] = useState('')
  const [bannerMobile,setBannerMobile] = useState('')
  const [savingBanner,setSavingBanner] = useState(false)
  const [desktopSlides,setDesktopSlides] = useState([])
  const [mobileSlides,setMobileSlides] = useState([])
  const [paymentQR,setPaymentQR] = useState('')
  const [paymentInstructions,setPaymentInstructions] = useState('')
  const [orders,setOrders] = useState([])
  
  const fetchProductData = async()=>{
    try {
        setLoading(true)
        const response = await Axios({
           ...SummaryApi.getProduct,
           data : {
              page : page,
              limit : 12,
              search : search 
           }
        })

        const { data : responseData } = response 

        if(responseData.success){
          setTotalPageCount(responseData.totalNoPage)
          setProductData(responseData.data)
        }

    } catch (error) {
      AxiosToastError(error)
    }finally{
      setLoading(false)
    }
  }
  
  useEffect(()=>{
    fetchProductData()
  },[page])

  const handleNext = ()=>{
    if(page !== totalPageCount){
      setPage(preve => preve + 1)
    }
  }
  const handlePrevious = ()=>{
    if(page > 1){
      setPage(preve => preve - 1)
    }
  }

  const handleOnChange = (e)=>{
    const { value } = e.target
    setSearch(value)
    setPage(1)
  }

  useEffect(()=>{
    let flag = true 

    const interval = setTimeout(() => {
      if(flag){
        fetchProductData()
        flag = false
      }
    }, 300);

    return ()=>{
      clearTimeout(interval)
    }
  },[search])
  useEffect(()=>{
    (async()=>{
      try{
        const response = await Axios({ ...SummaryApi.getBanner })
        const { data : responseData } = response
        if(responseData.success){
          setBannerDesktop(responseData?.data?.desktop || '')
          setBannerMobile(responseData?.data?.mobile || '')
          setDesktopSlides(responseData?.data?.desktopSlides || [])
          setMobileSlides(responseData?.data?.mobileSlides || [])
          setPaymentQR(responseData?.data?.paymentQR || '')
          setPaymentInstructions(responseData?.data?.paymentInstructions || '')
        }
      }catch(err){}
    })()
  },[])
  useEffect(()=>{
    (async()=>{
      try{
        const response = await Axios({ ...SummaryApi.adminAllOrders })
        const { data : responseData } = response
        if(responseData.success){
          setOrders(responseData.data)
        }
      }catch(err){ }
    })()
  },[])
  
  return (
    <section className=''>
        <div className='p-2  bg-white shadow-md flex items-center justify-between gap-4'>
                <h2 className='font-semibold'>Product</h2>
                <div className='h-full min-w-24 max-w-56 w-full ml-auto bg-blue-50 px-4 flex items-center gap-3 py-2 rounded  border focus-within:border-primary-200'>
                  <IoSearchOutline size={25}/>
                  <input
                    type='text'
                    placeholder='Search product here ...' 
                    className='h-full w-full  outline-none bg-transparent'
                    value={search}
                    onChange={handleOnChange}
                  />
                </div>
        </div>
        {
          loading && (
            <Loading/>
          )
        }


        <div className='p-4 bg-blue-50'>


            <div className='min-h-[55vh]'>
              <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4'>
                {
                  productData.map((p,index)=>{
                    return(
                      <ProductCardAdmin data={p} fetchProductData={fetchProductData}  />
                    )
                  })
                }
              </div>
            </div>
            <div className='bg-white p-4 mt-4 rounded shadow'>
              <h3 className='font-semibold mb-2'>Home Banner</h3>
              <div className='grid md:grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm mb-1'>Desktop Banner</p>
                  { bannerDesktop ? <img src={bannerDesktop} alt='desktop banner' className='h-24 object-cover'/> : null }
                  <input type='file' onChange={async(e)=>{ const f=e.target.files?.[0]; if(!f)return; try{ const res=await uploadImage(f); const url=res?.data?.data?.secure_url || res?.data?.data?.url; if(url){ setBannerDesktop(url); toast.success('Desktop banner uploaded') } else { toast.error('Upload failed: no URL') } }catch(err){ AxiosToastError(err) } }} />
                  <div className='mt-2'>
                    <p className='text-sm mb-1'>Desktop Slides</p>
                    <div className='flex flex-wrap gap-2'>
                      {desktopSlides.map((s,idx)=> (
                        <div key={s+idx} className='relative'>
                          <img src={s} className='h-16 w-28 object-cover rounded'/>
                          <button onClick={()=> setDesktopSlides(desktopSlides.filter((_,i)=>i!==idx)) } className='absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6'>x</button>
                        </div>
                      ))}
                    </div>
                    <input type='file' className='mt-2' onChange={async(e)=>{ const f=e.target.files?.[0]; if(!f)return; try{ const res=await uploadImage(f); const url=res?.data?.data?.secure_url || res?.data?.data?.url; if(url){ setDesktopSlides(prev=>[...prev,url]); toast.success('Slide added') } else { toast.error('Upload failed: no URL') } }catch(err){ AxiosToastError(err) } }} />
                  </div>
                </div>
                <div>
                  <p className='text-sm mb-1'>Mobile Banner</p>
                  { bannerMobile ? <img src={bannerMobile} alt='mobile banner' className='h-24 object-cover'/> : null }
                  <input type='file' onChange={async(e)=>{ const f=e.target.files?.[0]; if(!f)return; try{ const res=await uploadImage(f); const url=res?.data?.data?.secure_url || res?.data?.data?.url; if(url){ setBannerMobile(url); toast.success('Mobile banner uploaded') } else { toast.error('Upload failed: no URL') } }catch(err){ AxiosToastError(err) } }} />
                  <div className='mt-2'>
                    <p className='text-sm mb-1'>Mobile Slides</p>
                    <div className='flex flex-wrap gap-2'>
                      {mobileSlides.map((s,idx)=> (
                        <div key={s+idx} className='relative'>
                          <img src={s} className='h-16 w-28 object-cover rounded'/>
                          <button onClick={()=> setMobileSlides(mobileSlides.filter((_,i)=>i!==idx)) } className='absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6'>x</button>
                        </div>
                      ))}
                    </div>
                    <input type='file' className='mt-2' onChange={async(e)=>{ const f=e.target.files?.[0]; if(!f)return; try{ const res=await uploadImage(f); const url=res?.data?.data?.secure_url || res?.data?.data?.url; if(url){ setMobileSlides(prev=>[...prev,url]); toast.success('Slide added') } else { toast.error('Upload failed: no URL') } }catch(err){ AxiosToastError(err) } }} />
                  </div>
                </div>
              </div>
              <div className='mt-4'>
                <h4 className='font-semibold mb-2'>Payment QR Code</h4>
                <div className='grid md:grid-cols-2 gap-4'>
                  <div>
                    <p className='text-sm mb-1'>QR Code Image</p>
                    { paymentQR ? <img src={paymentQR} alt='payment QR' className='h-32 w-32 object-cover border rounded'/> : null }
                    <input type='file' className='mt-2' onChange={async(e)=>{ const f=e.target.files?.[0]; if(!f)return; try{ const res=await uploadImage(f); const url=res?.data?.data?.secure_url || res?.data?.data?.url; if(url){ setPaymentQR(url); toast.success('QR code uploaded') } else { toast.error('Upload failed: no URL') } }catch(err){ AxiosToastError(err) } }} />
                  </div>
                  <div>
                    <p className='text-sm mb-1'>Payment Instructions</p>
                    <textarea value={paymentInstructions} onChange={(e)=>setPaymentInstructions(e.target.value)} placeholder='Enter payment instructions' className='w-full p-2 border rounded' rows={3}/>
                  </div>
                </div>
              </div>
              <button disabled={savingBanner} onClick={async()=>{ try{ setSavingBanner(true); const response = await Axios({ ...SummaryApi.updateBanner, data : { desktop : bannerDesktop, mobile : bannerMobile, desktopSlides, mobileSlides, paymentQR, paymentInstructions } }); const { data : responseData } = response; if(responseData.success){ toast.success(responseData.message) } }catch(err){ AxiosToastError(err) } finally{ setSavingBanner(false) } }} className='mt-3 bg-primary-100 hover:bg-primary-200 py-2 rounded font-semibold px-4'>Save Banner</button>
            </div>
            <div className='bg-white p-4 mt-4 rounded shadow'>
              <h3 className='font-semibold mb-2'>Orders</h3>
              <div className='overflow-auto'>
                <table className='w-full text-sm'>
                  <thead>
                    <tr className='bg-blue-100'>
                      <th className='p-2 text-left'>Order ID</th>
                      <th className='p-2 text-left'>User</th>
                      <th className='p-2 text-left'>Product</th>
                      <th className='p-2 text-left'>Amount</th>
                      <th className='p-2 text-left'>Payment</th>
                      <th className='p-2 text-left'>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o)=>{
                      return (
                        <tr key={o._id} className='border-b'>
                          <td className='p-2'>{o.orderId}</td>
                          <td className='p-2'>{o.userId ? o.userId : (o.guest_name || 'Guest')}</td>
                          <td className='p-2'>{o?.product_details?.name}</td>
                          <td className='p-2'>{o.totalAmt}</td>
                          <td className='p-2'>{o.payment_status}</td>
                          <td className='p-2'>{new Date(o.createdAt).toLocaleString()}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className='flex justify-between my-4'>
              <button onClick={handlePrevious} className="border border-primary-200 px-4 py-1 hover:bg-primary-200">Previous</button>
              <button className='w-full bg-slate-100'>{page}/{totalPageCount}</button>
              <button onClick={handleNext} className="border border-primary-200 px-4 py-1 hover:bg-primary-200">Next</button>
            </div>

        </div>
          

      
    </section>
  )
}

export default ProductAdmin
