import React, { useEffect, useMemo, useState } from 'react'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import Loading from '../components/Loading'
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees'

const AdminOrders = () => {
  const [orders,setOrders] = useState([])
  const [loading,setLoading] = useState(false)

  const fetchOrders = async()=>{
    try{
      setLoading(true)
      const response = await Axios({ ...SummaryApi.adminAllOrders })
      const { data : responseData } = response
      if(responseData.success){
        setOrders(responseData.data)
      }
    }catch(err){
    }finally{
      setLoading(false)
    }
  }

  useEffect(()=>{ fetchOrders() },[])

  return (
    <section>
      <div className='p-2 bg-white shadow-md flex items-center justify-between'>
        <h2 className='font-semibold'>All Orders</h2>
      </div>
      { loading && <Loading/> }
      <div className='p-4 bg-blue-50'>
        <div className='bg-white rounded shadow overflow-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='bg-blue-100'>
                <th className='p-2 text-left'>Order ID</th>
                <th className='p-2 text-left'>Customer</th>
                <th className='p-2 text-left'>Contact</th>
                <th className='p-2 text-left'>Address</th>
                <th className='p-2 text-left'>Product</th>
                <th className='p-2 text-left'>Amount</th>
                <th className='p-2 text-left'>Payment</th>
                <th className='p-2 text-left'>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => {
                const userName = o?.userId?.name || o?.guest_name || 'Guest'
                const contact = o?.userId?.email || o?.userId?.mobile || o?.guest_address?.mobile || ''
                const address = o?.delivery_address ? `${o.delivery_address.address_line}, ${o.delivery_address.city}, ${o.delivery_address.state}, ${o.delivery_address.country} - ${o.delivery_address.pincode}` : `${o?.guest_address?.address_line || ''} ${o?.guest_address?.city || ''} ${o?.guest_address?.state || ''} ${o?.guest_address?.country || ''} ${o?.guest_address?.pincode || ''}`
                const amount = DisplayPriceInRupees(o.totalAmt)
                return (
                  <tr key={o._id} className='border-b'>
                    <td className='p-2 whitespace-nowrap'>{o.orderId}</td>
                    <td className='p-2 whitespace-nowrap'>{userName}</td>
                    <td className='p-2 whitespace-nowrap'>{contact}</td>
                    <td className='p-2'>{address}</td>
                    <td className='p-2 whitespace-nowrap'>{o?.product_details?.name}</td>
                    <td className='p-2 whitespace-nowrap'>{amount}</td>
                    <td className='p-2 whitespace-nowrap'>{o.payment_status}</td>
                    <td className='p-2 whitespace-nowrap'>{new Date(o.createdAt).toLocaleString()}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export default AdminOrders


