const { createClient } = require('@supabase/supabase-js')
require('fs').readFileSync('.env.local','utf8').split('\n').forEach(l=>{const [k,...v]=l.split('=');if(k&&v.length)process.env[k.trim()]=v.join('=').trim()})
const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
admin.auth.admin.listUsers().then(({data})=>{
  const user = data.users.find(u=>u.email==='mausalgar.3@gmail.com')
  if(!user){console.log('User not found');return}
  console.log('Found user:', user.id)
  admin.from('inquiry_submissions').delete().eq('client_id', user.id).then(({error})=>{
    if(error) console.log('Error:', error.message)
    else console.log('Inquiry deleted — they can resubmit fresh')
  })
})
