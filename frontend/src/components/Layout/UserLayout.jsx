import React from 'react'
import { Outlet } from 'react-router-dom'
import Footer from '../Common/Footer'
import Header from '../Common/Header'
import Navbar from '../Common/Navbar'
import Neko from '../Common/Neko'
import { usePreloader } from '../../contexts/PreloaderContext'

const UserLayout = () => {
  const { isPreloaderComplete } = usePreloader()

  return (
    <>
      {isPreloaderComplete && <Navbar />}

      <main>
        <Outlet />
      </main>

      <Footer />
      {isPreloaderComplete && <Neko />}
    </>
  )
}

export default UserLayout