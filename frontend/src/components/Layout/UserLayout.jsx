import React from 'react'
import { Outlet } from 'react-router-dom'
import Footer from '../Common/Footer'
import Header from '../Common/Header'
import Navbar from '../Common/Navbar'
import Neko from '../Common/Neko'

const UserLayout = () => {


  return (
    <>

        <Navbar />


      <main>
        <Outlet />
      </main>

      <Footer />
      <Neko />
    </>
  )
}

export default UserLayout