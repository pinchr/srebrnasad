import { useState } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import About from './components/About'
import Gallery from './components/Gallery'
import Contact from './components/Contact'
import Footer from './components/Footer'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'gallery' | 'contact'>('home')

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
      {currentPage === 'contact' && <Contact />}
      
      <Footer />
    </div>
  )
}

export default App
