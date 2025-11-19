import React, { useEffect, useState } from 'react'
import bannerFallback from '../assets/banner.jpg'
import bannerMobileFallback from '../assets/banner-mobile.jpg'
import { useSelector } from 'react-redux'
import { valideURLConvert } from '../utils/valideURLConvert'
import {Link, useNavigate} from 'react-router-dom'
import CategoryWiseProductDisplay from '../components/CategoryWiseProductDisplay'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'

const Home = () => {
  const loadingCategory = useSelector(state => state.product.loadingCategory)
  const categoryData = useSelector(state => state.product.allCategory)
  const subCategoryData = useSelector(state => state.product.allSubCategory)
  const navigate = useNavigate()
  const [banner,setBanner] = useState({ desktop : '', mobile : '', desktopSlides : [], mobileSlides : [] })
  const [desktopIndex,setDesktopIndex] = useState(0)
  const cacheKey = String(banner?.desktop || banner?.mobile ? Date.now() : '')

  useEffect(()=>{
    (async()=>{
      try{
        const response = await Axios({ ...SummaryApi.getBanner, params : { t : Date.now() } })
        const { data : responseData } = response
        if(responseData.success){
          setBanner({ 
            desktop : responseData?.data?.desktop || '', 
            mobile : responseData?.data?.mobile || '',
            desktopSlides : responseData?.data?.desktopSlides || [],
            mobileSlides : responseData?.data?.mobileSlides || []
          })
        }
      }catch(err){
        // ignore, fallback will show
      }
    })()
  },[])

  // autoplay desktop slider every 2s
  useEffect(()=>{
    const total = banner?.desktopSlides?.length || 0
    if(total <= 1){
      setDesktopIndex(0)
      return
    }
    const timer = setInterval(()=>{
      setDesktopIndex((prev)=> (prev + 1) % total)
    },2000)
    return ()=> clearInterval(timer)
  },[banner?.desktopSlides])

  const handleRedirectProductListpage = (id,cat)=>{
      console.log(id,cat)
      const subcategory = subCategoryData.find(sub =>{
        const filterData = sub.category.some(c => {
          return c._id == id
        })

        return filterData ? true : null
      })
      const url = `/${valideURLConvert(cat)}-${id}/${valideURLConvert(subcategory.name)}-${subcategory._id}`

      navigate(url)
      console.log(url)
  }


  return (
   <section className='bg-white'>
      <div className='container mx-auto'>
          <div className={`w-full bg-blue-100 rounded overflow-hidden`}> 
              <div className='hidden lg:block w-full h-72'>
                {
                  (banner.desktopSlides?.length ? banner.desktopSlides : [banner.desktop || bannerFallback]).map((src,idx)=> (
                    <img key={src+idx}
                      src={`${src}${src ? (cacheKey ? `?t=${cacheKey}` : '') : ''}`}
                      className={`w-full h-full object-cover ${idx===desktopIndex ? 'block' : 'hidden'}`}
                      alt='banner'
                    />
                  ))
                }
              </div>
              <div className='lg:hidden w-full h-48'>
                {
                  (banner.mobileSlides?.length ? banner.mobileSlides : [banner.mobile || bannerMobileFallback]).map((src,idx)=> (
                    <img key={src+idx}
                      src={`${src}${src ? (cacheKey ? `?t=${cacheKey}` : '') : ''}`}
                      className={`w-full h-full object-cover ${idx===0 ? 'block' : 'hidden'}`}
                      alt='banner'
                    />
                  ))
                }
              </div>
          </div>
      </div>
      
      <div className='container mx-auto px-4 my-2 grid grid-cols-5 md:grid-cols-8 lg:grid-cols-10  gap-2'>
          {
            loadingCategory ? (
              new Array(12).fill(null).map((c,index)=>{
                return(
                  <div key={index+"loadingcategory"} className='bg-white rounded p-4 min-h-36 grid gap-2 shadow animate-pulse'>
                    <div className='bg-blue-100 min-h-24 rounded'></div>
                    <div className='bg-blue-100 h-8 rounded'></div>
                  </div>
                )
              })
            ) : (
              categoryData.map((cat,index)=>{
                return(
                  <div key={cat._id+"displayCategory"} className='w-full h-full' onClick={()=>handleRedirectProductListpage(cat._id,cat.name)}>
                    <div>
                        <img 
                          src={cat.image}
                          className='w-full h-full object-scale-down'
                        />
                    </div>
                  </div>
                )
              })
              
            )
          }
      </div>

      {/***display category product */}
      {
        categoryData?.map((c,index)=>{
          return(
            <CategoryWiseProductDisplay 
              key={c?._id+"CategorywiseProduct"} 
              id={c?._id} 
              name={c?.name}
            />
          )
        })
      }



   </section>
  )
}

export default Home
