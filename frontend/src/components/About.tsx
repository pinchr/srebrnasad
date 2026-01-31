import './About.css'

export default function About() {
  return (
    <section className="about">
      <div className="container">
        <h2>O nas</h2>
        <div className="about-grid">
          <div className="about-card">
            <h3>🌳 Nasz Sad</h3>
            <p>
              Znajdujący się w Srebrnej, Naruszewo, nasz sad od pokoleń uprawia świeże, 
              pyszne jabłka. Stosujemy zrównoważone metody uprawy, aby zapewnić 
              najwyższą jakość owoców.
            </p>
          </div>
          <div className="about-card">
            <h3>🍎 Jabłka Najwyższej Jakości</h3>
            <p>
              Uprawiamy wiele odmian jabłek, każdą wybraną ze względu na jej unikalny 
              smak i wartość odżywczą. Wszystkie nasze jabłka są zbierane świeże i 
              dostarczane do Ciebie.
            </p>
          </div>
          <div className="about-card">
            <h3>👨‍🌾 Tradycja Rodzinna</h3>
            <p>
              Nasza rodzina uprawia ziemię w Naruszewie od dziesięcioleci. Łączymy 
              tradycyjną wiedzę z nowoczesnymi technikami uprawy, aby zapewnić Ci 
              najlepsze jabłka.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
