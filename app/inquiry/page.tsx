import { redirect } from 'next/navigation'

// The inquiry form is served as a static HTML file
// This redirect sends users to the static page
export default function InquiryPage() {
  redirect('/inquiry.html')
}
