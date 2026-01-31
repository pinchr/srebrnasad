import { useState } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import About from './components/About'
import Gallery from './components/Gallery'
import Order from './components/Order'
import Contact from './components/Contact'
import Footer from './components/Footer'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'gallery' | 'order' | 'contact'>('home')

  return (
    <div className="app">
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      {currentPage === 'home' && (
        <>
          <Hero />
          <About />
        </>
      )}
      
      {currentPage === 'gallery' && <Gallery />}
      {currentPage === 'order' && <Order />}
      {currentPage === 'contact' && <Contact />}
      
      <Footer />
    </div>
  )
}

export default App
