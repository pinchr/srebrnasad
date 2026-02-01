import { useState } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import About from './components/About'
import Location from './components/Location'
import Gallery from './components/Gallery'
import Order from './components/Order'
import Contact from './components/Contact'
import AdminPanel from './components/AdminPanel'
import Footer from './components/Footer'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'gallery' | 'order' | 'contact' | 'admin'>('home')

  return (
    <div className="app">
      {currentPage !== 'admin' && <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />}
      
      {currentPage === 'home' && (
        <>
          <Hero setCurrentPage={setCurrentPage} />
          <About />
          <Location />
        </>
      )}
      
      {currentPage === 'gallery' && <Gallery />}
      {currentPage === 'order' && <Order />}
      {currentPage === 'contact' && <Contact />}
      {currentPage === 'admin' && <AdminPanel setCurrentPage={setCurrentPage} />}
      
      {currentPage !== 'admin' && <Footer setCurrentPage={setCurrentPage} />}
    </div>
  )
}

export default App
