const fs = require('fs')
let content = fs.readFileSync('app/api/inquiry/submit/route.ts', 'utf8')

content = content.replace(
  `  const { error: inquiryErr } = await admin
    .from('inquiry_submissions')
    .upsert({`,
  `  // Delete existing row first, then insert fresh
  await admin.from('inquiry_submissions').delete().eq('client_id', userId)

  const { error: inquiryErr } = await admin
    .from('inquiry_submissions')
    .insert({`
)

content = content.replace(
  `    }, { onConflict: 'client_id' })`,
  `    })`
)

fs.writeFileSync('app/api/inquiry/submit/route.ts', content)
console.log('Done')
