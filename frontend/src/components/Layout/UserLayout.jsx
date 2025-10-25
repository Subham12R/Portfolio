import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Footer from '../Common/Footer'
import Header from '../Common/Header'
import Navbar from '../Common/Navbar'
import GoToTop from '../Common/GoToTop'

const UserLayout = () => {
  const location = useLocation()
  const isHomePage = location.pathname === '/'

  return (
    <>
      {isHomePage ? (
        <Header />
      ) : (
        <Navbar />
      )}

      <main>
        <Outlet />
      </main>

      <Footer />
      <GoToTop />
    </>
  )
}

export default UserLayout