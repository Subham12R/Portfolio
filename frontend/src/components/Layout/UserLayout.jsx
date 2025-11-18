import React from 'react'
import { Outlet } from 'react-router-dom'
import Footer from '../Common/Footer'
import Header from '../Common/Header'
import Navbar from '../Common/Navbar'
import GoToTop from '../Common/GoToTop'
import Neko from '../Common/Neko'

const UserLayout = () => {


  return (
    <>

        <Navbar />


      <main>
        <Outlet />
      </main>

      <Footer />
      <GoToTop />
      <Neko />
    </>
  )
}

export default UserLayout