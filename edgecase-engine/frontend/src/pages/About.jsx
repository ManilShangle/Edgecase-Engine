import React from 'react'

export default function About(){
  // About page has been removed; redirect to the technical overview.
  if (typeof window !== 'undefined') window.location.replace('/how-it-works')
  return null
}
