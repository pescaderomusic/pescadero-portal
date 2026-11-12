// Testimonials featured on the homepage. Only add reviews where the client
// ticked "can share my review on the website and social media"
// (reviews.use_for_advertising = true). Names are first name + last initial.
export type Testimonial = { quote: string; name: string; rating: number }

export const FEATURED_TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'Garrett was professional and very accommodating to our requests! He made our event flow well and provided the needed lift and atmosphere! The music was great and he bolstered the vibe in our event expertly! Highly recommend!',
    name: 'Todd W.',
    rating: 5,
  },
]
