const { createClient } = require('@supabase/supabase-js')
require('fs').readFileSync('.env.local','utf8').split('\n').forEach(l=>{const [k,...v]=l.split('=');if(k&&v.length)process.env[k.trim()]=v.join('=').trim()})
const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
admin.from('inquiry_submissions').select('*').limit(1).then(({data,error})=>{
  console.log('inquiry_submissions error:', error?.message || 'OK')
  console.log('data:', JSON.stringify(data))
})
