const { createClient } = require('@supabase/supabase-js')
require('fs').readFileSync('.env.local','utf8').split('\n').forEach(l=>{const [k,...v]=l.split('=');if(k&&v.length)process.env[k.trim()]=v.join('=').trim()})
const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const clientId = '83e44870-8f55-426f-9932-17e28d1ecbe2'
Promise.all([
  admin.from('inquiry_submissions').select('*').eq('client_id', clientId).single(),
  admin.from('bookings').select('*').eq('client_id', clientId).single(),
  admin.from('contracts').select('*').eq('client_id', clientId).single(),
]).then(([inq, booking, contract]) => {
  console.log('Inquiry:', JSON.stringify(inq.data, null, 2))
  console.log('Booking:', JSON.stringify(booking.data, null, 2))
  console.log('Contract:', JSON.stringify(contract.data, null, 2))
})
