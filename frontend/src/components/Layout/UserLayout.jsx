import React from 'react'
import { Outlet } from 'react-router-dom'
import Footer from '../Common/Footer'
import Header from '../Common/Header'
import Navbar from '../Common/Navbar'
import GoToTop from '../Common/GoToTop'

const UserLayout = () => {


  return (
    <>

        <Navbar />


      <main>
        <Outlet />
      </main>

      <Footer />
      <GoToTop />
    </>
  )
}

export default UserLayout