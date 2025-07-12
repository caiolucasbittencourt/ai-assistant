import './index.css'
import { FormSection } from './components/FormSection'
import logo from './assets/logo.png'

function App() {
  return (
    <>
      <header>
        <img src={logo} alt="Logo sports NLW" />
      </header>

      <main>
        <FormSection />
      </main>
    </>
  )
}

export default App