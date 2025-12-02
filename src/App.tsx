import './App.css'
import { BrainDumpInput } from './components/BrainDumpInput'
import { OutputBox } from './components/OutputBox'

function App() {

  return (
    <>
    <div className='space-y-10'>
      <BrainDumpInput  isProcessing={false} ></BrainDumpInput>
      <OutputBox output="Your output here"></OutputBox>
    </div>
    </>
  )
}

export default App
