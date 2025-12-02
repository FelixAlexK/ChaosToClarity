

export function OutputBox({ output }: { output: string }) {

  return (
    <div className="w-full max-w-4xl h-80 mx-auto border border-gray-300 rounded-lg p-4 bg-gray-50">
      <p className="text-left">
        {output}
      </p>
    </div>
  )


}