const { createClient } = require('@supabase/supabase-js')
require('fs').readFileSync('.env.local','utf8').split('\n').forEach(l=>{const [k,...v]=l.split('=');if(k&&v.length)process.env[k.trim()]=v.join('=').trim()})
const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
admin.from('bookings').update({
  event_date: '2026-08-07',
  venue_name: 'The Beehive',
  venue_address: '1595 N Freedom Blvd Provo, UT 84604',
  event_type: 'Garcia Wedding',
}).eq('client_id', '83e44870-8f55-426f-9932-17e28d1ecbe2').then(({error}) => {
  console.log(error ? 'Error: ' + error.message : 'Done — booking updated!')
})
