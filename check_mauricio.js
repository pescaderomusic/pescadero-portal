const { createClient } = require('@supabase/supabase-js')
require('fs').readFileSync('.env.local','utf8').split('\n').forEach(l=>{const [k,...v]=l.split('=');if(k&&v.length)process.env[k.trim()]=v.join('=').trim()})
const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
admin.auth.admin.listUsers().then(({data})=>{
  const user = data.users.find(u=>u.email==='mausalgar.3@gmail.com')
  console.log('User:', JSON.stringify(user, null, 2))
  if(user) {
    admin.from('inquiry_submissions').select('*').eq('client_id', user.id).then(({data,error})=>{
      console.log('Inquiry row:', JSON.stringify(data, null, 2))
      console.log('Error:', error?.message)
    })
  }
})
