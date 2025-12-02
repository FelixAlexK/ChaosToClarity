import { useState } from 'react';
import './App.css'
import { BrainDumpInput } from './components/BrainDumpInput'
import { OutputBox } from './components/OutputBox'
import { sendBrainDumpToGemini } from './services/gemini';

function App() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [output, setOutput] = useState("");
  const handleBrainDumpSubmit = async (content: string) => {
    try {
      setIsProcessing(true);
      sendBrainDumpToGemini(content).then((response) => {
        console.log("AI Response:", response);
        setOutput(JSON.stringify(response, null, 2));
        setIsProcessing(false);
      });
    } catch (error) {
      console.error("Error processing brain dump:", error);
      setIsProcessing(false);
    }
  }

  return (
    <>
    <div className='space-y-10'>
      <BrainDumpInput onSubmit={handleBrainDumpSubmit}   isProcessing={isProcessing} ></BrainDumpInput>
      <OutputBox output={output}></OutputBox>
    </div>
    </>
  )
}

export default App
