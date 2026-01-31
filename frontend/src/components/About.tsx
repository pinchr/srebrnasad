import './About.css'

export default function About() {
  return (
    <section className="about">
      <div className="container">
        <h2>About Us</h2>
        <div className="about-grid">
          <div className="about-card">
            <h3>🌳 Our Orchard</h3>
            <p>
              Located in Srebrna, Naruszewo, our orchard has been growing fresh, 
              delicious apples for generations. We use sustainable farming practices 
              to ensure the highest quality fruit.
            </p>
          </div>
          <div className="about-card">
            <h3>🍎 Quality Apples</h3>
            <p>
              We grow multiple varieties of apples, each selected for their unique 
              taste and nutritional value. All our apples are picked fresh and 
              delivered to your door.
            </p>
          </div>
          <div className="about-card">
            <h3>👨‍🌾 Family Tradition</h3>
            <p>
              Our family has been farming in Naruszewo for decades. We combine 
              traditional knowledge with modern farming techniques to bring you 
              the best apples.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
