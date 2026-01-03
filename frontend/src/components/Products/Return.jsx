import { HugeiconsIcon } from "@hugeicons/react"
import {ArrowLeft01Icon} from "@hugeicons/core-free-icons"
import { Link } from "react-router-dom"

export const Return = () => {
  return (
    <div className='w-full mb-4 flex'>
        <Link to="/" ><span className="w-full gap-1 flex justify-center items-center text-zinc-400 text-sm"><HugeiconsIcon icon={ArrowLeft01Icon} size={14} /> Return to Home.</span ></Link>
    </div>
  )
}
