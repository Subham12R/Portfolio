import React from 'react'
import { Outlet } from 'react-router-dom'
import Footer from '../Common/Footer'
import Header from '../Common/Header'
import Navbar from '../Common/Navbar'
import GoToTop from '../Common/GoToTop'
import Neko from '../Common/Neko'
import ScrollProgress from '../Common/ScrollProgress'

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
      <ScrollProgress />
    </>
  )
}

export default UserLayout