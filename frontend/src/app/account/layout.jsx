import FooterPage from '@/components/Footer';
import Navbar from '@/components/Navbar';
import React from 'react'

const AccountLayout = ({children}) => {
  return (
    <>
      <Navbar />
      {children}
      <FooterPage />
    </>
  )
}

export default AccountLayout;