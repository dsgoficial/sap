import React, { useState, useEffect } from 'react'

const BackgroundImages = ({ children }) => {

  const [image, setImage] = useState('')

  useEffect(() => {
    const images = ['img-1.jpg', 'img-2.jpg', 'img-3.jpg', 'img-4.jpg', 'img-5.jpg']
    const randomNumber = Math.floor(Math.random() * images.length)
    setImage(`${process.env.PUBLIC_URL}/${images[randomNumber]}`)
  }, [])

  return (
    <div
      sx={{
        background: {
          position: 'fixed',
          width: '100vw',
          height: '100vh',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundAttachment: 'fixed'
        }
      }}
      style={image ? { backgroundImage: `url(${image})` } : null}>
      {children}
    </div>
  )
}

export default BackgroundImages
